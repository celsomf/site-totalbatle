import { expect, it } from 'vitest';
import { DEFAULT_TROOPS } from '../src/data/troops';
import { MONSTER_CATALOG_SEED } from '../server/monster-catalog-seed';
import { getGameCatalog } from '../server/gameCatalog';
import { removeEnemyTroopProfileEntries } from '../src/domain/ownTroops';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import { buildDispatchedTroops } from '../src/utils/combatSimulator';
import { DEFAULT_CAPTAINS } from '../src/data/captains';
import type { MonsterTarget, TroopUnit } from '../src/types';

it('não semeia Berserker no quartel e mantém a ficha inimiga conferida', () => {
  expect(DEFAULT_TROOPS.some(unit => unit.id === 'berserker')).toBe(false);
  expect(MONSTER_CATALOG_SEED.find(unit => unit.id === 'demonio_chifres')).toMatchObject({ isEnemy: true, unitAttack: 720, unitHealth: 2160, leadership: 8 });
});

it('API não entrega Berserker como próprio mesmo se uma base antiga ainda tiver o registro', async () => {
  const db = { query: async (sql: string) => ({ rows: sql.includes('FROM troop_catalog') ? [{ id: 'berserker' }, { id: 'emerald_dragon' }]
    : sql.includes('FROM monster_units') ? [{ id: 'demonio_chifres', isEnemy: true }] : [] }) };
  const result = await getGameCatalog(db as never);
  expect(result.troops.map(unit => unit.id)).toEqual(['emerald_dragon']);
  expect(result.monsters.map(unit => unit.id)).toEqual(['demonio_chifres']);
});

it('cópia antiga não devolve estoque, desbloqueio ou atributos do inimigo ao quartel', () => {
  const original = { ...createCleanProfile('test'), ownedTroopCounts: { berserker: 500, s1_spy: 351 }, unlockedTroopIds: ['berserker', 's1_spy'], customTroopStats: { berserker: { attack: 720, health: 2160 } } };
  const cleaned = removeEnemyTroopProfileEntries(original);
  expect(cleaned.ownedTroopCounts).toEqual({ s1_spy: 351 });
  expect(cleaned.unlockedTroopIds).toEqual(['s1_spy']);
  expect(cleaned.customTroopStats).toEqual({});
  expect(original.ownedTroopCounts.berserker).toBe(500);
});

it('recomendador ignora Berserker mesmo se receber uma lista antiga diretamente', () => {
  const enemyAsOwn: TroopUnit = { id: 'berserker', name: 'Cadastro incorreto', category: 'monster', tier: 3, troopClass: 'melee', baseAttack: 720, baseHealth: 2160, leadershipCost: 8, ownedCount: 500, isUnlocked: true, revivalSilverCost: 450 };
  const target: MonsterTarget = { id: 'test', name: 'Teste', type: 'common_monster', attackMode: 'common', level: 1, totalHealth: 1, baseAttack: 1, squadCount: 1, weaknessClasses: [], estimatedValorPoints: 0, estimatedChestPoints: 0, estimatedCaptainXP: 0, enemySquads: [{ id: 'enemy', name: 'Inimigo', tier: 1, family: 'inferno', troopClass: 'melee', count: 1, unitAttack: 1, unitHealth: 1, leadership: 1, initiative: 1 }] };
  expect(buildDispatchedTroops([enemyAsOwn], { ...createCleanProfile('test'), specialCapacity: 4000 }, target, DEFAULT_CAPTAINS[0], false)).toEqual([]);
});
