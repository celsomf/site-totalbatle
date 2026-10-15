import type { PlayerProfile } from '../types';

/** Desfaz somente uma reserva ativa. Repetir a operação não devolve tropas novamente. */
export function cancelMarch(profile: PlayerProfile, marchId: string): PlayerProfile {
  const march = profile.activeMarches?.find((entry) => entry.id === marchId);
  if (!march) return profile;

  const ownedTroopCounts = { ...profile.ownedTroopCounts };
  for (const squad of march.squads) {
    ownedTroopCounts[squad.unitId] = (ownedTroopCounts[squad.unitId] || 0) + squad.count;
  }

  return {
    ...profile,
    ownedTroopCounts,
    activeMarches: profile.activeMarches?.filter((entry) => entry.id !== marchId),
    attackHistory: (profile.attackHistory || []).filter((entry) => entry.id !== marchId),
  };
}
