import { expect, it } from 'vitest';
import { reconcileLegacySpy } from '../src/domain/legacyTroops';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';

it('preserva o total canônico confirmado, sem somar a cópia antiga', () => {
  const original = { ...createCleanProfile('test'), ownedTroopCounts: { s1_spy: 351, s1_assassin: 3, g1_heavy: 351, m5_titan: 81 },
    unlockedTroopIds: ['s1_assassin', 's1_spy'] };
  const result = reconcileLegacySpy(original);
  expect(result.ownedTroopCounts).toEqual({ s1_spy: 351, g1_heavy: 351, m5_titan: 81 });
  expect(result.unlockedTroopIds).toEqual(['s1_spy']);
  expect(original.ownedTroopCounts.s1_assassin).toBe(3);
  expect(reconcileLegacySpy(result)).toBe(result);
});

it('não inventa equivalência quando ainda não existe Espião no estoque', () => {
  const original = { ...createCleanProfile('test'), ownedTroopCounts: { s1_assassin: 3 }, unlockedTroopIds: ['s1_assassin'] };
  expect(reconcileLegacySpy(original)).toBe(original);
});

it('retira somente a duplicação Heavy confirmada para o perfil principal', () => {
  const original = { ...createCleanProfile('main_profile'), ownedTroopCounts: { s1_spy: 351, g1_heavy: 351, m5_titan: 80 }, unlockedTroopIds: ['g1_heavy', 's1_spy'] };
  const result = reconcileLegacySpy(original);
  expect(result.ownedTroopCounts).toEqual({ s1_spy: 351, m5_titan: 80 });
  expect(result.unlockedTroopIds).toEqual(['s1_spy']);
  expect(original.ownedTroopCounts.g1_heavy).toBe(351);
  expect(reconcileLegacySpy(result)).toBe(result);
  const other = { ...original, id: 'another_profile' };
  expect(reconcileLegacySpy(other)).toBe(other);
  const changed = { ...original, ownedTroopCounts: { ...original.ownedTroopCounts, g1_heavy: 350 } };
  expect(reconcileLegacySpy(changed)).toBe(changed);
});

it('retira o Titã 81 autorizado sem mudar Espiões, outras tropas ou histórico', () => {
  const original = { ...createCleanProfile('main_profile'), ownedTroopCounts: { s1_spy: 351, m5_titan: 81, g1_melee: 200 }, unlockedTroopIds: ['s1_spy', 'm5_titan', 'g1_melee'], customTroopStats: { m5_titan: { attack: 10, health: 20 } } };
  const result = reconcileLegacySpy(original);
  expect(result.ownedTroopCounts).toEqual({ s1_spy: 351, g1_melee: 200 });
  expect(result.unlockedTroopIds).toEqual(['s1_spy', 'g1_melee']);
  expect(result.customTroopStats).toEqual({});
  expect(result.activeMarches).toBe(original.activeMarches);
  expect(result.attackHistory).toBe(original.attackHistory);
  expect(original.ownedTroopCounts.m5_titan).toBe(81);
  expect(reconcileLegacySpy(result)).toBe(result);
  const other = { ...original, id: 'another_profile' };
  expect(reconcileLegacySpy(other)).toBe(other);
});
