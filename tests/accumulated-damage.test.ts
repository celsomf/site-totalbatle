import { expect, it } from 'vitest';
import { applySquadDamage } from '../src/domain/squadDamage';
import { simulateCombat } from '../src/utils/combatSimulator';
import type { DispatchedTroop } from '../src/utils/combatSimulator';
import type { EnemySquadUnit } from '../src/types';

it('permite zero mortes e preserva excedente após morte no golpe seguinte', () => {
  const first = applySquadDamage({ currentCount: 3, unitHealth: 100, residualDamage: 0 }, 60);
  expect(first).toEqual({ currentCount: 3, residualDamage: 60, casualties: 0 });
  const second = applySquadDamage({ ...first, unitHealth: 100 }, 70);
  expect(second).toEqual({ currentCount: 2, residualDamage: 30, casualties: 1 });
  expect(applySquadDamage({ ...second, unitHealth: 100 }, 70)).toEqual({ currentCount: 1, residualDamage: 0, casualties: 1 });
});

it('não mata sem dano e limita baixas ao estoque vivo em sobrecarga', () => {
  const squad = { currentCount: 2, unitHealth: 100, residualDamage: 0 };
  expect(applySquadDamage(squad, 0)).toEqual({ currentCount: 2, residualDamage: 0, casualties: 0 });
  expect(applySquadDamage(squad, 999)).toEqual({ currentCount: 0, residualDamage: 0, casualties: 2 });
});

const mercenary: DispatchedTroop = { id: 'merc', name: 'Mercenário', tier: 5, troopClass: 'melee', category: 'mercenary', isMercenary: true, count: 1, unitAttack: 1418, unitHealth: 3780 };
const ghoul: EnemySquadUnit = { id: 'carnical', name: 'Carniçal', tier: 1, troopClass: 'melee', family: 'undead', count: 93, unitAttack: 28, unitHealth: 84, leadership: 1, initiative: 10 };

it('o mercenário3780HP não sobrevive à soma dos golpes do caso93 Carniçais', () => {
  const result = simulateCombat([mercenary], [ghoul]);
  expect(result.outcome).toBe('DEFEAT');
  expect(result.playerCasualties[0].survivingCount).toBe(0);
  expect(result.rounds.some(step => step.isEnemyAttacking && step.casualties === 0)).toBe(true);
  expect(result.rounds.some(step => step.isEnemyAttacking && step.casualties === 1)).toBe(true);
});

it('acumula dano nos inimigos e reduz o ataque dos sobreviventes após baixas', () => {
  const result = simulateCombat([{ ...mercenary, count: 2, unitAttack: 30, unitHealth: 100 }], [{ ...ghoul, count: 2, unitAttack: 30, unitHealth: 100 }]);
  const enemyHits = result.rounds.filter(step => step.isEnemyAttacking);
  const playerHits = result.rounds.filter(step => !step.isEnemyAttacking);
  expect(playerHits.some(step => step.casualties > 0)).toBe(true);
  expect(enemyHits.some(step => step.casualties > 0)).toBe(true);
  expect(enemyHits.some(step => step.attackerCount === 1 && step.damageDealt === 30)).toBe(true);
  expect(playerHits.some(step => step.attackerCount === 1 && step.damageDealt === 30)).toBe(true);
});

it('saúde restante inclui dano parcial e cada nova simulação começa limpa', () => {
  const troops = [{ ...mercenary, unitAttack: 1, unitHealth: 100 }];
  const enemies = [{ ...ghoul, count: 1, unitAttack: 0, unitHealth: 100 }];
  const result = simulateCombat(troops, enemies);
  expect(result.remainingEnemyHp).toBe(90);
  expect(result.playerCasualties[0].lostCount).toBe(0);
  expect(result.enemyCasualties[0].lostCount).toBe(0);
  expect(simulateCombat(troops, enemies)).toEqual(result);
  expect(enemies[0].unitHealth).toBe(100);
});
