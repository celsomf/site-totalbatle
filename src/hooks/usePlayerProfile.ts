import { useState, useEffect, useRef } from 'react';
import { PlayerProfile, TroopUnit } from '../types';
import { DEFAULT_TROOPS } from '../data/troops';
import { fetchProfileFromDb, saveProfileToDb, checkDbHealth } from '../services/api';

const STORAGE_KEY = 'total_battle_player_profile_v4'; // Bump version key to guarantee fresh load in user's browser

const DEFAULT_PROFILE: PlayerProfile = {
  heroId: 'garvel',
  heroName: 'Araning',
  heroLevel: 16,
  includeHero: true,
  capitolLevel: 16,
  dragonLevel: 15,
  maxMarchCapacity: 3125,
  mercenaryCapacity: 1540,
  specialCapacity: 770,
  selectedCaptainId: 'brunhild',
  selectedCaptainIds: ['brunhild', 'xi_guiying', 'aydae'],
  captainLevels: {
    brunhild: 25,
    xi_guiying: 23,
    aydae: 23,
    farhad: 20,
    alexander: 20,
    bernard: 20,
    carter: 30,
    cleopatra: 25,
  },
  unlockedTroopIds: DEFAULT_TROOPS.map((t) => t.id),
  ownedTroopCounts: {
    g1_ranged: 580,
    g2_ranged: 1797,
    g1_melee: 1369,
    g2_melee: 1799,
    g2_mounted: 523,
    g1_siege: 137,
    g1_heavy: 351,
    s1_assassin: 3,
    m3_golem: 5,
    m3_specter: 104,
    m3_beast: 12,
    m5_titan: 81,
  },
  customTroopStats: {},
  academyBonus: {
    guardsmenAttack: 25,
    guardsmenHealth: 20,
    specialistsAttack: 15,
    specialistsHealth: 10,
    monstersAttack: 20,
    monstersHealth: 20,
  },
};

export function usePlayerProfile() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          captainLevels: { ...DEFAULT_PROFILE.captainLevels, ...(parsed.captainLevels || {}) },
          ownedTroopCounts: { ...DEFAULT_PROFILE.ownedTroopCounts, ...(parsed.ownedTroopCounts || {}) },
          academyBonus: { ...DEFAULT_PROFILE.academyBonus, ...(parsed.academyBonus || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 1. Initial load from PostgreSQL if available
  useEffect(() => {
    async function loadFromPostgres() {
      const health = await checkDbHealth();
      if (health.db === 'connected') {
        setDbStatus('connected');
        const dbProfile = await fetchProfileFromDb();
        if (dbProfile) {
          setProfile((prev) => ({
            ...prev,
            ...dbProfile,
            captainLevels: { ...prev.captainLevels, ...(dbProfile.captainLevels || {}) },
            ownedTroopCounts: { ...prev.ownedTroopCounts, ...(dbProfile.ownedTroopCounts || {}) },
            academyBonus: { ...prev.academyBonus, ...(dbProfile.academyBonus || {}) },
          }));
        }
      } else {
        setDbStatus('offline');
      }
    }
    loadFromPostgres();
  }, []);

  // 2. Persist to LocalStorage instantly & debounced to PostgreSQL
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const saved = await saveProfileToDb(profile);
      setDbStatus(saved ? 'connected' : 'offline');
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [profile]);

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateCaptainLevel = (captainId: string, level: number) => {
    setProfile((prev) => ({
      ...prev,
      captainLevels: {
        ...prev.captainLevels,
        [captainId]: level,
      },
    }));
  };

  const toggleTroopUnlocked = (troopId: string) => {
    setProfile((prev) => {
      const exists = prev.unlockedTroopIds.includes(troopId);
      const newUnlocked = exists
        ? prev.unlockedTroopIds.filter((id) => id !== troopId)
        : [...prev.unlockedTroopIds, troopId];
      return { ...prev, unlockedTroopIds: newUnlocked };
    });
  };

  const updateTroopOwnedCount = (troopId: string, count: number) => {
    setProfile((prev) => ({
      ...prev,
      ownedTroopCounts: {
        ...prev.ownedTroopCounts,
        [troopId]: Math.max(0, count),
      },
    }));
  };

  const updateTroopCustomStat = (troopId: string, attack: number, health: number) => {
    setProfile((prev) => ({
      ...prev,
      customTroopStats: {
        ...prev.customTroopStats,
        [troopId]: { attack, health },
      },
    }));
  };

  const addCustomTroop = (newTroop: TroopUnit) => {
    setProfile((prev) => {
      const existingCustom = prev.customTroops || [];
      const updatedCustom = [...existingCustom.filter((t) => t.id !== newTroop.id), newTroop];
      const updatedOwned = { ...prev.ownedTroopCounts, [newTroop.id]: newTroop.ownedCount };
      const updatedUnlocked = prev.unlockedTroopIds.includes(newTroop.id)
        ? prev.unlockedTroopIds
        : [...prev.unlockedTroopIds, newTroop.id];
      return {
        ...prev,
        customTroops: updatedCustom,
        ownedTroopCounts: updatedOwned,
        unlockedTroopIds: updatedUnlocked,
      };
    });
  };

  const removeCustomTroop = (troopId: string) => {
    setProfile((prev) => {
      const updatedCustom = (prev.customTroops || []).filter((t) => t.id !== troopId);
      const { [troopId]: _, ...remainingOwned } = prev.ownedTroopCounts;
      const updatedUnlocked = prev.unlockedTroopIds.filter((id) => id !== troopId);
      return {
        ...prev,
        customTroops: updatedCustom,
        ownedTroopCounts: remainingOwned,
        unlockedTroopIds: updatedUnlocked,
      };
    });
  };

  const getHydratedTroops = (): TroopUnit[] => {
    const allTroops = [...DEFAULT_TROOPS, ...(profile.customTroops || [])];
    return allTroops.map((t) => {
      const isUnlocked = profile.unlockedTroopIds.includes(t.id);
      const custom = profile.customTroopStats[t.id];
      const owned = profile.ownedTroopCounts[t.id] !== undefined ? profile.ownedTroopCounts[t.id] : t.ownedCount;
      return {
        ...t,
        isUnlocked,
        ownedCount: owned,
        customAttack: custom?.attack !== undefined ? custom.attack : t.baseAttack,
        customHealth: custom?.health !== undefined ? custom.health : t.baseHealth,
      };
    });
  };

  const toggleSelectCaptain = (captainId: string) => {
    setProfile((prev) => {
      const current = prev.selectedCaptainIds || [prev.selectedCaptainId || 'brunhild'];
      if (current.includes(captainId)) {
        const next = current.filter((id) => id !== captainId);
        return {
          ...prev,
          selectedCaptainIds: next.length > 0 ? next : [captainId],
          selectedCaptainId: next[0] || captainId,
        };
      } else {
        let next: string[];
        if (current.length < 3) {
          next = [...current, captainId];
        } else {
          next = [current[0], current[1], captainId];
        }
        return {
          ...prev,
          selectedCaptainIds: next,
          selectedCaptainId: next[0],
        };
      }
    });
  };

  const resetToDefaults = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
    saveProfileToDb(DEFAULT_PROFILE);
  };

  return {
    profile,
    dbStatus,
    updateProfile,
    updateCaptainLevel,
    toggleSelectCaptain,
    toggleTroopUnlocked,
    updateTroopOwnedCount,
    updateTroopCustomStat,
    getHydratedTroops,
    addCustomTroop,
    removeCustomTroop,
    resetToDefaults,
  };
}
