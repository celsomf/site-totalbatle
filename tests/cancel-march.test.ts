import { describe, expect, it } from 'vitest';
import { cancelMarch } from '../src/domain/cancelMarch';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import type { ActiveMarch } from '../src/types';

const march: ActiveMarch = {
  id: 'mistake', targetId: 'target', targetName: 'Alvo de teste', targetLevel: 1,
  createdAt: '2026-10-15T15:00:00Z', captainId: 'aydae', captainName: 'Aydae', captainLevel: 1,
  dragonSent: false, enemySquads: [],
  squads: [
    { unitId: 'g1_melee', unitName: 'Lanceiro I', count: 150 },
    { unitId: 'm3_golem', unitName: 'Golem', count: 3 },
  ],
};

describe('Remover reserva de marcha', () => {
  const profile = () => ({
    ...createCleanProfile('cancel_test'),
    ownedTroopCounts: { g1_melee: 20, untouched: 9 },
    activeMarches: [march, { ...march, id: 'other' }],
    attackHistory: [
      { ...march, status: 'in_progress' as const },
      { ...march, id: 'other', status: 'in_progress' as const },
      { ...march, id: 'completed', status: 'completed' as const, actualDeaths: [] },
    ],
  });

  it('restitui exatamente as reservas sem alterar outras marchas ou o histórico concluído', () => {
    const original = profile();
    const result = cancelMarch(original, 'mistake');
    expect(result.ownedTroopCounts).toEqual({ g1_melee: 170, m3_golem: 3, untouched: 9 });
    expect(result.activeMarches).toEqual([original.activeMarches[1]]);
    expect(result.attackHistory).toEqual(original.attackHistory.slice(1));
    expect(original.ownedTroopCounts.g1_melee).toBe(20);
    expect(result.attackHistory?.some((entry) => entry.id === 'mistake')).toBe(false);
  });

  it('não devolve tropas duas vezes ao repetir o cancelamento', () => {
    const result = cancelMarch(profile(), 'mistake');
    expect(cancelMarch(result, 'mistake')).toBe(result);
  });

  it('preserva as duas devoluções quando duas marchas são removidas em sequência', () => {
    const result = cancelMarch(cancelMarch(profile(), 'mistake'), 'other');
    expect(result.ownedTroopCounts.g1_melee).toBe(320);
    expect(result.ownedTroopCounts.m3_golem).toBe(6);
    expect(result.activeMarches).toEqual([]);
    expect(result.attackHistory?.map((entry) => entry.id)).toEqual(['completed']);
  });

  it('não altera o estoque ao remover ID inexistente ou ataque já concluído', () => {
    const original = profile();
    expect(cancelMarch(original, 'unknown')).toBe(original);
    expect(cancelMarch(original, 'completed')).toBe(original);
    expect(cancelMarch({ ...original, activeMarches: undefined }, 'mistake').ownedTroopCounts).toEqual(original.ownedTroopCounts);
  });
});
