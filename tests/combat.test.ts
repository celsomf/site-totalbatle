import { describe, it, expect } from 'vitest';
import { simulateCombat } from '../src/engine/combat';
import { MarchSquadAllocation, MonsterTarget, Captain } from '../src/types';

describe('Engine: Combat Simulation & Damage Resolution', () => {
  const mockMonster: MonsterTarget = {
    id: 'tinman',
    name: 'Tinman',
    type: 'epic_monster',
    level: 15,
    totalHealth: 280000,
    baseAttack: 18000,
    squadCount: 4,
    weaknessClasses: ['ranged'],
    estimatedValorPoints: 45000,
    estimatedChestPoints: 120,
    estimatedCaptainXP: 35000,
  };

  const mockCaptain: Captain = {
    id: 'aydae',
    name: 'Aydae',
    level: 30,
    specialty: 'monsters',
    monsterAttackBonusPercent: 35,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 20,
    description: 'Monster hunter',
    avatarIcon: 'Sword',
  };

  const mockSquads: MarchSquadAllocation[] = [
    // 9 Fodder stacks
    ...Array.from({ length: 9 }).map((_, i) => ({
      unitId: `g1_fodder_${i}`,
      unitName: 'Espadachim Recruta (G1)',
      tier: 1,
      category: 'guardsman' as const,
      troopClass: 'melee' as const,
      count: 25,
      role: 'fodder' as const,
      totalSquadHealth: 4500,
      totalSquadAttack: 1200,
      expectedLosses: 0,
    })),
    // 1 Core Damage Squad
    {
      unitId: 'g4_ranged',
      unitName: 'Franco-atirador Real (G4)',
      tier: 4,
      category: 'guardsman' as const,
      troopClass: 'ranged' as const,
      count: 4000,
      role: 'primary_damage' as const,
      totalSquadHealth: 10000000,
      totalSquadAttack: 4400000,
      expectedLosses: 0,
    },
  ];

  it('protects core damage squads from initial monster strike using fodder', () => {
    const result = simulateCombat(mockSquads, mockCaptain, mockMonster);
    expect(result.victory).toBe(true);
    expect(result.combatRounds).toBeGreaterThan(0);
    // Core damage squad (G4) should have 0 losses
    const g4Squad = result.resolvedSquads.find((s) => s.role === 'primary_damage');
    expect(g4Squad?.expectedLosses).toBe(0);
  });
});
