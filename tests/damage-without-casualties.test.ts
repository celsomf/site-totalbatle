import { describe, expect, it } from 'vitest';
import { simulateCombat } from '../src/utils/combatSimulator';
import type { DispatchedTroop } from '../src/utils/combatSimulator';
import type { EnemySquadUnit } from '../src/types';

// Synthetic attributes. The screenshots do not provide the real effective health or bonuses.
const player: DispatchedTroop = { id: 'player', name: 'Grupo hipotético', tier: 3, troopClass: 'ranged',
  count: 20, unitAttack: 2100, unitHealth: 15000 };
const enemy: EnemySquadUnit = { id: 'enemy', name: 'Inimigo hipotético', tier: 1, family: 'inferno',
  troopClass: 'melee', count: 500, unitAttack: 28, unitHealth: 84, initiative: 1, leadership: 1 };

describe('Golpe com dano positivo e nenhuma morte', () => {
  it('permite receber 14.000 e vencer sem perdas quando a vida hipotética por unidade é maior', () => {
    const result = simulateCombat([player], [enemy]);
    expect(result.outcome).toBe('VICTORY');
    expect(result.safetyLevel).toBe('CLEAN_VICTORY');
    expect(result.rounds[0].isEnemyAttacking).toBe(true);
    expect(result.rounds[0].damageDealt).toBe(14000);
    expect(result.rounds[0].casualties).toBe(0);
    expect(result.playerCasualties[0].survivingCount).toBe(20);
    expect(result.enemyCasualties[0].survivingCount).toBe(0);
  });

  it('não força mortes em nenhum dos lados quando o golpe é menor que a vida de uma unidade', () => {
    const result = simulateCombat([{ ...player, count: 1, unitAttack: 1, unitHealth: 100 }],
      [{ ...enemy, count: 1, unitAttack: 1, unitHealth: 100 }]);
    expect(result.outcome).toBe('DEFEAT');
    expect(result.rounds.some((step) => step.isEnemyAttacking)).toBe(true);
    expect(result.rounds.some((step) => !step.isEnemyAttacking)).toBe(true);
    expect(result.rounds.every((step) => step.damageDealt === 1 && step.casualties === 0)).toBe(true);
  });

  it('mantém mortes quando o dano atinge a vida de uma unidade', () => {
    const result = simulateCombat([{ ...player, unitHealth: 14000 }], [enemy]);
    expect(result.rounds[0].damageDealt).toBe(14000);
    expect(result.rounds[0].casualties).toBe(1);
    expect(result.playerCasualties[0].lostCount).toBeGreaterThanOrEqual(1);
  });
});
