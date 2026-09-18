import { describe, it, expect } from 'vitest';
import { calculateBattleROI } from '../src/engine/roi';
import { MonsterTarget, Captain } from '../src/types';

describe('Engine: ROI & Temple Revival Cost Calculator', () => {
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

  it('calculates ROI metrics including VP, CP, and Temple Silver', () => {
    const roi = calculateBattleROI(mockMonster, mockCaptain, 30, 180, 15);
    expect(roi.projectedValorPoints).toBeGreaterThan(45000);
    expect(roi.projectedChestPoints).toBe(120);
    expect(roi.templeSilverCost).toBe(180 * 15);
  });
});
