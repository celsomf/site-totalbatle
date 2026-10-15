import { expect, it } from 'vitest';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import { DEFAULT_CAPTAINS } from '../src/data/captains';
import { buildDispatchedTroops, simulateCombat } from '../src/utils/combatSimulator';
import type { MonsterTarget, TroopUnit } from '../src/types';

it('retira Elemental dispensável num estoque sintético sem piorar vitória ou perdas especiais', () => {
  const profile = { ...createCleanProfile('synthetic'), maxMarchCapacity: 0, mercenaryCapacity: 0, specialCapacity: 1001 };
  const base: TroopUnit = { id: 'strong', name: 'Strong', category: 'monster', tier: 3, troopClass: 'flying', baseAttack: 1000,
    baseHealth: 10000, ownedCount: 1000, leadershipCost: 1, revivalSilverCost: 0, isUnlocked: true };
  const troops: TroopUnit[] = [base, { ...base, id: 'water_elemental', name: 'Water', troopClass: 'ranged', baseAttack: 1, baseHealth: 1, ownedCount: 1 }];
  const target: MonsterTarget = { id: 'synthetic', name: 'Synthetic', type: 'common_monster', attackMode: 'common', level: 1,
    totalHealth: 100, baseAttack: 1, squadCount: 1, weaknessClasses: [], estimatedValorPoints: 0, estimatedCaptainXP: 0, estimatedChestPoints: 0,
    enemySquads: [{ id: 'enemy', name: 'Enemy', tier: 1, troopClass: 'melee', family: 'undead', count: 1, unitAttack: 1, unitHealth: 100, initiative: 10, leadership: 1 }] };
  const sent = buildDispatchedTroops(troops, profile, target, DEFAULT_CAPTAINS.find(unit => unit.id === 'farhad')!, false);
  const result = simulateCombat(sent, target.enemySquads!);
  expect(result.outcome).toBe('VICTORY');
  expect(sent.some(unit => unit.id === 'water_elemental')).toBe(false);
  expect(result.playerCasualties.reduce((sum, unit) => sum + unit.lostCount, 0)).toBe(0);
  for (const unit of sent) expect(unit.count).toBeLessThanOrEqual(troops.find(source => source.id === unit.id)!.ownedCount);
  expect(sent.reduce((sum, unit) => sum + unit.count * (unit.leadershipCost || 1), 0)).toBeLessThanOrEqual(profile.specialCapacity);
});
