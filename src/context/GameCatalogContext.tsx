import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { EnemySquadUnit } from '../types';
import type { GameCatalogData } from '../types/catalog';
import type { MonsterPresetTemplate } from '../data/monsters';
import { buildMonsterTargetFromTemplate } from '../domain/monsterTargets';
import {
  copyMonsterFormationInDb,
  fetchGameCatalogFromDb,
  importLegacyMonsterFormationsToDb,
  saveMonsterFormationToDb,
} from '../services/api';

const LEGACY_FORMATIONS_KEY = 'tba_custom_monster_targets_v1';
const LEGACY_IMPORT_SOURCE_KEY = 'tba_monster_db_migration_source_v1';
const LEGACY_IMPORT_DONE_KEY = 'tba_monster_db_migration_done_v1';

export type RuntimeMonsterTemplate = MonsterPresetTemplate & GameCatalogData['templates'][number];

interface LegacyImportDraft {
  sourceKey: string;
  payload: { entries: Array<Record<string, any>>; rawLegacy?: unknown };
  formationCount: number;
  variantCount: number;
}

interface GameCatalogContextValue {
  loading: boolean;
  error: string | null;
  troops: GameCatalogData['troops'];
  monsters: GameCatalogData['monsters'];
  templates: RuntimeMonsterTemplate[];
  refresh: () => Promise<void>;
  saveFormation: (templateId: string, level: number, squads: EnemySquadUnit[]) => Promise<void>;
  copyFormation: (templateId: string, sourceLevel: number, destinationLevels: number[]) => Promise<number>;
  legacyFormationCount: number;
  legacyVariantCount: number;
  legacyImporting: boolean;
  legacyImportResult: { imported: number; skipped: number; unresolved: string[] } | null;
  importLegacyFormations: () => Promise<{ imported: number; skipped: number; unresolved: string[] }>;
  legacyImportDone: boolean;
}

const GameCatalogContext = createContext<GameCatalogContextValue | null>(null);

function readLegacyImportDraft(): LegacyImportDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_FORMATIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    let sourceKey = window.localStorage.getItem(LEGACY_IMPORT_SOURCE_KEY);
    if (!sourceKey) {
      sourceKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '')
        : `browser_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(LEGACY_IMPORT_SOURCE_KEY, sourceKey);
    }

    const entries: Array<Record<string, any>> = [];
    let variantCount = 0;
    for (const [targetId, rawEntry] of Object.entries(parsed as Record<string, any>)) {
      let variants: Array<Record<string, any>> = [];
      let activeVariantId: string | undefined;
      if (Array.isArray(rawEntry)) {
        variants = rawEntry.length ? [{ id: 'legacy_1', name: 'Equipe 1', squads: rawEntry }] : [];
        activeVariantId = variants[0]?.id;
      } else if (Array.isArray(rawEntry?.variants)) {
        variants = rawEntry.variants.filter((variant: any) => Array.isArray(variant?.squads));
        activeVariantId = rawEntry.activeVariantId;
      }
      if (variants.length === 0) continue;
      variantCount += variants.length;
      entries.push({ targetId, variants, activeVariantId, original: rawEntry });
    }

    return {
      sourceKey,
      payload: { entries, rawLegacy: parsed },
      formationCount: entries.length,
      variantCount,
    };
  } catch (error) {
    console.error('Não foi possível preparar os dados antigos de formações para importação.', error);
    return null;
  }
}

function hydrateTemplates(data: GameCatalogData): RuntimeMonsterTemplate[] {
  return data.templates.map((row) => {
    const levelsByNumber = new Map(row.levels.map((level) => [level.level, level]));
    const templateBase = row as unknown as Omit<RuntimeMonsterTemplate, 'generateSquads' | 'calculateRewards' | 'marchCapacities'>;
    return {
      ...templateBase,
      faction: row.faction as RuntimeMonsterTemplate['faction'],
      generateSquads: (level) => levelsByNumber.get(level)?.squads || [],
      calculateRewards: (level) => {
        const targetLevel = levelsByNumber.get(level) || levelsByNumber.get(row.defaultLevel);
        return {
          xp: targetLevel?.xpReward || 0,
          vp: targetLevel?.valorReward || 0,
          tar: targetLevel?.tarReward,
          chest: targetLevel?.chestReward,
        };
      },
      marchCapacities: (level) => {
        const targetLevel = levelsByNumber.get(level) || levelsByNumber.get(row.defaultLevel);
        return targetLevel?.marchCapacities || { guards: 0, mercenaries: 0, monsters: 0 };
      },
    };
  });
}

export const GameCatalogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<GameCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legacyDraft, setLegacyDraft] = useState<LegacyImportDraft | null>(() => readLegacyImportDraft());
  const automaticLegacyImportAttempted = useRef(false);
  const [legacyImporting, setLegacyImporting] = useState(false);
  const [legacyImportResult, setLegacyImportResult] = useState<{ imported: number; skipped: number; unresolved: string[] } | null>(null);
  const [legacyImportDone, setLegacyImportDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return window.localStorage.getItem(LEGACY_IMPORT_DONE_KEY) === 'true'; } catch { return false; }
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await fetchGameCatalogFromDb();
      if (catalog.troops.length === 0 || catalog.monsters.length === 0 || catalog.templates.length === 0) {
        throw new Error('O banco está acessível, mas o catálogo do Total Battle ainda não foi importado.');
      }
      setData(catalog);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar os dados do banco.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const templates = useMemo(() => (data ? hydrateTemplates(data) : []), [data]);

  const saveFormation = useCallback(async (templateId: string, level: number, squads: EnemySquadUnit[]) => {
    const targetId = `${templateId}_lvl_${level}`;
    await saveMonsterFormationToDb(targetId, squads);
    const nextData = await fetchGameCatalogFromDb();
    setData(nextData);
  }, []);

  const copyFormation = useCallback(async (templateId: string, sourceLevel: number, destinationLevels: number[]) => {
    const sourceTargetId = `${templateId}_lvl_${sourceLevel}`;
    const destinationTargetIds = destinationLevels.map((level) => `${templateId}_lvl_${level}`);
    const copied = await copyMonsterFormationInDb(sourceTargetId, destinationTargetIds);
    const nextData = await fetchGameCatalogFromDb();
    setData(nextData);
    return copied;
  }, []);

  const importLegacyFormations = useCallback(async () => {
    const draft = legacyDraft || readLegacyImportDraft();
    if (!draft) throw new Error('Não foram encontrados dados locais válidos para importar.');
    setLegacyImporting(true);
    try {
      const result = await importLegacyMonsterFormationsToDb(draft.sourceKey, draft.payload);
      const summary = { imported: result.imported, skipped: result.skipped, unresolved: result.unresolved };
      setLegacyImportResult(summary);
      try { window.localStorage.setItem(LEGACY_IMPORT_DONE_KEY, 'true'); } catch { /* storage unavailable */ }
      setLegacyImportDone(true);
      const nextData = await fetchGameCatalogFromDb();
      setData(nextData);
      setLegacyDraft(draft);
      return summary;
    } finally {
      setLegacyImporting(false);
    }
  }, [legacyDraft]);

  useEffect(() => {
    if (!import.meta.env.DEV || loading || error || !legacyDraft || legacyImportDone || automaticLegacyImportAttempted.current) return;
    automaticLegacyImportAttempted.current = true;
    void importLegacyFormations().catch((importError) => {
      console.error('A migração automática das formações antigas falhou; os dados locais foram mantidos.', importError);
    });
  }, [error, importLegacyFormations, legacyDraft, legacyImportDone, loading]);

  const value = useMemo<GameCatalogContextValue>(() => ({
    loading,
    error,
    troops: data?.troops.map((troop) => ({ ...troop, catalogManaged: true })) || [],
    monsters: data?.monsters || [],
    templates,
    refresh,
    saveFormation,
    copyFormation,
    legacyFormationCount: legacyDraft?.formationCount || 0,
    legacyVariantCount: legacyDraft?.variantCount || 0,
    legacyImporting,
    legacyImportResult,
    importLegacyFormations,
    legacyImportDone,
  }), [data, error, importLegacyFormations, legacyDraft, legacyImportDone, legacyImportResult, legacyImporting, loading, refresh, saveFormation, templates, copyFormation]);

  return <GameCatalogContext.Provider value={value}>{children}</GameCatalogContext.Provider>;
};

export function useGameCatalog() {
  const context = useContext(GameCatalogContext);
  if (!context) throw new Error('useGameCatalog deve ser usado dentro de GameCatalogProvider.');
  return context;
}

export { buildMonsterTargetFromTemplate };
