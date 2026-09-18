import { describe, it, expect } from 'vitest';
import { calculateFodderStacks, allocateMarchSquads } from '../src/engine/stacking';
import { TroopUnit, MonsterTarget, Captain, PlayerProfile } from '../src/types';

describe('Engine: Stacking & Fodder Allocation (2n+1 Rule)', () => {
  const mockTroops: TroopUnit[] = [
    {
      id: 'g1_melee',
      name: 'Espadachim Recruta (G1)',
      category: 'guardsman',
      tier: 1,
      troopClass: 'melee',
      baseAttack: 45,
      baseHealth: 160,
      customAttack: 50,
      customHealth: 180,
      ownedCount: 1369,
      revivalSilverCost: 15,
      leadershipCost: 1,
      isUnlocked: true,
    },
    {
      id: 'g4_ranged',
      name: 'Franco-atirador Real (G4)',
      category: 'guardsman',
      tier: 4,
      troopClass: 'ranged',
      baseAttack: 840,
      baseHealth: 1950,
      customAttack: 1100,
      customHealth: 2500,
      ownedCount: 1797,
      revivalSilverCost: 320,
      leadershipCost: 1,
      isUnlocked: true,
    },
  ];

  const mockCaptain: Captain = {
    id: 'aydae',
    name: 'Aydae',
    level: 23,
    specialty: 'monsters',
    monsterAttackBonusPercent: 28,
    cryptTarReductionPercent: 0,
    marchSpeedBonusPercent: 15,
    description: 'Monster specialist',
    avatarIcon: 'Sword',
  };

  const mockMonster: MonsterTarget = {
    id: 'tinman',
    name: 'Tinman',
    type: 'epic_monster',
    level: 15,
    totalHealth: 280000,
    baseAttack: 18000,
    squadCount: 4, // 2n+1 = 9 fodder stacks
    weaknessClasses: ['ranged'],
    estimatedValorPoints: 45000,
    estimatedChestPoints: 120,
    estimatedCaptainXP: 35000,
  };

  const mockProfile: PlayerProfile = {
    heroLevel: 16,
    dragonLevel: 15,
    capitolLevel: 16,
    maxMarchCapacity: 75000,
    mercenaryCapacity: 1540,
    specialCapacity: 0,
    selectedCaptainId: 'aydae',
    captainLevels: { aydae: 23 },
    unlockedTroopIds: ['g1_melee', 'g4_ranged'],
    ownedTroopCounts: { g1_melee: 1369, g4_ranged: 1797 },
    customTroopStats: {},
    academyBonus: {
      guardsmenAttack: 30,
      guardsmenHealth: 20,
      specialistsAttack: 0,
      specialistsHealth: 0,
      monstersAttack: 0,
      monstersHealth: 0,
    },
  };

  it('calculates 2n+1 fodder stacks for epic monsters', () => {
    const fodderSquads = calculateFodderStacks(mockTroops, mockMonster);
    // For squadCount = 4, 2n+1 = 9 fodder stacks
    expect(fodderSquads.length).toBe(9);
    fodderSquads.forEach((stack) => {
      expect(stack.role).toBe('fodder');
      expect(stack.tier).toBe(1);
      expect(stack.count).toBeGreaterThan(0);
    });
  });

  it('allocates primary damage dealers to target monster weaknesses', () => {
    const march = allocateMarchSquads(mockProfile, mockTroops, mockCaptain, mockMonster);
    expect(march.squads.length).toBeGreaterThan(0);
    const damageSquad = march.squads.find((s) => s.role === 'primary_damage');
    expect(damageSquad).toBeDefined();
    expect(damageSquad?.troopClass).toBe('ranged'); // Tinman is weak to ranged
    expect(march.totalMarchSize).toBeLessThanOrEqual(mockProfile.maxMarchCapacity);
  });
});
