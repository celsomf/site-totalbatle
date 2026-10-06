import React, { useState, useMemo, useEffect } from 'react';
import {
  MonsterTarget,
  TroopClass,
  AttackMode,
  EnemySquadUnit,
  TroopUnit,
  PlayerProfile,
  Captain,
} from '../types';
import { buildMonsterTargetFromTemplate, updateMonsterTarget } from '../domain/monsterTargets';
import { useGameCatalog } from '../context/GameCatalogContext';
import { findOptimalFarmLevel, buildDispatchedTroops, simulateCombat } from '../utils/combatSimulator';
import { DEFAULT_CAPTAINS } from '../data/captains';
import { EditSquadsModal } from './EditSquadsModal';
import { TroopAvatar } from './TroopAvatar';
import {
  Skull,
  Swords,
  Crown,
  Flame,
  Edit3,
  Heart,
  Shield,
  Users,
  Save,
  RotateCcw,
  Check,
  ChevronRight,
  Compass,
  Zap,
  Trash2,
  ShieldAlert,
  Copy,
  Database,
  Plus,
} from 'lucide-react';

interface MonsterSelectorProps {
  selectedMonster: MonsterTarget;
  onSelectMonster: (monster: MonsterTarget) => void;
  compact?: boolean;
  troops?: TroopUnit[];
  profile?: PlayerProfile;
  captain?: Captain;
  sendDragon?: boolean;
}

interface WatchtowerFamily {
  id: string;
  name: string;
  avatarId: string;
  factions: string[];
}

function getMonsterAvatarForSquads(squads: EnemySquadUnit[] | undefined, fallbackId: string): string {
  return squads?.[0]?.id || fallbackId;
}

function estimateMonsterStrength(squads: EnemySquadUnit[]): number {
  if (!squads || squads.length === 0) return 0;
  const attack = squads.reduce((sum, s) => sum + s.unitAttack * s.count, 0);
  const health = squads.reduce((sum, s) => sum + s.unitHealth * s.count, 0);
  return Math.round(attack * 0.75 + health * 0.25);
}

function formatPower(power: number): string {
  if (power >= 1_000_000) {
    return `${(power / 1_000_000).toFixed(1).replace('.0', '')}M`;
  }
  if (power >= 1_000) {
    return `${(power / 1_000).toFixed(1).replace('.0', '')}K`;
  }
  return power.toLocaleString('pt-BR');
}

export const MonsterSelector: React.FC<MonsterSelectorProps> = ({
  selectedMonster,
  onSelectMonster,
  troops,
  profile,
  captain,
  sendDragon,
}) => {
  const { templates, monsters, saveFormation, copyFormation, importLegacyFormations, legacyFormationCount, legacyVariantCount, legacyImportDone, legacyImporting, legacyImportResult } = useGameCatalog();
  const families = useMemo<WatchtowerFamily[]>(() => {
    const unique = new Map<string, WatchtowerFamily>();
    for (const template of templates) {
      const current = unique.get(template.watchtowerFamilyId);
      if (current) {
        if (!current.factions.includes(template.faction)) current.factions.push(template.faction);
      } else {
        unique.set(template.watchtowerFamilyId, {
          id: template.watchtowerFamilyId,
          name: template.watchtowerFamilyName,
          avatarId: template.watchtowerAvatarUnitId,
          factions: [template.faction],
        });
      }
    }
    return Array.from(unique.values());
  }, [templates]);
  const initialTemplate = templates.find((template) => template.id === selectedMonster.id.split('_lvl_')[0]) || templates[0];
  const [activeFamilyId, setActiveFamilyId] = useState<string>(initialTemplate?.watchtowerFamilyId || 'inferno');
  const [activeAttackMode, setActiveAttackMode] = useState<AttackMode>(selectedMonster.attackMode || 'common');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate?.id || '');
  const [monsterLevel, setMonsterLevel] = useState<number>(selectedMonster.level || initialTemplate?.defaultLevel || 1);
  const [isEditingSquads, setIsEditingSquads] = useState<boolean>(false);
  const [showWatchtowerList, setShowWatchtowerList] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);
  const [showCopyLevels, setShowCopyLevels] = useState(false);
  const [copyLevelSelection, setCopyLevelSelection] = useState<number[]>([]);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);
  const [saveFeedbackIsError, setSaveFeedbackIsError] = useState(false);

  useEffect(() => {
    if (!legacyImportResult) return;
    setSaveFeedbackIsError(legacyImportResult.unresolved.length > 0);
    setSaveFeedback(
      legacyImportResult.unresolved.length > 0
        ? `${legacyImportResult.imported} importada(s); ${legacyImportResult.skipped} ignorada(s). ${legacyImportResult.unresolved.length} item(ns) precisam de revisão.`
        : `${legacyImportResult.imported} formação(ões) antiga(s) importada(s); ${legacyImportResult.skipped} ignorada(s).`
    );
  }, [legacyImportResult]);

  const activeFamily = families.find((family) => family.id === activeFamilyId) || families[0];
  const familyTemplates = useMemo(() =>
    templates.filter((template) => template.watchtowerFamilyId === activeFamily?.id),
    [activeFamily?.id, templates]
  );
  const availableModesForFamily = useMemo(() => Array.from(new Set(familyTemplates.map((template) => template.attackMode))), [familyTemplates]);
  const effectiveMode = availableModesForFamily.includes(activeAttackMode) ? activeAttackMode : availableModesForFamily[0] || 'common';
  const modeTemplates = useMemo(() => familyTemplates.filter((template) => template.attackMode === effectiveMode), [familyTemplates, effectiveMode]);
  const currentTemplate = modeTemplates.find((template) => template.id === selectedTemplateId) || modeTemplates[0] || familyTemplates[0] || templates[0];
  const hasEnemyComposition = Boolean(selectedMonster.enemySquads?.some((squad) => squad.count > 0));

  const fallbackCaptain: Captain = captain || DEFAULT_CAPTAINS[0];
  const optimalFarm = troops && profile && currentTemplate
    ? findOptimalFarmLevel(currentTemplate, troops, profile, fallbackCaptain, sendDragon ?? true)
    : null;
  const currentDispatched = troops && profile
    ? buildDispatchedTroops(troops, profile, selectedMonster, fallbackCaptain, sendDragon ?? true)
    : [];
  const currentSim = hasEnemyComposition && currentDispatched.length > 0
    ? simulateCombat(currentDispatched, selectedMonster.enemySquads || [])
    : null;
  const isCurrentLevelDefeat = currentSim?.outcome === 'DEFEAT';

  const savedLevelsForCurrentTemplate = useMemo(() => currentTemplate
    ? currentTemplate.levels.filter((level) => level.squads.length > 0).map((level) => level.level).sort((a, b) => a - b)
    : [], [currentTemplate]);
  const watchtowerLevels = savedLevelsForCurrentTemplate;
  const quickPills = useMemo(() => Array.from(new Set([...savedLevelsForCurrentTemplate, monsterLevel])).sort((a, b) => a - b), [monsterLevel, savedLevelsForCurrentTemplate]);
  const displayedWatchtowerLevels = filterSavedOnly ? watchtowerLevels : Array.from({ length: 45 }, (_, index) => index + 1);
  const watchtowerRowItems = useMemo(() => displayedWatchtowerLevels.map((level) => ({
    key: `${level}`,
    level,
    isSaved: true,
    target: buildMonsterTargetFromTemplate(currentTemplate, level),
  })), [currentTemplate, displayedWatchtowerLevels]);

  const currentLevelRecord = currentTemplate?.levels.find((level) => level.level === monsterLevel);
  const isCustomSaved = (currentLevelRecord?.squads.length || 0) > 0;
  const getMonsterAvatarPath = (unitId: string) =>
    monsters.find((monster) => monster.id === unitId)?.avatarPath || `/assets/monsters/${unitId}_avatar.png`;

  useEffect(() => {
    if (currentTemplate) {
      onSelectMonster(buildMonsterTargetFromTemplate(currentTemplate, monsterLevel));
    }
  }, [currentTemplate, monsterLevel]);

  if (!currentTemplate || !activeFamily) return null;

  const handleFamilyChange = (familyId: string) => {
    setActiveFamilyId(familyId);
    const templatesInFamily = templates.filter((template) => template.watchtowerFamilyId === familyId);
    const chosen = templatesInFamily.find((template) => template.attackMode === activeAttackMode) || templatesInFamily[0];
    if (!chosen) return;
    setSelectedTemplateId(chosen.id);
    setActiveAttackMode(chosen.attackMode);
    setMonsterLevel(chosen.defaultLevel);
    setFilterSavedOnly(false);
    setShowWatchtowerList(true);
    onSelectMonster(buildMonsterTargetFromTemplate(chosen, chosen.defaultLevel));
  };

  const handleModeChange = (mode: AttackMode) => {
    const chosen = familyTemplates.find((template) => template.attackMode === mode)
      || templates.find((template) => template.attackMode === mode);
    if (!chosen) return;
    setActiveFamilyId(chosen.watchtowerFamilyId);
    setActiveAttackMode(mode);
    setSelectedTemplateId(chosen.id);
    setMonsterLevel(chosen.defaultLevel);
    setFilterSavedOnly(false);
    setShowWatchtowerList(true);
    onSelectMonster(buildMonsterTargetFromTemplate(chosen, chosen.defaultLevel));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setMonsterLevel(template.defaultLevel);
    onSelectMonster(buildMonsterTargetFromTemplate(template, template.defaultLevel));
  };

  const handleLevelChange = (level: number) => {
    const validLevel = Math.max(1, Math.min(45, Math.floor(level)));
    setMonsterLevel(validLevel);
    onSelectMonster(buildMonsterTargetFromTemplate(currentTemplate, validLevel));
  };

  const handleSaveFormation = async (squads: EnemySquadUnit[] = selectedMonster.enemySquads || []) => {
    await saveFormation(currentTemplate.id, monsterLevel, squads);
    onSelectMonster(updateMonsterTarget(selectedMonster, squads));
    setSaveFeedbackIsError(false);
    setSaveFeedback(`Formação do nível ${monsterLevel} salva no banco.`);
  };

  const handleSaveFormationSafely = async () => {
    try {
      await handleSaveFormation();
    } catch (error) {
      setSaveFeedbackIsError(true);
      setSaveFeedback(error instanceof Error ? error.message : 'Não foi possível salvar a formação no banco.');
    }
  };

  const handleDeleteFormation = async () => {
    if (!isCustomSaved) return;
    if (!window.confirm(`Excluir a formação de ${currentTemplate.name}, nível ${monsterLevel}?`)) return;
    try {
      await handleSaveFormation([]);
      setSaveFeedbackIsError(false);
      setSaveFeedback(`Formação do nível ${monsterLevel} removida.`);
    } catch (error) {
      setSaveFeedbackIsError(true);
      setSaveFeedback(error instanceof Error ? error.message : 'Não foi possível remover a formação do banco.');
    }
  };

  const handleCopyFormation = async () => {
    if (copyLevelSelection.length === 0) {
      setCopyError('Selecione pelo menos um nível de destino.');
      return;
    }
    const overwritten = copyLevelSelection.filter((level) => currentTemplate.levels.find((row) => row.level === level)?.squads.length);
    if (overwritten.length && !window.confirm(`Isso substituirá a formação existente nos níveis ${overwritten.join(', ')}. Continuar?`)) return;
    setIsCopying(true);
    setCopyError(null);
    try {
      await saveFormation(currentTemplate.id, monsterLevel, selectedMonster.enemySquads || []);
      const copied = await copyFormation(currentTemplate.id, monsterLevel, copyLevelSelection);
      setShowCopyLevels(false);
      setCopyLevelSelection([]);
      setSaveFeedback(`Formação copiada para ${copied} nível(is).`);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : 'Não foi possível copiar a formação.');
    } finally {
      setIsCopying(false);
    }
  };

  const handleLegacyImport = async () => {
    setIsMigratingLegacy(true);
    try {
      const result = await importLegacyFormations();
      setSaveFeedbackIsError(result.unresolved.length > 0);
      setSaveFeedback(`${result.imported} formação(ões) importada(s); ${result.skipped} ignorada(s).`);
      if (result.unresolved.length) {
        setSaveFeedback(`${result.imported} importada(s); ${result.skipped} ignorada(s). Confira os monstros sem correspondência na mensagem de erro do navegador.`);
        console.warn('[Migração local de formações] Monstros/alvos sem correspondência:', result.unresolved);
      }
    } catch (error) {
      setSaveFeedbackIsError(true);
      setSaveFeedback(error instanceof Error ? error.message : 'Não foi possível importar os dados locais.');
    } finally {
      setIsMigratingLegacy(false);
    }
  };

  const handleResetToTemplate = async () => handleSaveFormation([]);
  const handleSaveCustomSquads = async (updatedSquads: EnemySquadUnit[]) => handleSaveFormation(updatedSquads);

  const getTroopClassBadge = (tc: TroopClass) => {
    switch (tc) {
      case 'ranged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold bg-blue-950/90 text-blue-300 border border-blue-500/40">
            🏹 Longo Alcance
          </span>
        );
      case 'melee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold bg-rose-950/90 text-rose-300 border border-rose-500/40">
            ⚔️ Corpo a Corpo
          </span>
        );
      case 'mounted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold bg-amber-950/90 text-amber-300 border border-amber-500/40">
            🐎 Montadas
          </span>
        );
      case 'flying':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold bg-purple-950/90 text-purple-300 border border-purple-500/40">
            🦅 Voadores
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg text-2xs font-bold bg-slate-800 text-slate-200">
            {tc}
          </span>
        );
    }
  };

  // Dedicated avatar resolver: prioritizes the FIRST enemy squad unit!
  const monsterAvatarId = getMonsterAvatarForSquads(selectedMonster.enemySquads, currentTemplate.watchtowerAvatarUnitId);
  const monsterAvatar = monsters.find((monster) => monster.id === monsterAvatarId);

  const monsterPowerEstimate = estimateMonsterStrength(selectedMonster.enemySquads || []);

  return (
    <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* 1. Header estilo Torre de Vigia com Abas de Famílias */}
      <div className="space-y-3 border-b border-slate-700/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 shadow-md border border-amber-400/50">
              <Skull className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-wide flex items-center gap-2">
                Torre de Vigia — Alvos do Reino
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Selecione a família de monstros e o nível para calcular a marcha sem perdas
              </span>
            </div>
          </div>

          {/* Sub-abas de Modo / Raridade (Comum, Raro, Épico) */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleModeChange('common')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
                effectiveMode === 'common'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-amber-300" />
              <span>Comum</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('rare')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
                effectiveMode === 'rare'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 ring-2 ring-purple-400/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Raro</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('epic')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
                effectiveMode === 'epic'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black border-amber-200 ring-2 ring-amber-300/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Épico</span>
            </button>
          </div>
        </div>

        {/* Abas de Famílias com Avatares Redondos (Idêntico ao jogo) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {families.map((fam) => {
            const isActive = fam.id === activeFamilyId;
            return (
              <button
                key={fam.id}
                type="button"
                onClick={() => handleFamilyChange(fam.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 text-white border-amber-400/80 ring-2 ring-amber-400/30 shadow-lg'
                    : 'bg-slate-900/70 hover:bg-slate-850 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <TroopAvatar
                  id={fam.avatarId}
                  avatarPath={getMonsterAvatarPath(fam.avatarId)}
                  databaseOnly
                  size="sm"
                  className={`rounded-full shrink-0 ring-1 ${
                    isActive ? 'ring-amber-400 border-amber-400' : 'ring-slate-700 border-slate-700'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-xs font-black truncate ${
                      isActive ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    {fam.name}
                  </span>
                  <span className="text-3xs text-slate-400 block truncate">
                    {fam.factions.includes(currentTemplate.faction) ? 'Selecionada' : 'Ver alvos'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seleção de Variação de Molde (se houver mais de um) + Seletor de Níveis */}
      <div className="space-y-3">
        {modeTemplates.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Variante de Tropa:</span>
            <div className="flex gap-1.5 flex-wrap">
              {modeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-black border transition-all ${
                    tpl.id === currentTemplate.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {tpl.name.replace(/\s*\([^)]*\)/, '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Níveis & Botão Torre de Vigia */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                Nível do Alvo (1 a 45):
              </span>
              <span className="text-xs font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Nv {monsterLevel}
              </span>
              {isCustomSaved && (
                <span className="px-2 py-0.5 rounded text-3xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  <span>Composição Salva</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Botão de alternar lista completa Torre de Vigia */}
              <button
                type="button"
                onClick={() => setShowWatchtowerList(!showWatchtowerList)}
                className={`text-2xs font-black px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
                  showWatchtowerList
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <span>{showWatchtowerList ? 'Ocultar Lista' : 'Ver Todos os Níveis'}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${showWatchtowerList ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Botões - / + para ajuste fino */}
              <button
                type="button"
                onClick={() => handleLevelChange(monsterLevel - 1)}
                disabled={monsterLevel <= 1}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center border border-slate-700"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange(monsterLevel + 1)}
                disabled={monsterLevel >= 45}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center border border-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Level Pills com indicador de Salvo ⭐ */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickPills.map((lvl) => {
              const isSelected = lvl === monsterLevel;
              const isSaved = (currentTemplate.levels.find((row) => row.level === lvl)?.squads.length || 0) > 0;
              const isOptimal = optimalFarm && lvl === optimalFarm.optimalLevel;

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : isSaved
                      ? 'bg-emerald-950/90 text-emerald-300 border-2 border-emerald-500/80 hover:bg-emerald-900 shadow-sm'
                      : isOptimal
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/60 hover:bg-indigo-900'
                      : 'bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500'
                  }`}
                  title={
                    isSaved
                      ? `Nível ${lvl}: Composição personalizada salva`
                      : isOptimal
                      ? `Nível ${lvl}: Nível ótimo de farm seguro`
                      : `Selecionar Nível ${lvl}`
                  }
                >
                  <span>Nv {lvl}</span>
                  {isSaved && <span className="text-3xs text-emerald-400 font-black">★</span>}
                  {isOptimal && !isSelected && !isSaved && <span className="text-3xs text-indigo-300">🛡️</span>}
                </button>
              );
            })}
          </div>

          {/* Dica contextual de Nível Seguro para XP */}
          {hasEnemyComposition && savedLevelsForCurrentTemplate.length > 0 && optimalFarm && optimalFarm.isSafe && optimalFarm.optimalXp > 0 && (
            <div className="pt-0.5">
              {isCurrentLevelDefeat ? (
                <div className="text-2xs font-bold text-rose-300 bg-rose-950/80 border border-rose-800 p-2 rounded-lg flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
                  <span>⚠️ Nv {monsterLevel} causa derrota certa! Recomendado: use Nv {optimalFarm.optimalLevel} para vencer sem perdas.</span>
                  <button
                    type="button"
                    onClick={() => handleLevelChange(optimalFarm.optimalLevel)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-3xs shadow shrink-0 active:scale-95"
                  >
                    Mudar para Nv {optimalFarm.optimalLevel}
                  </button>
                </div>
              ) : monsterLevel < optimalFarm.optimalLevel ? (
                <div className="text-2xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 p-2 rounded-lg flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
                  <span>✓ Nv {monsterLevel} é vitória segura! Seu exército aguenta até o Nv {optimalFarm.optimalLevel} para ganhar mais XP.</span>
                  <button
                    type="button"
                    onClick={() => handleLevelChange(optimalFarm.optimalLevel)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded text-3xs shadow shrink-0 active:scale-95"
                  >
                    Mudar para Nv {optimalFarm.optimalLevel}
                  </button>
                </div>
              ) : (
                <div className="text-2xs font-bold text-amber-300 bg-amber-950/70 border border-amber-800/80 p-2 rounded-lg flex items-center gap-1.5 shadow-sm animate-fadeIn">
                  <span>🎯 Nv {monsterLevel} é o nível máximo recomendado para farmar XP com 0 perdas nobres!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Gaveta da Lista da Torre de Vigia (estilo Imagem 2 do jogo) */}
        {showWatchtowerList && (
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-black text-amber-300 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span>Alvos da Torre de Vigia — {currentTemplate.name.replace(/\s*\([^)]*\)/, '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterSavedOnly(false)}
                  className={`px-2.5 py-1 rounded-lg text-3xs font-black border transition-all ${
                    !filterSavedOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Todos (45)
                </button>

                {savedLevelsForCurrentTemplate.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterSavedOnly(true)}
                    className={`px-2.5 py-1 rounded-lg text-3xs font-black border transition-all flex items-center gap-1 ${
                      filterSavedOnly
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-sm'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                    }`}
                  >
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    <span>Salvos ({savedLevelsForCurrentTemplate.length})</span>
                  </button>
                )}
              </div>
            </div>

            {watchtowerRowItems.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <ShieldAlert className="w-8 h-8 text-amber-400/60 mx-auto" />
                <p className="text-xs font-bold text-slate-300">
                  Nenhum nível salvo ainda para este monstro.
                </p>
                <p className="text-2xs text-slate-400 max-w-sm mx-auto">
                  Selecione o nível desejado acima e cadastre as tropas que você encontrou no jogo para validar a marcha.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {watchtowerRowItems.map((item) => {
                const isSelected = item.level === monsterLevel;
                const power = estimateMonsterStrength(item.target.enemySquads || []);
                const avatar = getMonsterAvatarForSquads(item.target.enemySquads, currentTemplate.watchtowerAvatarUnitId);
                const avatarPath = getMonsterAvatarPath(avatar);

                return (
                  <div
                    key={item.key}
                    onClick={() => handleLevelChange(item.level)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : item.isSaved
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/50 hover:border-emerald-400'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TroopAvatar
                        id={avatar}
                        avatarPath={avatarPath}
                        databaseOnly
                        size="md"
                        levelBadge={item.level}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white truncate">
                            {item.target.name}
                          </span>
                          {item.isSaved && (
                            <span className="px-1.5 py-0.2 rounded text-3xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                              <span>Salvo</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-3xs text-slate-400 mt-1">
                          {power > 0 ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                              🛡️ {formatPower(power)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              ⚠️ Não cadastrado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLevelChange(item.level);
                      }}
                      className={`text-2xs font-black px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : item.isSaved
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                      }`}
                    >
                      {isSelected ? 'Ativo' : (power > 0 ? 'Ir (Go)' : 'Cadastrar')}
                    </button>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Card de Detalhes do Monstro Selecionado (COM APENAS UM AVATAR PROEMINENTE) */}
      <div className="bg-[#0b0f19] border border-slate-700/90 hover:border-amber-500/50 transition-all rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Top Header do Card: Avatar Grande com Escudo de Nível + Título + Status + Botões */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* O ÚNICO avatar em destaque com o escudo de nível sobreposto */}
            <TroopAvatar
              id={monsterAvatarId}
              avatarPath={monsterAvatar?.avatarPath || getMonsterAvatarPath(monsterAvatarId)}
              databaseOnly
              size="xl"
              levelBadge={monsterLevel}
              className="border-2 border-amber-500/60 shadow-xl ring-2 ring-amber-400/20 shrink-0"
            />

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                  {selectedMonster.name}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-lg text-2xs font-extrabold border ${
                    effectiveMode === 'epic'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : effectiveMode === 'rare'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-red-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {effectiveMode === 'epic'
                    ? 'Chefe Épico'
                    : effectiveMode === 'rare'
                    ? 'Monstro Raro'
                    : 'Monstro Comum'}
                </span>

                {isCustomSaved && (
                  <span className="px-2.5 py-0.5 rounded-lg text-2xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 shadow">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    <span>Personalizado (Salvo)</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-2xs font-mono font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  🛡️ Poder: {formatPower(monsterPowerEstimate)}
                </span>
              </div>

              {selectedMonster.description && (
                <p className="text-xs text-slate-400 font-medium line-clamp-2">
                  {selectedMonster.description}
                </p>
              )}

              {/* Badges de Fraqueza */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  Vulnerável a:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedMonster.weaknessClasses.map((w) => (
                    <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação do Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            {/* Botão Atualizar Equipe Atual */}
            <button
              type="button"
              onClick={() => void handleSaveFormationSafely()}
              className={`text-xs font-black px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                isCustomSaved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black border-amber-300 ring-2 ring-amber-400/40'
              }`}
              title="Salvar alterações na equipe atual deste nível"
            >
              <Save className="w-4 h-4" />
              <span>{isCustomSaved ? 'Atualizar formação' : 'Salvar formação'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCopyLevelSelection([]);
                setCopyError(null);
                setShowCopyLevels(true);
              }}
              disabled={!selectedMonster.enemySquads?.length}
              className="text-xs font-black px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-600 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Copiar esta formação para outros níveis do mesmo alvo"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar para níveis</span>
            </button>

            {/* Botão Excluir Equipe Ativa ou Limpar */}
            <button
              type="button"
              onClick={
                isCustomSaved
                  ? handleDeleteFormation
                  : () => {
                      if (selectedMonster.enemySquads && selectedMonster.enemySquads.length > 0) {
                        onSelectMonster({
                          ...selectedMonster,
                          enemySquads: [],
                          totalHealth: 0,
                          baseAttack: 0,
                          squadCount: 0,
                        });
                        setSaveFeedback('Tropas deste nível limpas.');
                        setTimeout(() => setSaveFeedback(null), 3000);
                      }
                    }
              }
              disabled={!isCustomSaved && (!selectedMonster.enemySquads || selectedMonster.enemySquads.length === 0)}
              className="text-xs font-extrabold px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              title={
                isCustomSaved
                  ? `Remover formação do Nível ${monsterLevel}`
                  : "Limpar tropas deste nível"
              }
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Excluir Equipe</span>
            </button>

            {/* Botão Ajustar Composição */}
            <button
              type="button"
              onClick={() => setIsEditingSquads(true)}
              className="text-xs text-amber-300 hover:text-white font-extrabold flex items-center justify-center gap-1.5 transition-all bg-slate-800/90 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-600 hover:border-amber-400 shadow-md active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Editar tropas do alvo</span>
            </button>
          </div>
        </div>

        {/* Feedback visual de salvamento */}
        {saveFeedback && (
          <div className={`${saveFeedbackIsError ? 'bg-rose-950/80 border-rose-500/60 text-rose-200' : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'} border px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-md`}>
            <Check className={`w-4 h-4 ${saveFeedbackIsError ? 'text-rose-300' : 'text-emerald-400'} stroke-[3]`} />
            <span>{saveFeedback}</span>
          </div>
        )}

        {showCopyLevels && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-amber-200">Copiar formação para outros níveis</h4>
                <p className="text-xs text-slate-400">A formação atual será salva e substituirá os níveis que você selecionar.</p>
              </div>
              <button type="button" onClick={() => setShowCopyLevels(false)} className="text-xs text-slate-300 hover:text-white">Fechar</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 45 }, (_, index) => index + 1).filter((level) => level !== monsterLevel).map((level) => (
                <label key={level} className={`px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer ${copyLevelSelection.includes(level) ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-900 text-slate-300 border-slate-700'}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={copyLevelSelection.includes(level)}
                    onChange={(event) => setCopyLevelSelection((levels) => event.target.checked ? [...levels, level].sort((a, b) => a - b) : levels.filter((item) => item !== level))}
                  />
                  Nv {level}
                </label>
              ))}
            </div>
            {copyError && <p role="alert" className="text-xs text-rose-300">{copyError}</p>}
            <button type="button" onClick={() => void handleCopyFormation()} disabled={isCopying || copyLevelSelection.length === 0} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50">
              {isCopying ? 'Copiando…' : `Copiar para ${copyLevelSelection.length} nível(is)`}
            </button>
          </div>
        )}

        {legacyFormationCount > 0 && !legacyImportDone && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2 text-xs text-blue-100">
              <Database className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Encontramos {legacyFormationCount} nível(is) e {legacyVariantCount} formação(ões) antigos neste navegador. Importe a equipe ativa de cada nível para o banco. As demais variantes serão arquivadas.</p>
            </div>
            <button type="button" onClick={() => void handleLegacyImport()} disabled={isMigratingLegacy || legacyImporting} className="shrink-0 rounded-lg border border-blue-300/40 bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-100 disabled:opacity-50">
              {isMigratingLegacy || legacyImporting ? 'Importando…' : 'Importar dados antigos'}
            </button>
          </div>
        )}

        {/* Global Monster Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xs font-bold text-slate-400 block uppercase">Saúde Total Inimiga</span>
              <strong className="text-rose-400 font-mono font-black text-sm">
                {selectedMonster.totalHealth.toLocaleString('pt-BR')}
              </strong>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xs font-bold text-slate-400 block uppercase">Força Total Inimiga</span>
              <strong className="text-amber-300 font-mono font-black text-sm">
                {selectedMonster.baseAttack.toLocaleString('pt-BR')}
              </strong>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xs font-bold text-slate-400 block uppercase">Esquadrões</span>
              <strong className="text-indigo-300 font-mono font-black text-sm">
                {selectedMonster.enemySquads?.length || selectedMonster.squadCount || 1}
              </strong>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xs font-bold text-slate-400 block uppercase">Tropas Inimigas</span>
              <strong className="text-emerald-300 font-mono font-black text-sm">
                {(
                  selectedMonster.enemySquads?.reduce((acc, s) => acc + s.count, 0) || 0
                ).toLocaleString('pt-BR')}{' '}
                un.
              </strong>
            </div>
          </div>
        </div>

        {/* Squad Breakdown Grid with Avatars */}
        {selectedMonster.enemySquads && selectedMonster.enemySquads.length > 0 ? (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-2xs font-extrabold text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Composição dos Esquadrões Inimigos ({selectedMonster.enemySquads.length}):</span>
              </span>
              <span className="text-slate-400 text-3xs">
                {selectedMonster.enemySquads.length}{' '}
                {selectedMonster.enemySquads.length === 1 ? 'esquadrão no combate' : 'esquadrões no combate'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedMonster.enemySquads.map((sq, idx) => (
                <div
                  key={sq.id || idx}
                  className="bg-[#111827] border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm"
                >
                  <TroopAvatar
                    id={sq.id || sq.name}
                    avatarPath={monsters.find((monster) => monster.id === sq.id)?.avatarPath || sq.avatarUrl}
                    databaseOnly
                    size="md"
                    className="border-amber-500/40 ring-1 ring-black/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white truncate" title={sq.name}>
                        {sq.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-3xs font-black shrink-0">
                        T{sq.tier}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-3xs text-slate-400 mt-1">
                      <span>{getTroopClassBadge(sq.troopClass)}</span>
                      <span>
                        • <strong className="text-white font-mono">{sq.count.toLocaleString('pt-BR')}</strong> un.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-3xs text-slate-400 mt-1 font-mono">
                      <span>⚔️ {(sq.unitAttack * sq.count).toLocaleString('pt-BR')}</span>
                      <span>🩸 {(sq.unitHealth * sq.count).toLocaleString('pt-BR')}</span>
                    </div>

                    {sq.aspects?.description && (
                      <p className="text-3xs text-amber-400/90 truncate mt-1" title={sq.aspects.description}>
                        ✨ {sq.aspects.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="p-4 sm:p-5 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/20 text-center space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-center gap-2">
                  <span>⚠️ Nenhuma composição cadastrada para o Nível {monsterLevel}</span>
                </h4>
                <p className="text-2xs sm:text-xs text-slate-400 max-w-lg mx-auto">
                  As combinações fictícias foram removidas. Adicione os monstros e quantidades reais deste nível que aparecem no seu jogo para salvar e utilizar nas simulações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSquads(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Monstros deste Nível</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Squads Modal */}
      {isEditingSquads && (
        <EditSquadsModal
          isOpen={isEditingSquads}
          onClose={() => setIsEditingSquads(false)}
          initialSquads={selectedMonster.enemySquads || []}
          monsterName={selectedMonster.name}
          monsterLevel={selectedMonster.level}
          onSaveSquads={handleSaveCustomSquads}
          onResetToTemplate={handleResetToTemplate}
        />
      )}
    </div>
  );
};
