import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerProfile, ProfileSummary, TroopUnit } from '../types';
import { DEFAULT_TROOPS } from '../data/troops';
import {
  fetchProfileFromDb,
  saveProfileToDb,
  deleteProfileFromDb,
  fetchProfilesListFromDb,
  checkDbHealth,
} from '../services/api';

const ACTIVE_PROFILE_KEY = 'total_battle_active_profile_id_v2';
const PROFILES_STORAGE_PREFIX = 'total_battle_profile_data_v2_';
const PROFILES_LIST_KEY = 'total_battle_profiles_index_v2';

export const DEMO_TROOP_COUNTS: Record<string, number> = {
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
  emerald_dragon: 133,
  epic_monster_hunter_v: 72,
};

export const createCleanProfile = (
  id: string,
  playerName: string = 'Comandante',
  kingdom: string = 'K:310',
  clanTag: string = ''
): PlayerProfile => ({
  id,
  playerName,
  kingdom,
  clanTag,
  heroId: 'garvel',
  heroName: playerName,
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
  captainStars: {
    brunhild: 1,
    xi_guiying: 1,
    aydae: 1,
    farhad: 1,
    alexander: 1,
    bernard: 1,
    carter: 1,
    cleopatra: 1,
  },
  unlockedTroopIds: DEFAULT_TROOPS.map((t) => t.id),
  ownedTroopCounts: {}, // Tropas zeradas por padrão para novo jogador
  customTroopStats: {},
  customTroops: [],
  academyBonus: {
    guardsmenAttack: 25,
    guardsmenHealth: 20,
    specialistsAttack: 15,
    specialistsHealth: 10,
    monstersAttack: 20,
    monstersHealth: 20,
  },
});

export function usePlayerProfile() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'main_profile';
    } catch {
      return 'main_profile';
    }
  });

  const [availableProfiles, setAvailableProfiles] = useState<ProfileSummary[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_LIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler lista de perfis do localStorage:', e);
    }
    return [
      {
        id: 'main_profile',
        playerName: 'Comandante',
        kingdom: 'K:310',
        clanTag: '',
        capitolLevel: 16,
        heroId: 'garvel',
      },
    ];
  });

  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_STORAGE_PREFIX + activeProfileId);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...createCleanProfile(activeProfileId),
          ...parsed,
          id: activeProfileId,
        };
      }
      // Se for a primeira vez e for main_profile, carregar com demo
      const initial = createCleanProfile('main_profile');
      initial.ownedTroopCounts = DEMO_TROOP_COUNTS;
      return initial;
    } catch (e) {
      console.error('Falha ao carregar perfil inicial:', e);
      return createCleanProfile('main_profile');
    }
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSwitchingProfile = useRef(false);

  const syncWithDb = useCallback(async (isManual = false) => {
    if (isManual) setDbStatus('checking');

    const maxRetries = isManual ? 1 : 3;
    let connected = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const health = await checkDbHealth();
      if (health.db === 'connected') {
        connected = true;
        setDbStatus('connected');

        // Buscar lista de perfis do PostgreSQL
        const dbProfiles = await fetchProfilesListFromDb();
        if (dbProfiles && dbProfiles.length > 0) {
          setAvailableProfiles(dbProfiles);
          localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(dbProfiles));
        }

        // Buscar perfil ativo atual do PostgreSQL
        const dbProfile = await fetchProfileFromDb(activeProfileId);
        if (dbProfile) {
          setProfile((prev) => ({
            ...prev,
            ...dbProfile,
            id: activeProfileId,
            captainLevels: { ...prev.captainLevels, ...(dbProfile.captainLevels || {}) },
            captainStars: { ...(prev.captainStars || {}), ...(dbProfile.captainStars || {}) },
            ownedTroopCounts: { ...(dbProfile.ownedTroopCounts || {}) },
            academyBonus: { ...prev.academyBonus, ...(dbProfile.academyBonus || {}) },
          }));
        }
        break;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!connected) {
      setDbStatus('offline');
    }
  }, [activeProfileId]);

  // 1. Carregamento inicial do PostgreSQL e sincronização de perfis
  useEffect(() => {
    syncWithDb();
  }, [syncWithDb]);

  // 1.1 Polling periódico para reconexão automática quando offline
  useEffect(() => {
    if (dbStatus !== 'offline') return;

    const intervalId = setInterval(async () => {
      const health = await checkDbHealth();
      if (health.db === 'connected') {
        syncWithDb();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [dbStatus, syncWithDb]);

  // 2. Persistir perfil ativo no LocalStorage e PostgreSQL (com debounce)
  useEffect(() => {
    if (isSwitchingProfile.current) {
      isSwitchingProfile.current = false;
      return;
    }

    // Salva perfil no LocalStorage
    try {
      localStorage.setItem(PROFILES_STORAGE_PREFIX + activeProfileId, JSON.stringify(profile));
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);

      // Atualiza índice de perfis no LocalStorage
      setAvailableProfiles((prev) => {
        const index = prev.findIndex((p) => p.id === activeProfileId);
        const updatedSummary: ProfileSummary = {
          id: activeProfileId,
          playerName: profile.playerName || profile.heroName || 'Comandante',
          kingdom: profile.kingdom || 'K:310',
          clanTag: profile.clanTag || '',
          capitolLevel: profile.capitolLevel,
          heroId: profile.heroId,
          updatedAt: new Date().toISOString(),
        };

        let nextList: ProfileSummary[];
        if (index >= 0) {
          nextList = [...prev];
          nextList[index] = updatedSummary;
        } else {
          nextList = [updatedSummary, ...prev];
        }
        localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(nextList));
        return nextList;
      });
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }

    // Debounced save to PostgreSQL
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const saved = await saveProfileToDb(profile, activeProfileId);
      setDbStatus(saved ? 'connected' : 'offline');
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [profile, activeProfileId]);

  // Ações de gerenciamento de perfis
  const switchProfile = useCallback(async (targetId: string) => {
    if (targetId === activeProfileId) return;
    isSwitchingProfile.current = true;
    setActiveProfileId(targetId);
    localStorage.setItem(ACTIVE_PROFILE_KEY, targetId);

    // Tentar carregar do localStorage
    const localData = localStorage.getItem(PROFILES_STORAGE_PREFIX + targetId);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        setProfile({
          ...createCleanProfile(targetId),
          ...parsed,
          id: targetId,
        });
      } catch (e) {
        console.error('Erro ao ler perfil do localStorage:', e);
      }
    } else {
      // Criar limpo se não existir localmente
      setProfile(createCleanProfile(targetId));
    }

    // Tentar buscar do PostgreSQL
    const dbProfile = await fetchProfileFromDb(targetId);
    if (dbProfile) {
      setProfile((prev) => ({
        ...prev,
        ...dbProfile,
        id: targetId,
      }));
    }
  }, [activeProfileId]);

  const createNewProfile = useCallback(async (name: string, kingdom: string = 'K:310', clanTag: string = '') => {
    const cleanName = name.trim() || 'Novo Jogador';
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
    const newProfile = createCleanProfile(slug, cleanName, kingdom.trim() || 'K:310', clanTag.trim());

    // Salva localmente
    localStorage.setItem(PROFILES_STORAGE_PREFIX + slug, JSON.stringify(newProfile));
    localStorage.setItem(ACTIVE_PROFILE_KEY, slug);

    const summary: ProfileSummary = {
      id: slug,
      playerName: cleanName,
      kingdom: newProfile.kingdom,
      clanTag: newProfile.clanTag,
      capitolLevel: newProfile.capitolLevel,
      heroId: newProfile.heroId,
      updatedAt: new Date().toISOString(),
    };

    setAvailableProfiles((prev) => {
      const updated = [summary, ...prev];
      localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveProfileId(slug);
    setProfile(newProfile);

    // Salva no banco
    saveProfileToDb(newProfile, slug);
  }, []);

  const deleteProfile = useCallback(async (profileIdToDelete: string) => {
    if (availableProfiles.length <= 1) {
      alert('Não é possível excluir o único perfil existente. Crie outro perfil antes de excluir este.');
      return;
    }

    // Remove do localStorage
    localStorage.removeItem(PROFILES_STORAGE_PREFIX + profileIdToDelete);

    const remaining = availableProfiles.filter((p) => p.id !== profileIdToDelete);
    setAvailableProfiles(remaining);
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(remaining));

    // Se o perfil excluído era o ativo, muda para o primeiro disponível
    if (activeProfileId === profileIdToDelete) {
      const nextProfile = remaining[0];
      if (nextProfile) {
        switchProfile(nextProfile.id);
      }
    }

    // Remove do PostgreSQL
    await deleteProfileFromDb(profileIdToDelete);
  }, [availableProfiles, activeProfileId, switchProfile]);

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

  const updateCaptainStars = (captainId: string, stars: number) => {
    setProfile((prev) => ({
      ...prev,
      captainStars: {
        ...(prev.captainStars || {}),
        [captainId]: Math.max(1, Math.min(6, stars)),
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

  const addTroop = (newTroop: TroopUnit) => {
    setProfile((prev) => {
      const isCustom = newTroop.id.startsWith('custom_');
      let updatedCustom = prev.customTroops || [];
      if (isCustom) {
        updatedCustom = [...updatedCustom.filter((t) => t.id !== newTroop.id), newTroop];
      }
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

  const removeTroop = (troopId: string) => {
    setProfile((prev) => {
      const isCustom = troopId.startsWith('custom_');
      const updatedCustom = isCustom
        ? (prev.customTroops || []).filter((t) => t.id !== troopId)
        : prev.customTroops;
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
      const owned = profile.ownedTroopCounts[t.id] !== undefined ? profile.ownedTroopCounts[t.id] : 0;
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

  const selectActiveCaptain = (captainId: string) => {
    setProfile((prev) => {
      const current = prev.selectedCaptainIds || [];
      const without = current.filter((id) => id !== captainId);
      const newSelected = [captainId, ...without].slice(0, 3);
      return {
        ...prev,
        selectedCaptainId: captainId,
        selectedCaptainIds: newSelected,
      };
    });
  };

  // Carregar preset de demonstração
  const loadDemoTroops = () => {
    setProfile((prev) => ({
      ...prev,
      ownedTroopCounts: { ...DEMO_TROOP_COUNTS },
    }));
  };

  // Zerar todas as tropas
  const clearAllTroops = () => {
    setProfile((prev) => ({
      ...prev,
      ownedTroopCounts: {},
    }));
  };

  const resetToDefaults = () => {
    const clean = createCleanProfile(activeProfileId, profile.playerName, profile.kingdom, profile.clanTag);
    setProfile(clean);
  };

  return {
    profile,
    activeProfileId,
    availableProfiles,
    dbStatus,
    switchProfile,
    createNewProfile,
    deleteProfile,
    updateProfile,
    updateCaptainLevel,
    updateCaptainStars,
    toggleSelectCaptain,
    selectActiveCaptain,
    toggleTroopUnlocked,
    updateTroopOwnedCount,
    updateTroopCustomStat,
    getHydratedTroops,
    addCustomTroop: addTroop,
    removeCustomTroop: removeTroop,
    addTroop,
    removeTroop,
    loadDemoTroops,
    clearAllTroops,
    resetToDefaults,
    reconnectDb: () => syncWithDb(true),
  };
}

