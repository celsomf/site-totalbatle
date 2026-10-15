import { expect, it } from 'vitest';
import { DEFAULT_TROOPS } from '../src/data/troops';
import { calculateUnitCombatStats, simulateCombat, buildDispatchedTroops } from '../src/utils/combatSimulator';
import { getCaptainCombatBonusForTroop } from '../src/utils/combatCaptainStats';
import { reconcileLegacySpy } from '../src/domain/legacyTroops';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import type { Captain, EnemySquadUnit, MonsterTarget } from '../src/types';

const unit = DEFAULT_TROOPS.find(entry => entry.id === 'epic_monster_hunter_vi')!;
const captain: Captain = { id: 'guard-test', name: 'Teste', specialty: 'pvp', description: '', avatarIcon: '', bonuses: [{ stat: 'strength', label: 'Guardas', target: 'guardsmen', perLevelPercent: 30, starBonusByLevel: [0, 0] }] };

it('usa ficha VI e bônus de guarda sem copiar bônus agregados da conta para a base', () => {
  expect([unit.tier, unit.baseAttack, unit.baseHealth, unit.leadershipCost]).toEqual([6, 2030, 6090, 1]);
  expect(unit.category).toBe('mercenary');
  expect(unit.initiative).toBe(10);
  expect(getCaptainCombatBonusForTroop(captain, 1, 1, unit).strengthPercent).toBe(30);
  const profile = createCleanProfile('test');
  profile.academyBonus = { ...profile.academyBonus, guardsmenAttack: 0, guardsmenHealth: 0 };
  expect(calculateUnitCombatStats(unit, profile, { ...captain, bonuses: [] }, 0, 0)).toEqual({ unitAttack: 2030, unitHealth: 6090 });
});

it('aplica609% somente ao inimigo épico', () => {
  const sent = [{ id: unit.id, name: unit.name, tier: 6, troopClass: unit.troopClass, count: 1, unitAttack: 100, unitHealth: 100000, aspects: unit.aspects }];
  const enemy: EnemySquadUnit = { id: 'enemy', name: 'Enemy', tier: 1, troopClass: 'melee', family: 'cursed', unitAttack: 0, unitHealth: 10000, leadership: 1, initiative: 0, count: 1 };
  const common = simulateCombat(sent, [enemy]);
  const epic = simulateCombat(sent, [{ ...enemy, family: 'epic' }]);
  expect(common.rounds.find(step => !step.isEnemyAttacking)?.damageDealt).toBe(100);
  expect(epic.rounds.find(step => !step.isEnemyAttacking)?.damageDealt).toBe(709);
});

it('reconcilia15 somente uma vez e usa autoridade, mesmo recebendo bônus de guarda', () => {
  const profile = createCleanProfile('main_profile');
  profile.ownedTroopCounts = { epic_monster_hunter_v: 15 };
  profile.unlockedTroopIds = ['epic_monster_hunter_v'];
  const fixed = reconcileLegacySpy(profile);
  expect(fixed.ownedTroopCounts).toEqual({ epic_monster_hunter_vi: 15 });
  expect(reconcileLegacySpy(fixed)).toEqual(fixed);
  fixed.maxMarchCapacity = 0; fixed.mercenaryCapacity = 15; fixed.specialCapacity = 0;
  const target = { id: 'test', name: 'test', type: 'common_monster', attackMode: 'common', enemySquads: [] } as unknown as MonsterTarget;
  const sent = buildDispatchedTroops([{ ...unit, ownedCount: 15 }], fixed, target, captain, false);
  expect(sent.some(entry => entry.id === unit.id)).toBe(true);
  expect(sent.reduce((sum, entry) => sum + entry.count * (entry.leadershipCost || 1), 0)).toBeLessThanOrEqual(15);
});
