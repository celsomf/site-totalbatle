import type { PlayerProfile } from '../types';
import { removeEnemyTroopProfileEntries } from './ownTroops';

/** Retire the invalid legacy entry only when the verified replacement already exists. */
export function reconcileLegacySpy(profile: PlayerProfile): PlayerProfile {
  profile = removeEnemyTroopProfileEntries(profile);
  // Owner's fifteen units were identified in the supplied VI game sheet.
  if (profile.id === 'main_profile' && profile.ownedTroopCounts.epic_monster_hunter_v === 15
    && [undefined, 0, 15].includes(profile.ownedTroopCounts.epic_monster_hunter_vi)
    && !JSON.stringify(profile.activeMarches || []).includes('epic_monster_hunter_v')) {
    const ownedTroopCounts: Record<string, number> = { ...profile.ownedTroopCounts, epic_monster_hunter_vi: 15 };
    const customTroopStats = { ...profile.customTroopStats };
    delete ownedTroopCounts.epic_monster_hunter_v;
    delete customTroopStats.epic_monster_hunter_v;
    profile = { ...profile, ownedTroopCounts, customTroopStats,
      unlockedTroopIds: [...new Set([...profile.unlockedTroopIds.filter(id => id !== 'epic_monster_hunter_v'), 'epic_monster_hunter_vi'])],
      customTroops: profile.customTroops?.filter(unit => unit.id !== 'epic_monster_hunter_v') };
  }
  // Owner explicitly retired the unidentified Titã V 81 entry for this profile.
  if (profile.id === 'main_profile' && profile.ownedTroopCounts.m5_titan === 81
    && !JSON.stringify(profile.activeMarches || []).includes('m5_titan')) {
    const ownedTroopCounts = { ...profile.ownedTroopCounts };
    const customTroopStats = { ...profile.customTroopStats };
    delete ownedTroopCounts.m5_titan;
    delete customTroopStats.m5_titan;
    profile = {
      ...profile,
      ownedTroopCounts,
      customTroopStats,
      unlockedTroopIds: profile.unlockedTroopIds.filter((id) => id !== 'm5_titan'),
      customTroops: profile.customTroops?.filter((troop) => troop.id !== 'm5_titan'),
    };
  }
  // Confirmed by the owner for this profile: Heavy 351 was the same Espião I total.
  // Only retire the exact stale snapshot; never infer equivalence for other profiles/counts.
  if (profile.id === 'main_profile' && profile.ownedTroopCounts.g1_heavy === 351 && profile.ownedTroopCounts.s1_spy === 351
    && !JSON.stringify(profile.activeMarches || []).includes('g1_heavy')) {
    const ownedTroopCounts = { ...profile.ownedTroopCounts };
    delete ownedTroopCounts.g1_heavy;
    profile = { ...profile, ownedTroopCounts, unlockedTroopIds: profile.unlockedTroopIds.filter((id) => id !== 'g1_heavy') };
  }
  const hasOwn = (id: string) => Object.prototype.hasOwnProperty.call(profile.ownedTroopCounts, id);
  if (!hasOwn('s1_spy') || (!hasOwn('s1_assassin') && !profile.unlockedTroopIds.includes('s1_assassin'))) return profile;
  if (JSON.stringify(profile.activeMarches || []).includes('s1_assassin')) return profile;
  const ownedTroopCounts = { ...profile.ownedTroopCounts };
  delete ownedTroopCounts.s1_assassin;
  return {
    ...profile,
    ownedTroopCounts,
    unlockedTroopIds: profile.unlockedTroopIds.filter((id) => id !== 's1_assassin'),
  };
}
