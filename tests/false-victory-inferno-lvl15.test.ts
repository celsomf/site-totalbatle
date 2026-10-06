import { describe, expect, it } from 'vitest';
import type { EnemySquadUnit } from '../src/types';
import { simulateCombat, type DispatchedTroop } from '../src/utils/combatSimulator';

describe('Regressão da derrota real contra a Tropa do Inferno Rara nível 15', () => {
  it('não prevê vitória e estima as baixas observadas no relatório do jogo', () => {
    const dispatched: DispatchedTroop[] = [
      { id: 'swift_marksman', name: 'Atirador Veloz', tier: 5, troopClass: 'ranged', category: 'mercenary', isMercenary: true, count: 54, unitAttack: 1867, unitHealth: 3780, aspects: { bonusVsMeleePercent: 263, bonusVsFlyingPercent: 339 } },
      { id: 'epic_monster_hunter_v', name: 'Caçador de Monstros Épico V', tier: 5, troopClass: 'melee', category: 'mercenary', isMercenary: true, count: 222, unitAttack: 1867, unitHealth: 3780 },
      { id: 'stone_gargoyle', name: 'Gárgula de Pedra', tier: 3, troopClass: 'flying', category: 'monster', count: 43, unitAttack: 9246, unitHealth: 18720, aspects: { bonusVsBeastsPercent: 72, bonusVsMeleePercent: 185 } },
      { id: 'emerald_dragon', name: 'Dragão Esmeralda', tier: 3, troopClass: 'flying', traits: ['dragon'], category: 'monster', count: 42, unitAttack: 8001, unitHealth: 16200, aspects: { bonusVsGiantsPercent: 72, bonusVsMountedPercent: 185 } },
      { id: 'battle_boar', name: 'Javali de Batalha', tier: 3, troopClass: 'mounted', traits: ['beast'], category: 'monster', count: 20, unitAttack: 6934, unitHealth: 14040, aspects: { bonusVsMountedPercent: 144, bonusVsRangedPercent: 113 } },
      { id: 'water_elemental', name: 'Water Elemental', tier: 3, troopClass: 'ranged', traits: ['elemental'], category: 'monster', count: 31, unitAttack: 3378, unitHealth: 6840 },
      { id: 'g1_melee', name: 'Lanceiro I', tier: 1, troopClass: 'melee', category: 'guardsman', count: 150, unitAttack: 91, unitHealth: 180, aspects: { bonusVsMountedPercent: 39, bonusVsBeastsPercent: 80 } },
      { id: 'g2_mounted', name: 'Cavalgante II', tier: 2, troopClass: 'mounted', category: 'guardsman', count: 460, unitAttack: 329, unitHealth: 648, aspects: { bonusVsRangedPercent: 98, bonusVsSiegePercent: 81 } },
      { id: 'g2_ranged', name: 'Arqueiro II', tier: 2, troopClass: 'ranged', category: 'guardsman', count: 677, unitAttack: 165, unitHealth: 324, aspects: { bonusVsMeleePercent: 78, bonusVsFlyingPercent: 101 } },
      { id: 'g2_melee', name: 'Lanceiro II', tier: 2, troopClass: 'melee', category: 'guardsman', count: 566, unitAttack: 165, unitHealth: 324, aspects: { bonusVsMountedPercent: 59, bonusVsBeastsPercent: 120 } },
    ];

    const enemies: EnemySquadUnit[] = [
      {
        id: 'cerbero_demonio', name: 'Cérbero', tier: 5, count: 50, family: 'inferno',
        subType: 'Fera, Demônio, Unidade corpo a corpo', troopClass: 'melee',
        unitAttack: 17000, unitHealth: 51000, leadership: 58, initiative: 10,
        aspects: { bonusVsRangedPercent: 65, bonusVsElementalsPercent: 50 },
      },
      {
        id: 'demonio_chifres', name: 'Demônio com Chifres', tier: 2, count: 880, family: 'inferno',
        subType: 'Demônio, Unidade corpo a corpo', troopClass: 'melee',
        unitAttack: 720, unitHealth: 2160, leadership: 8, initiative: 10,
        aspects: { bonusVsMountedPercent: 40 },
      },
      {
        id: 'demonio', name: 'Demônio', tier: 1, count: 23000, family: 'inferno',
        subType: 'Demônio, Unidade corpo a corpo', troopClass: 'melee',
        unitAttack: 28, unitHealth: 84, leadership: 1, initiative: 10,
        aspects: { bonusVsMountedPercent: 15 },
      },
    ];

    const result = simulateCombat(dispatched, enemies);
    const realEnemyDamage = 4_048 * 84 + 167 * 2_160 + 42 * 51_000;
    const realRemainingEnemyHp = 6_382_800 - realEnemyDamage;
    const predictedPlayerDeaths = result.playerCasualties.reduce((sum, squad) => sum + squad.lostCount, 0);

    expect(result.outcome).toBe('DEFEAT');
    expect(predictedPlayerDeaths).toBe(2_265);
    expect(Math.abs(result.totalPlayerDamage - realEnemyDamage) / realEnemyDamage).toBeLessThan(0.1);
    expect(Math.abs(result.remainingEnemyHp - realRemainingEnemyHp) / realRemainingEnemyHp).toBeLessThan(0.1);
  });
});
