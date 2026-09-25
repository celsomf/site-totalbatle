import { describe, it, expect } from 'vitest';
import { createCleanProfile, DEMO_TROOP_COUNTS } from '../src/hooks/usePlayerProfile';

describe('Multi-Profile Management & Isolation', () => {
  it('should initialize a clean profile with 0 troops and default hero settings', () => {
    const profile = createCleanProfile('player_123', 'LordTest', 'K:999', 'TEST');
    expect(profile.id).toBe('player_123');
    expect(profile.playerName).toBe('LordTest');
    expect(profile.kingdom).toBe('K:999');
    expect(profile.clanTag).toBe('TEST');
    expect(profile.capitolLevel).toBe(16);
    expect(profile.ownedTroopCounts).toEqual({});
    expect(Object.keys(profile.ownedTroopCounts).length).toBe(0);
  });

  it('should have demo troop counts available for quick loading', () => {
    expect(DEMO_TROOP_COUNTS.g1_ranged).toBe(580);
    expect(DEMO_TROOP_COUNTS.g2_ranged).toBe(1797);
    expect(DEMO_TROOP_COUNTS.g1_melee).toBe(1369);
  });
});
