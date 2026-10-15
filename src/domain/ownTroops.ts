import type { PlayerProfile } from '../types';

/** This former recruitable entry represents an enemy; other monster troops remain valid. */
export const ENEMY_ONLY_TROOP_IDS = ['berserker'] as const;
export const isOwnTroop = (unit: { id: string }): boolean => !ENEMY_ONLY_TROOP_IDS.some(id => id === unit.id);

export function removeEnemyTroopProfileEntries(profile: PlayerProfile): PlayerProfile {
  const ids = ENEMY_ONLY_TROOP_IDS;
  if (!ids.some(id => Object.prototype.hasOwnProperty.call(profile.ownedTroopCounts || {}, id)
    || profile.unlockedTroopIds?.includes(id) || profile.customTroopStats?.[id]
    || profile.customTroops?.some(troop => troop.id === id))) return profile;
  const ownedTroopCounts = { ...profile.ownedTroopCounts };
  const customTroopStats = { ...profile.customTroopStats };
  for (const id of ids) { delete ownedTroopCounts[id]; delete customTroopStats[id]; }
  return { ...profile, ownedTroopCounts, customTroopStats,
    unlockedTroopIds: (profile.unlockedTroopIds || []).filter(id => isOwnTroop({ id })),
    customTroops: profile.customTroops?.filter(isOwnTroop) };
}
