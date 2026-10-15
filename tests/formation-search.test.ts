import { describe, expect, it } from 'vitest';
import { buildDispatchedTroops, simulateCombat, findOptimalFarmLevel } from '../src/utils/combatSimulator';
import { createCleanProfile } from '../src/hooks/usePlayerProfile';
import { DEFAULT_CAPTAINS } from '../src/data/captains';
import type { TroopUnit, MonsterTarget } from '../src/types';
import type { MonsterPresetTemplate } from '../src/data/monsters';

const captain = DEFAULT_CAPTAINS.find((entry) => entry.id === 'farhad')!;
const profile = { ...createCleanProfile('search_test'), maxMarchCapacity: 24, mercenaryCapacity: 0, specialCapacity: 0,
  academyBonus: { guardsmenAttack: 0, guardsmenHealth: 0, specialistsAttack: 0, specialistsHealth: 0, monstersAttack: 0, monstersHealth: 0 } };
const unit = (id: string, tier: number, attack: number, health: number, stock: number): TroopUnit => ({
  id, name: id, tier, category: 'guardsman', troopClass: 'ranged', baseAttack: attack, baseHealth: health,
  ownedCount: stock, leadershipCost: 1, isUnlocked: true, revivalSilverCost: 40,
});
const target = (attack = 20): MonsterTarget => ({
  id: 'search_target', name: 'Teste', type: 'common_monster', attackMode: 'common', level: 1,
  totalHealth: 500, baseAttack: attack * 5, squadCount: 1, weaknessClasses: [],
  estimatedValorPoints: 0, estimatedChestPoints: 0, estimatedCaptainXP: 0,
  enemySquads: [{ id: 'enemy', name: 'Inimigo', tier: 1, family: 'undead', troopClass: 'melee', unitAttack: attack, unitHealth: 100, count: 5, initiative: 1, leadership: 1 }],
});

describe('Busca de formação por perdas e nível', () => {
  it('aceita mais perdas baixas para preservar um nível alto, sem usar moeda', () => {
    const troops = [unit('high', 5, 100, 80, 4), unit('low', 1, 10, 24, 20)];
    const sent = buildDispatchedTroops(troops, profile, target(), captain, false);
    const result = simulateCombat(sent, target().enemySquads!);
    const highOnly = simulateCombat([{ ...sent.find((entry) => entry.id === 'high')!, count: 4 }], target().enemySquads!);
    expect(result.outcome).toBe('VICTORY');
    expect(highOnly.outcome).toBe('VICTORY');
    expect(result.playerCasualties.find((entry) => entry.id === 'high')?.lostCount).toBe(0);
    expect(highOnly.playerCasualties.find((entry) => entry.id === 'high')!.lostCount).toBeGreaterThan(0);
    expect(result.playerCasualties.reduce((sum, entry) => sum + entry.lostCount, 0))
      .toBeGreaterThan(highOnly.playerCasualties.reduce((sum, entry) => sum + entry.lostCount, 0));
  });

  it('escolhe vitória sem perdas quando há essa alternativa', () => {
    const troops = [unit('fragile', 1, 100, 1, 4), unit('safe', 5, 500, 1000, 1)];
    const sent = buildDispatchedTroops(troops, profile, target(1), captain, false);
    const result = simulateCombat(sent, target(1).enemySquads!);
    expect(result.outcome).toBe('VICTORY');
    expect(result.safetyLevel).toBe('CLEAN_VICTORY');
    expect(result.playerCasualties.every((entry) => entry.lostCount === 0)).toBe(true);
  });

  it('não inventa vitória ou baixas quando o dano é insuficiente', () => {
    const impossible = { ...target(0), enemySquads: target(0).enemySquads!.map((enemy) => ({ ...enemy, count: 50 })) };
    const sent = buildDispatchedTroops([unit('weak', 1, 1, 1000, 2)], profile, impossible, captain, false);
    const result = simulateCombat(sent, impossible.enemySquads);
    expect(result.outcome).toBe('DEFEAT');
    expect(result.playerCasualties.every((entry) => entry.lostCount === 0)).toBe(true);
    expect(result.enemyCasualties.reduce((sum, entry) => sum + entry.lostCount, 0)).toBeLessThan(50);
  });

  it('respeita estoque, bloqueios, capacidade ponderada e limites explicitamente zerados', () => {
    const troops = [unit('regular', 2, 100, 100, 10),
      { ...unit('merc', 5, 10000, 10000, 10), category: 'mercenary' as const },
      { ...unit('monster', 5, 10000, 10000, 10), category: 'monster' as const },
      { ...unit('locked', 5, 10000, 10000, 10), isUnlocked: false }];
    troops[0].leadershipCost = 3;
    const sent = buildDispatchedTroops(troops, { ...profile, maxMarchCapacity: 7 }, target(), captain, false);
    expect(sent.every((entry) => entry.id === 'regular')).toBe(true);
    expect(sent.reduce((sum, entry) => sum + entry.count * entry.leadershipCost!, 0)).toBeLessThanOrEqual(7);
    expect(sent.every((entry) => Number.isInteger(entry.count) && entry.count <= 10)).toBe(true);
    expect(buildDispatchedTroops(troops, { ...profile, maxMarchCapacity: 0 }, target(), captain, false)).toEqual([]);
  });

  it('confere todas as combinações de um estoque pequeno e preserva o melhor resultado', () => {
    const troops = [unit('a', 4, 100, 80, 3), unit('b', 1, 30, 100, 6)];
    const sent = buildDispatchedTroops(troops, profile, target(), captain, false);
    const result = simulateCombat(sent, target().enemySquads!);
    // Independent oracle for this tiny space: compare victory, high losses, low losses, then sent count.
    const score = (formation: typeof sent) => {
      const sim = simulateCombat(formation, target().enemySquads!);
      return [sim.outcome === 'VICTORY' ? 0 : 1,
        sim.playerCasualties.filter((loss) => loss.tier === 4).reduce((sum, loss) => sum + loss.lostCount, 0),
        sim.playerCasualties.filter((loss) => loss.tier === 1).reduce((sum, loss) => sum + loss.lostCount, 0),
        formation.reduce((sum, entry) => sum + entry.count, 0)];
    };
    expect(result.outcome).toBe('VICTORY');
    const candidates = troops.map((troop) => buildDispatchedTroops([troop], profile, target(), captain, false));
    const allUnits = [...sent, ...candidates.flat()];
    for (let a = 0; a <= 3; a++) for (let b = 0; b <= 6; b++) {
      const formation = [a, b].flatMap((count, index) => count ? [{ ...allUnits.find((entry) => entry.id === troops[index].id)!, count }] : []);
      const compared = score(formation);
      if (compared[0] !== 0) continue;
      const chosen = score(sent);
      const firstDifference = chosen.findIndex((value, index) => value !== compared[index]);
      expect(firstDifference < 0 || chosen[firstDifference] < compared[firstDifference]).toBe(true);
    }
  });

  it('não chama de seguro um nível vencido com perdas', () => {
    const template = { id: 'farm_test', name: 'Teste', attackMode: 'common', targetType: 'common_monster', defaultLevel: 1,
      availableLevels: [1], generateSquads: (level: number) => level === 1 ? target().enemySquads : [],
      calculateRewards: () => ({ xp: 1, vp: 0 }), marchCapacities: () => ({ guards: 24, mercenaries: 0, monsters: 0 }) } as unknown as MonsterPresetTemplate;
    const result = findOptimalFarmLevel(template, [unit('high', 5, 100, 80, 4)], profile, captain, false);
    expect(result.canBeatAnyLevel).toBe(true);
    expect(result.isSafe).toBe(false);
    const defeat = findOptimalFarmLevel(template, [unit('weak', 1, 1, 1, 1)], profile, captain, false);
    expect(defeat.canBeatAnyLevel).toBe(false);
    expect(defeat.isSafe).toBe(false);
  });
});
