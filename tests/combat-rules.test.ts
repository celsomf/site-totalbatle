import { expect, it } from 'vitest';
import { calculateHitDamage, selectDamageTarget, strongestAvailable } from '../src/domain/combatRules';
import { simulateCombat, compareValuableLosses } from '../src/utils/combatSimulator';
import type { CombatSimulationResult, SquadCasualty, EnemySquadUnit } from '../src/types';

it('aspectos somam força-base sem multiplicar novamente os bônus ativos', () => {
  // Inputs derived from the observed hit, not written back to catalog/account.
  expect(calculateHitDamage({ currentCount: 25, baseAttack: 5200, unitAttack: 7982 }, 257)).toBe(533650);
  expect(calculateHitDamage({ currentCount: 1020, baseAttack: 180, unitAttack: 281.7 }, 98)).toBe(467262);
});

it('limita dano útil pela saúde e não escolhe automaticamente maior saúde ou maior aspecto', () => {
  const targets = [{ id: 'small', currentCount: 1, unitHealth: 200, residualDamage: 0, troopClass: 'mounted' as const },
    { id: 'large', currentCount: 1, unitHealth: 5000, residualDamage: 0, troopClass: 'ranged' as const }];
  expect(selectDamageTarget(targets, target => target.id === 'small' ? 3000 : 1000)?.id).toBe('large');
  expect(selectDamageTarget(targets, target => target.id === 'small' ? 199 : 100)?.id).toBe('small');
});

it('escolhe maior força atual, sem ordenar por tier ou aspecto', () => {
  expect(strongestAvailable([{ id: 'high-tier', currentCount: 1, unitAttack: 800 }, { id: 'low-tier', currentCount: 100, unitAttack: 9 }])?.id).toBe('low-tier');
});

it('alterna lados e deixa os grupos restantes atacarem uma vez na rodada', () => {
  const own = [300, 200, 100].map((attack, index) => ({ id: `unit${index}`, name: `unit${index}`, tier: 1, troopClass: 'ranged' as const,
    count: 1, unitAttack: attack, unitHealth: 100000, initiative: 20 }));
  const enemy: EnemySquadUnit = { id: 'enemy', name: 'enemy', tier: 1, troopClass: 'melee', family: 'undead', count: 1, unitAttack: 0, unitHealth: 1000000, leadership: 1, initiative: 10 };
  expect(simulateCombat(own, [enemy]).rounds.slice(0, 4).map(step => step.attackerName)).toEqual(['unit0', 'enemy', 'unit1', 'unit2']);
});

it('prioriza preservar monstros e mercenários antes das baixas regulares, sem pesos monetários', () => {
  const loss = (id: string, category: SquadCasualty['category'], tier: number, lostCount: number): SquadCasualty => ({ id, name: id, category, tier, initialCount: 100, lostCount, survivingCount: 100 - lostCount });
  const result = (losses: SquadCasualty[]) => ({ playerCasualties: losses }) as CombatSimulationResult;
  const expensiveDeath = result([loss('dragon', 'monster', 3, 1), loss('guard', 'guardsman', 3, 0)]);
  const cheaperDeaths = result([loss('dragon', 'monster', 3, 0), loss('guard', 'guardsman', 3, 20)]);
  expect(compareValuableLosses(cheaperDeaths, expensiveDeath)).toBeLessThan(0);
  expect(compareValuableLosses(result([loss('merc', 'mercenary', 6, 0), loss('guard', 'guardsman', 5, 50)]), result([loss('merc', 'mercenary', 6, 1), loss('guard', 'guardsman', 5, 0)]))).toBeLessThan(0);
});
