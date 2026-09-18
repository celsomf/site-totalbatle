import { describe, it, expect } from 'vitest';
import { calculateCryptOneShot } from '../src/engine/crypt';
import { TroopUnit, Captain, PlayerProfile } from '../src/types';

describe('Engine: Crypt 1-Hit KO Optimizer', () => {
  const mockTroops: TroopUnit[] = [
    {
      id: 'g4_ranged',
      name: 'Franco-atirador Real (G4)',
      category: 'guardsman',
      tier: 4,
      troopClass: 'ranged',
      baseAttack: 840,
      baseHealth: 1950,
      customAttack: 1000,
      customHealth: 2000,
      ownedCount: 1797,
      revivalSilverCost: 320,
      leadershipCost: 1,
      isUnlocked: true,
    },
  ];

  const mockCaptain: Captain = {
    id: 'carter',
    name: 'Carter',
    level: 30,
    specialty: 'crypts',
    monsterAttackBonusPercent: 10,
    cryptTarReductionPercent: 30, // 30% tar reduction
    marchSpeedBonusPercent: 25,
    description: 'Crypt specialist',
    avatarIcon: 'Compass',
  };

  const mockProfile: PlayerProfile = {
    heroLevel: 16,
    dragonLevel: 15,
    capitolLevel: 16,
    maxMarchCapacity: 75000,
    mercenaryCapacity: 1540,
    specialCapacity: 0,
    selectedCaptainId: 'carter',
    captainLevels: { carter: 30 },
    unlockedTroopIds: ['g4_ranged'],
    ownedTroopCounts: { g4_ranged: 1797 },
    customTroopStats: {},
    academyBonus: {
      guardsmenAttack: 20,
      guardsmenHealth: 20,
      specialistsAttack: 0,
      specialistsHealth: 0,
      monstersAttack: 0,
      monstersHealth: 0,
    },
  };

  it('calculates 1-hit KO threshold and tar discount for Carter', () => {
    const result = calculateCryptOneShot(mockProfile, mockTroops, mockCaptain, 10);
    expect(result.canOneShot).toBe(true);
    expect(result.requiredAttackPower).toBeGreaterThan(0);
    expect(result.recommendedSquads.length).toBeGreaterThan(0);
    expect(result.tarCost).toBeLessThanOrEqual(70); // Discounter by Carter
  });
});
