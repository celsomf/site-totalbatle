import React, { useMemo, useState } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile, ActiveMarch, AttackHistoryEntry } from '../types';
import { buildMonsterTargetFromTemplate } from '../domain/monsterTargets';
import { useGameCatalog } from '../context/GameCatalogContext';
import { simulateCombat, DispatchedTroop, findOptimalFarmLevel, buildDispatchedTroops } from '../utils/combatSimulator';
import { getCaptainMonsterAttackBonus, getCaptainComputedStats, getHeroAttackBonus } from '../utils/captainStats';
import { TroopAvatar } from './TroopAvatar';
import { BattlePreview } from './BattlePreview';
import {
  Copy,
  Check,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  Swords,
  Shield,
  AlertTriangle,
  XCircle,
  Skull,
  Hammer,
  RotateCw,
} from 'lucide-react';

interface MarchBookViewProps {
  profile: PlayerProfile;
  troops: TroopUnit[];
  captains: Captain[];
  selectedCaptainId?: string;
  onSelectCaptain: (id: string) => void;
  targetMonster: MonsterTarget;
  onUpdateMonsterTarget?: (monster: MonsterTarget) => void;
  onUpdateProfile?: (updates: Partial<PlayerProfile>) => void;
}

export const MarchBookView: React.FC<MarchBookViewProps> = ({
  profile,
  troops,
  captains,
  selectedCaptainId,
  onSelectCaptain,
  targetMonster,
  onUpdateMonsterTarget,
  onUpdateProfile,
}) => {
  const { templates } = useGameCatalog();
  const [copied, setCopied] = useState(false);
  const [sendDragon, setSendDragon] = useState(true);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recalculationVersion, setRecalculationVersion] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [editingReturnMarchId, setEditingReturnMarchId] = useState<string | null>(null);
  const [deathCountDrafts, setDeathCountDrafts] = useState<Record<string, Record<string, string>>>({});
  const activeMarches = profile.activeMarches || [];
  const attackHistory = profile.attackHistory || [];

  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';
  const isEpic = targetMonster.attackMode === 'epic';
  const hasEnemyComposition = Boolean(targetMonster.enemySquads?.some((squad) => squad.count > 0));

  // Capitão Ativo selecionado para a marcha
  const activeCapId = selectedCaptainId || profile.selectedCaptainId || profile.selectedCaptainIds?.[0] || 'farhad';
  const activeCaptain = captains.find((c) => c.id === activeCapId) || captains[0];
  const activeCaptainLevel = profile.captainLevels[activeCaptain.id] || activeCaptain.level || 1;
  const activeCaptainStars = profile.captainStars?.[activeCaptain.id] || activeCaptain.stars || 1;

  // Bônus do Capitão Ativo calculado centralizadamente
  const captainBonusPercent = getCaptainMonsterAttackBonus(
    activeCaptain,
    activeCaptainLevel,
    activeCaptainStars
  );

  const templateId = targetMonster.id.split('_lvl_')[0];
  const currentTemplate =
    templates.find((t) => t.id === templateId) || templates[0];
  const optimalFarm = currentTemplate
    ? findOptimalFarmLevel(currentTemplate, troops, profile, activeCaptain, sendDragon)
    : null;

  const dragonBonusPercent = sendDragon ? 15 : 0;
  const academyBonusPercent = profile.academyBonus?.guardsmenAttack || 25;

  // Capacidades de marcha do perfil do jogador (persistidas no banco)
  const maxGuards = profile.maxMarchCapacity || targetMonster.marchCapacities?.guards || 2000;
  const maxMercs = profile.mercenaryCapacity || targetMonster.marchCapacities?.mercenaries || 1000;
  const maxMonsters = profile.specialCapacity || targetMonster.marchCapacities?.monsters || 500;

  // 1. Preparar unidades enviadas através do motor tático inteligente
  const dispatchedTroopsList = useMemo(() => buildDispatchedTroops(
    troops,
    profile,
    targetMonster,
    activeCaptain,
    sendDragon
  ), [troops, profile, targetMonster, activeCaptain, sendDragon, recalculationVersion]);

  const hasStackedGuardTiers = dispatchedTroopsList.some((troop) =>
    troop.category === 'guardsman' &&
    troop.tier >= 2 &&
    dispatchedTroopsList.some((other) =>
      other.category === 'guardsman' &&
      other.troopClass === troop.troopClass &&
      other.tier >= 2 &&
      other.tier !== troop.tier
    )
  );

  const allocatedGuards = dispatchedTroopsList
    .filter((t) => !t.isMercenary && t.category !== 'monster')
    .reduce((sum, t) => sum + t.count, 0);

  const mercTroops = dispatchedTroopsList.filter((t) => t.isMercenary || t.category === 'mercenary');
  const mercRecommended = mercTroops.reduce((sum, t) => sum + t.count, 0);

  const allocatedMonsters = dispatchedTroopsList
    .filter((t) => t.category === 'monster')
    .reduce((sum, t) => sum + t.count, 0);

  // 2. EXECUTAR SIMULAÇÃO REAL DE COMBATE
  const simResult = useMemo(
    () => simulateCombat(dispatchedTroopsList, targetMonster.enemySquads || []),
    [dispatchedTroopsList, targetMonster.enemySquads, recalculationVersion]
  );
  const isDefeat = hasEnemyComposition && simResult.outcome === 'DEFEAT';
  const g1Casualties = simResult.playerCasualties
    .filter((p) => p.tier === 1)
    .reduce((sum, p) => sum + p.lostCount, 0);
  const t2Casualties = simResult.playerCasualties
    .filter((p) => p.tier >= 2)
    .reduce((sum, p) => sum + p.lostCount, 0);

  // 3. Recompensas recalculadas com os bônus do Capitão Ativo
  const projectedXP = !hasEnemyComposition || isDefeat ? 0 : Math.round((targetMonster.xpReward || 50000) * (1 + activeCaptainLevel * 0.015));
  const projectedVP = !hasEnemyComposition || isDefeat ? 0 : Math.round((targetMonster.valorReward || 18000) * (1 + activeCaptainLevel * 0.01));

  const handleRecalculate = () => {
    if (isRecalculating) return;

    setIsRecalculating(true);
    setRecalculationVersion((version) => version + 1);
    setToastMessage(`Marcha para ${targetMonster.name} recalculada com o estoque e os ajustes atuais.`);
    window.setTimeout(() => setIsRecalculating(false), 400);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  // Lista de capitães para seleção rápida
  const displayedCaptains = (profile.selectedCaptainIds || ['farhad', 'aurora', 'xi_guiying'])
    .map((id) => captains.find((c) => c.id === id))
    .filter(Boolean) as Captain[];

  const handleCopy = () => {
    const leaderText = isRare
      ? `👑 Líder: Herói ${profile.playerName || profile.heroName || 'Comandante'} (Nv ${profile.heroLevel || 16})`
      : `👑 Capitão: ${activeCaptain.name} (Nv ${activeCaptainLevel} - +${captainBonusPercent}% Bônus)`;

    const verdictText = !hasEnemyComposition
      ? '⚠️ SIMULAÇÃO PENDENTE: cadastre as tropas do alvo antes de marchar.'
      : isDefeat
      ? `🚨 ALERTA: DERROTA PREVISTA! Dano insuficiente (${simResult.totalPlayerDamage.toLocaleString('pt-BR')} vs ${simResult.initialEnemyHp.toLocaleString('pt-BR')} HP). NÃO MARCHAR!`
      : simResult.safetyLevel === 'COSTLY_VICTORY'
      ? `⚠️ ATENÇÃO: Vitória com Perda de Nobres (${t2Casualties.toLocaleString('pt-BR')} mortos em T2+)!`
      : `✅ Vitória Confirmada por Simulação (${simResult.safetyLevel === 'CLEAN_VICTORY' ? '0 Baixas' : 'Baixas absorvidas pela bucha G1'})`;

    const regularTroops = dispatchedTroopsList.filter((t) => !t.isMercenary);

    const mercText =
      mercTroops.length > 0
        ? `🔥 MERCENÁRIOS:\n` +
          mercTroops.map((m) => `• ${m.name}: ${m.count.toLocaleString('pt-BR')} un.\n`).join('') +
          `\n`
        : '';

    const armyText =
      regularTroops.length > 0
        ? `⚔️ EXÉRCITO (${allocatedGuards.toLocaleString('pt-BR')} / ${maxGuards.toLocaleString('pt-BR')}):\n` +
          regularTroops
            .map((r) => {
              const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][r.tier - 1] || `${r.tier}`;
              const note = r.tier === 1 ? ' (Absorção de Baixas)' : ' (Dano Principal)';
              return `• [${roman}] ${r.name}: ${r.count.toLocaleString('pt-BR')} un.${note}\n`;
            })
            .join('')
        : '';

    const text =
      `📜 ORDEM DE MARCHA TOTAL BATTLE\n` +
      `🎯 Alvo: ${targetMonster.name}\n` +
      `${leaderText}\n` +
      `🐉 Dragão: ${sendDragon ? 'Sim (⚡ 50 Energia)' : 'Não'}\n\n` +
      mercText +
      armyText +
      `\n${verdictText}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReserveMarch = () => {
    if (!onUpdateProfile || dispatchedTroopsList.length === 0) return;

    const squadCounts = new Map<string, { unitId: string; unitName: string; count: number }>();
    for (const unit of dispatchedTroopsList) {
      if (unit.count <= 0) continue;
      const existing = squadCounts.get(unit.id);
      squadCounts.set(unit.id, {
        unitId: unit.id,
        unitName: unit.name,
        count: (existing?.count || 0) + unit.count,
      });
    }

    const squads = Array.from(squadCounts.values());
    const nextOwnedCounts = { ...profile.ownedTroopCounts };
    for (const squad of squads) {
      const availableCount = nextOwnedCounts[squad.unitId] || 0;
      if (availableCount < squad.count) {
        setToastMessage(`Estoque insuficiente para reservar ${squad.unitName}. Recalcule a marcha e tente novamente.`);
        return;
      }
      nextOwnedCounts[squad.unitId] = availableCount - squad.count;
    }

    const march: ActiveMarch = {
      id: `march_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      targetId: targetMonster.id,
      targetName: targetMonster.name,
      targetLevel: targetMonster.level,
      createdAt: new Date().toISOString(),
      attackMode: targetMonster.attackMode,
      captainId: activeCaptain.id,
      captainName: isRare ? `Herói ${profile.playerName || profile.heroName || 'Comandante'}` : activeCaptain.name,
      captainLevel: isRare ? profile.heroLevel || 16 : activeCaptainLevel,
      dragonSent: sendDragon,
      enemySquads: targetMonster.enemySquads?.map((squad) => ({ ...squad })) || [],
      predictedOutcome: simResult.outcome,
      predictedSafetyLevel: simResult.safetyLevel,
      predictedCasualties: simResult.playerCasualties.map((casualty) => ({ ...casualty })),
      predictedPlayerDamage: simResult.totalPlayerDamage,
      predictedEnemyHp: simResult.initialEnemyHp,
      predictedXp: projectedXP,
      predictedVp: projectedVP,
      squads,
    };
    const historyEntry: AttackHistoryEntry = { ...march, status: 'in_progress' };

    onUpdateProfile({
      ownedTroopCounts: nextOwnedCounts,
      activeMarches: [...activeMarches, march],
      attackHistory: [historyEntry, ...attackHistory],
    });
    setDeathCountDrafts((previous) => ({
      ...previous,
      [march.id]: Object.fromEntries(squads.map((squad) => [squad.unitId, '0'])),
    }));
    setToastMessage(`Marcha para ${targetMonster.name} reservada. As tropas foram descontadas do estoque disponível.`);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmMarchReturn = (march: ActiveMarch) => {
    if (!onUpdateProfile) return;

    const drafts = deathCountDrafts[march.id] || {};
    const returnedCounts: Record<string, number> = {};
    const actualDeaths: AttackHistoryEntry['actualDeaths'] = [];
    for (const squad of march.squads) {
      const rawDeathCount = drafts[squad.unitId] ?? '0';
      const deathCount = Number(rawDeathCount);
      if (rawDeathCount.trim() === '' || !Number.isInteger(deathCount) || deathCount < 0 || deathCount > squad.count) {
        setToastMessage(`Informe um número inteiro entre 0 e ${squad.count.toLocaleString('pt-BR')} para ${squad.unitName}.`);
        return;
      }
      actualDeaths.push({ unitId: squad.unitId, unitName: squad.unitName, count: deathCount });
      returnedCounts[squad.unitId] = (returnedCounts[squad.unitId] || 0) + squad.count - deathCount;
    }

    const nextOwnedCounts = { ...profile.ownedTroopCounts };
    for (const [unitId, count] of Object.entries(returnedCounts)) {
      nextOwnedCounts[unitId] = (nextOwnedCounts[unitId] || 0) + count;
    }

    const completedHistoryEntry: AttackHistoryEntry = {
      ...march,
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDeaths,
      returnedSquads: march.squads.map((squad) => ({
        ...squad,
        count: returnedCounts[squad.unitId] || 0,
      })),
    };

    onUpdateProfile({
      ownedTroopCounts: nextOwnedCounts,
      activeMarches: activeMarches.filter((activeMarch) => activeMarch.id !== march.id),
      attackHistory: attackHistory.some((entry) => entry.id === march.id)
        ? attackHistory.map((entry) => entry.id === march.id ? completedHistoryEntry : entry)
        : [completedHistoryEntry, ...attackHistory],
    });
    setEditingReturnMarchId(null);
    setDeathCountDrafts((previous) => {
      const next = { ...previous };
      delete next[march.id];
      return next;
    });
    setToastMessage(`Baixas registradas. As tropas sobreviventes de ${march.targetName} voltaram ao estoque.`);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const classLabelMap: Record<string, string> = {
    ranged: 'Longo Alcance',
    melee: 'Corpo a Corpo',
    mounted: 'Montadas',
    flying: 'Voadoras',
    siege: 'Cerco',
  };

  // Mapeamento dinâmico de esquadrões despachados
  const marchSquadList = dispatchedTroopsList.map((unit) => {
    const originalTroop = troops.find((t) => t.id === unit.id);
    const isMerc = unit.isMercenary || unit.category === 'mercenary';
    const isBucha = unit.tier === 1;

    let role = 'Dano Principal';
    let roleColor = 'text-emerald-400';
    let badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';

    if (isMerc) {
      role = 'Mercenário de Elite';
      roleColor = 'text-amber-400';
      badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    } else if (isBucha) {
      role = '🛡️ Bucha de Absorção de Baixas';
      roleColor = 'text-amber-300';
      badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    } else if (unit.troopClass === 'melee') {
      role = 'Dano Frontal';
      roleColor = 'text-rose-400';
      badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
    } else if (unit.troopClass === 'ranged') {
      role = 'Dano Principal Seguro';
      roleColor = 'text-emerald-400';
      badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    } else if (unit.troopClass === 'mounted') {
      role = 'Ataque Rápido / Flanco';
      roleColor = 'text-sky-400';
      badgeColor = 'bg-sky-950/80 text-sky-300 border-sky-500/40';
    } else if (unit.troopClass === 'flying') {
      role = 'Ataque Aéreo Superior';
      roleColor = 'text-purple-400';
      badgeColor = 'bg-purple-950/80 text-purple-300 border-purple-500/40';
    }

    const romanTier = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][unit.tier - 1] || `${unit.tier}`;
    const badge = isMerc
      ? `Tier ${romanTier} • Mercenário`
      : `Tier ${romanTier} • ${classLabelMap[unit.troopClass] || unit.troopClass}`;

    return {
      id: unit.id,
      name: unit.name,
      role,
      roleColor,
      badge,
      badgeColor,
      stock: originalTroop?.ownedCount || unit.count,
      count: unit.count,
      key: unit.id,
      tier: unit.tier,
      avatarIcon: unit.avatarIcon || originalTroop?.avatarIcon || unit.id,
      avatarPath: originalTroop?.avatarPath,
      catalogManaged: originalTroop?.catalogManaged,
    };
  });

  const nobleCasualties = t2Casualties;

  return (
    <div className="bg-[#111827] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-700/80 space-y-6">
      {/* TOAST DE RECALCULADO */}
      {toastMessage && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {!hasEnemyComposition && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-amber-500/50 bg-amber-950/40 p-4 text-amber-100 sm:flex-row sm:items-center">
          <span className="text-xl" aria-hidden="true">⚠️</span>
          <div>
            <h3 className="text-sm font-black text-amber-200">Cadastre as tropas inimigas para validar a marcha</h3>
            <p className="text-xs text-amber-100/80">A simulação, as baixas previstas e as recompensas ficam ocultas até haver uma composição para {targetMonster.name}.</p>
          </div>
        </div>
      )}

      <details className="group rounded-xl border border-slate-700 bg-[#0b0f19]">
        <summary className="flex cursor-pointer list-none flex-col gap-1 p-4 marker:hidden sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-black text-white">⚙️ Ajustes da marcha</span>
          <span className="text-xs text-slate-400">
            Guardas {maxGuards.toLocaleString('pt-BR')} • Mercenários {maxMercs.toLocaleString('pt-BR')} • Monstros {maxMonsters.toLocaleString('pt-BR')} • {isRare ? 'Herói' : activeCaptain.name} • Dragão {sendDragon ? 'ativo' : 'inativo'}
          </span>
        </summary>
        <div className="space-y-4 border-t border-slate-700 p-4">
      {/* PAINEL DE SLOTS DE CAPACIDADE DE MARCHA (TOTAL BATTLE) */}
      <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Slots de Capacidade de Marcha (Total Battle)</span>
              </h3>
              <p className="text-2xs sm:text-xs text-slate-400 font-semibold">
                Digite os limites que aparecem no jogo para otimizar o envio de guardas, mercenários e monstros:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-2xs text-amber-300/80 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold">
              💡 Ajuste os 3 números da sua tela
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SLOT 1: GUARDAS (CAPACETE ROMANO VERMELHO) */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-red-500/40 hover:border-red-400 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-red-900 border border-red-400/60 flex items-center justify-center shadow text-lg">
                  🛡️
                </div>
                <div>
                  <span className="text-xs font-black text-white block">
                    Guardas
                  </span>
                  <span className="text-2xs text-red-300 font-bold block">
                    Tropas Regulares T1-T6
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={maxGuards}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const validVal = isNaN(val) ? 0 : val;
                    if (onUpdateProfile) {
                      onUpdateProfile({ maxMarchCapacity: validVal });
                    }
                    if (onUpdateMonsterTarget) {
                      onUpdateMonsterTarget({
                        ...targetMonster,
                        marchCapacities: {
                          guards: validVal,
                          mercenaries: maxMercs,
                          monsters: maxMonsters,
                        },
                      });
                    }
                  }}
                  className="w-24 bg-[#0b0f19] border border-red-500/60 focus:border-red-400 text-red-200 font-mono font-black text-xs px-2 py-1 rounded-lg text-right outline-none shadow-inner"
                  title="Capacidade máxima de guardas permitida pelo jogo para este ataque (salvo no perfil)"
                />
              </div>
            </div>

            {/* Barra de Alocação de Guardas */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-slate-400">Alocação Atual:</span>
                <span className="font-mono text-red-300 font-black">
                  {allocatedGuards.toLocaleString('pt-BR')} / {maxGuards.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (allocatedGuards / (maxGuards || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* SLOT 2: MERCENÁRIOS (ÁGUIA DOURADA) */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/60 flex items-center justify-center shadow text-lg">
                  🦅
                </div>
                <div>
                  <span className="text-xs font-black text-white block">
                    Mercenários
                  </span>
                  <span className="text-2xs text-amber-300 font-bold block">
                    Elite & Atiradores
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="20"
                  value={maxMercs}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const validVal = isNaN(val) ? 0 : val;
                    if (onUpdateProfile) {
                      onUpdateProfile({ mercenaryCapacity: validVal });
                    }
                    if (onUpdateMonsterTarget) {
                      onUpdateMonsterTarget({
                        ...targetMonster,
                        marchCapacities: {
                          guards: maxGuards,
                          mercenaries: validVal,
                          monsters: maxMonsters,
                        },
                      });
                    }
                  }}
                  className="w-24 bg-[#0b0f19] border border-amber-500/60 focus:border-amber-400 text-amber-200 font-mono font-black text-xs px-2 py-1 rounded-lg text-right outline-none shadow-inner"
                  title="Capacidade máxima de mercenários permitida pelo jogo para este ataque (salvo no perfil)"
                />
              </div>
            </div>

            {/* Barra de Alocação de Mercenários */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-slate-400">Alocação Atual:</span>
                <span className="font-mono text-amber-300 font-black">
                  {mercRecommended.toLocaleString('pt-BR')} / {maxMercs.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (mercRecommended / (maxMercs || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* SLOT 3: MONSTROS & ESPECIAIS (LEÃO DOURADO) */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-purple-500/40 hover:border-purple-400 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-purple-950 border border-purple-400/60 flex items-center justify-center shadow text-lg">
                  🦁
                </div>
                <div>
                  <span className="text-xs font-black text-white block">
                    Monstros
                  </span>
                  <span className="text-2xs text-purple-300 font-bold block">
                    Convocados & Dragões
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={maxMonsters}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const validVal = isNaN(val) ? 0 : val;
                    if (onUpdateProfile) {
                      onUpdateProfile({ specialCapacity: validVal });
                    }
                    if (onUpdateMonsterTarget) {
                      onUpdateMonsterTarget({
                        ...targetMonster,
                        marchCapacities: {
                          guards: maxGuards,
                          mercenaries: maxMercs,
                          monsters: validVal,
                        },
                      });
                    }
                  }}
                  className="w-24 bg-[#0b0f19] border border-purple-500/60 focus:border-purple-400 text-purple-200 font-mono font-black text-xs px-2 py-1 rounded-lg text-right outline-none shadow-inner"
                  title="Capacidade máxima de monstros especiais permitida pelo jogo para este ataque (salvo no perfil)"
                />
              </div>
            </div>

            {/* Barra de Alocação de Monstros */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-slate-400">Alocação Atual:</span>
                <span className="font-mono text-purple-300 font-black">
                  {allocatedMonsters.toLocaleString('pt-BR')} / {maxMonsters.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (allocatedMonsters / (maxMonsters || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STEP 1: LIDERANÇA & DRAGÃO */}
      <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            {isRare ? 'Comandante da Marcha (Herói)' : 'Capitão da Marcha'}
          </span>
          <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/50 shadow-sm">
            {isRare ? `👑 Herói Ativo (Nv ${profile.heroLevel || 18})` : `👑 Líder: ${activeCaptain.name} (+${captainBonusPercent}%)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Left: Captains or Hero (8 cols) */}
          <div className="sm:col-span-8">
            {isRare ? (
              <div className="flex items-center gap-3.5 bg-slate-900 p-3.5 rounded-xl border border-purple-500/60 shadow-md">
                <div className="w-12 h-12 rounded-xl border border-purple-400 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt="Herói"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-black text-white truncate">
                    Herói {profile.playerName || profile.heroName || 'Comandante'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                  </h4>
                  <p className="text-xs font-bold text-purple-300">
                    Nível {profile.heroLevel || 16} • Líder Oficial para Ataques Raros
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {displayedCaptains.map((cap) => {
                  const isSelected = cap.id === activeCapId;
                  const level = profile.captainLevels[cap.id] || cap.level || 1;
                  const stars = profile.captainStars?.[cap.id] || cap.stars || 1;
                  const stats = getCaptainComputedStats(cap, level, stars);
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => onSelectCaptain(cap.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/60 shadow-lg'
                          : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg border border-amber-400/60 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                        <img
                          src={`/assets/troops/${cap.id}.png`}
                          alt={cap.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = '/assets/troops/alexander.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-black text-white block truncate">
                          {cap.name}
                        </span>
                        <span className="text-2xs font-black text-emerald-400 block">
                          {stats.primaryBonusFormatted} (Nv {level})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Dragon Checkbox (4 cols) */}
          <div className="sm:col-span-4">
            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all shadow-md ${
                sendDragon
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={sendDragon}
                onChange={(e) => setSendDragon(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700"
              />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block">
                  🐉 Dragão (+15% Dano)
                </span>
                <span className="text-xs font-semibold text-slate-300 block">
                  ⚡ 50 / 750 de Energia
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
        </div>
      </details>

      {/* 4. VEREDITO TÁTICO & TRAVA DE SEGURANÇA CONTRA DERROTAS */}
      {!hasEnemyComposition ? null : isDefeat ? (
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-2 border-red-500 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-800/80 pb-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-600/50 shrink-0">
                🚨
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-red-100 tracking-wide uppercase flex items-center gap-2">
                  <span>DERROTA CERTA (100% de Baixas)</span>
                  <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded-md font-bold">NÃO MARCHAR</span>
                </h2>
                <p className="text-xs sm:text-sm font-bold text-red-300">
                  O dano do seu exército não consegue derrubar a vida total do monstro. O contra-ataque aniquilará suas tropas!
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-red-900 border border-red-500 text-red-200 text-xs font-black">
              Perdas Previstas: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0b0f19] p-3 rounded-xl border border-red-800/60">
              <span className="text-slate-400 block font-semibold">Dano Total da Marcha</span>
              <span className="text-base font-mono font-black text-rose-400 mt-0.5 block">
                {simResult.totalPlayerDamage.toLocaleString('pt-BR')}
              </span>
              <span className="text-2xs text-rose-400/80">Insuficiente para matar o monstro</span>
            </div>
            <div className="bg-[#0b0f19] p-3 rounded-xl border border-red-800/60">
              <span className="text-slate-400 block font-semibold">Vida do Alvo (Inimigo)</span>
              <span className="text-base font-mono font-black text-amber-300 mt-0.5 block">
                {simResult.initialEnemyHp.toLocaleString('pt-BR')} HP
              </span>
              <span className="text-2xs text-amber-400/80">Faltam {simResult.remainingEnemyHp.toLocaleString('pt-BR')} HP</span>
            </div>
            <div className="bg-[#0b0f19] p-3 rounded-xl border border-red-800/60">
              <span className="text-slate-400 block font-semibold">Retaliação do Inimigo</span>
              <span className="text-base font-mono font-black text-purple-300 mt-0.5 block">
                {simResult.totalEnemyDamage.toLocaleString('pt-BR')} de Dano
              </span>
              <span className="text-2xs text-purple-300/80">Supera toda a vida do seu exército</span>
            </div>
          </div>

          {simResult.deficitTroopsText && (
            <div className="bg-red-900/40 p-3.5 rounded-xl border border-red-700/60 flex items-start gap-2.5 text-xs text-red-200 font-bold">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-black text-white uppercase tracking-wide">
                  O que você precisa produzir no Quartel para vencer:
                </span>
                <span className="mt-0.5 block">{simResult.deficitTroopsText}</span>
              </div>
            </div>
          )}

          {/* ALTERNATIVA RÁPIDA: NÍVEL INDICADO PARA SUBIR DE NÍVEL RÁPIDO */}
          {optimalFarm && (
            <div className="mt-2 pt-3 border-t border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-950/70 p-3.5 rounded-xl border border-red-700/50">
              <div className="text-xs text-amber-200 font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
                <span>
                  💡 Alternativa para farmar XP rápido sem perdas nobres: <strong>Nv {optimalFarm.optimalLevel}</strong> ({optimalFarm.optimalXp.toLocaleString('pt-BR')} XP com vitória segura).
                </span>
              </div>
              {onUpdateMonsterTarget && currentTemplate && (
                <button
                  type="button"
                  onClick={() => onUpdateMonsterTarget(buildMonsterTargetFromTemplate(currentTemplate, optimalFarm.optimalLevel))}
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl shadow transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                >
                  <span>⚡ Mudar para Nv {optimalFarm.optimalLevel}</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : simResult.safetyLevel === 'CLEAN_VICTORY' ? (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              ⚔️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-emerald-100 tracking-wide uppercase">
                Vitória Perfeita — Hit K.O. (0 Baixas em Todo o Exército)
              </h2>
              <p className="text-xs font-semibold text-emerald-300">
                Dano massivo suficiente para aniquilar o alvo na primeira rodada sem contra-ataque.
              </p>
            </div>
          </div>
        </div>
      ) : simResult.safetyLevel === 'COSTLY_VICTORY' ? (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black shadow-lg">
              ⚠️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-rose-100 tracking-wide uppercase">
                Atenção: Vitória com Perda de Nobres (T2+)
              </h2>
              <p className="text-xs font-semibold text-rose-300">
                Esta marcha causará <strong>{t2Casualties.toLocaleString('pt-BR')} mortos</strong> em tropas T2+! Ajuste a composição com Mercenários ou bucha adequada para evitar perda de nobres.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              🛡️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-100 tracking-wide uppercase">
                Vitória Garantida com Bucha de Absorção (G1)
              </h2>
              <p className="text-xs font-semibold text-slate-300">
                Tropas T2+ e Mercenários 100% protegidos! Baixas absorvidas pela bucha G1 ({g1Casualties.toLocaleString('pt-BR')} mortos).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Composição pronta para enviar no jogo */}
      <div className={`bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border ${isDefeat ? 'border-red-600/70' : 'border-amber-500/40'} space-y-4 shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/80 pb-3 gap-2">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              Composição da marcha
            </span>
            <span className="text-xs font-semibold text-slate-400 block pt-1">
              {!hasEnemyComposition
                ? 'Sugestão baseada no seu estoque. Cadastre as tropas inimigas para validar antes de marchar.'
                : isDefeat
                ? '⚠️ ATENÇÃO: As tropas abaixo NÃO são suficientes para vencer. Treine mais soldados antes de marchar!'
                : '⌨️ Digite ou deslize os campos no Total Battle com as quantidades exatas abaixo:'}
            </span>
            {hasStackedGuardTiers && (
              <span className="text-[11px] font-medium text-cyan-300 block pt-1">
                Empilhamento aplicado: a camada inferior é dimensionada por (ataque estimado do nível superior × quantidade superior) ÷ ataque estimado do nível inferior. Estoque, capacidade e simulação limitam as quantidades.
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              Capacidade de Guardas: <strong className="text-amber-300 font-black">{allocatedGuards.toLocaleString('pt-BR')}</strong> / {maxGuards.toLocaleString('pt-BR')}
            </span>
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/70 bg-amber-950 px-3.5 py-2 text-xs font-black text-amber-100 shadow transition hover:border-amber-300 hover:bg-amber-900 disabled:cursor-wait disabled:opacity-70"
              title="Recalcula a composição e a simulação com o estoque e os ajustes atuais"
            >
              <RotateCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculando…' : 'Recalcular marcha'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-black text-slate-100 shadow transition hover:border-amber-400 hover:bg-slate-700"
              title="Copia a composição completa da marcha"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 text-amber-300" />}
              {copied ? 'Copiada' : hasEnemyComposition ? 'Copiar marcha' : 'Copiar sugestão'}
            </button>
            <button
              type="button"
              onClick={handleReserveMarch}
              disabled={!onUpdateProfile || dispatchedTroopsList.length === 0 || !hasEnemyComposition}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/70 bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              title={hasEnemyComposition ? 'Desconta estas tropas do estoque e registra a marcha em ataque' : 'Cadastre as tropas inimigas antes de reservar a marcha'}
            >
              <Swords className="h-4 w-4" /> {hasEnemyComposition ? 'Reservar marcha' : 'Valide para reservar'}
            </button>
          </div>
        </div>

        {/* Clean, spacious Troop Dispatch List */}
        <div className="space-y-3">
          {marchSquadList.map((unit) => (
            <div
              key={unit.id}
              className={`bg-slate-900/90 hover:bg-slate-800/90 border ${isDefeat ? 'border-red-900/50 hover:border-red-500/60' : 'border-slate-700/80 hover:border-amber-500/60'} rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-lg`}
            >
              {/* Unit Info */}
              <div className="flex items-center gap-4 min-w-0">
                <TroopAvatar id={unit.avatarIcon || unit.id} avatarPath={unit.avatarPath} databaseOnly={unit.catalogManaged} tier={unit.tier} size="md" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-md border ${unit.badgeColor}`}>
                      {unit.badge}
                    </span>
                    <span className="text-2xs font-semibold text-slate-400">
                      Estoque: {unit.stock.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white truncate mt-1">
                    {unit.name}
                  </h3>

                  <p className={`text-xs font-bold ${unit.roleColor}`}>
                    {unit.role}
                  </p>
                </div>
              </div>

              {/* Quantidade sugerida para digitar no jogo */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-2xs font-extrabold text-slate-400 block uppercase tracking-wider">
                    Digitar no Jogo
                  </span>
                  <span className={`text-xl sm:text-2xl font-mono font-black ${isDefeat ? 'text-rose-400' : 'text-amber-300'}`}>
                    {unit.count.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prévia da batalha logo após a composição da marcha */}
      {hasEnemyComposition && (
        <BattlePreview
          simResult={simResult}
          profile={profile}
          captain={activeCaptain}
          sendDragon={sendDragon}
          targetMonster={targetMonster}
        />
      )}

      {activeMarches.length > 0 && (
        <section id="active-marches" className="space-y-4 rounded-2xl border border-sky-500/40 bg-slate-950/80 p-4 shadow-xl sm:p-5">
          <div className="flex flex-col gap-2 border-b border-slate-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-sky-200">
                <Swords className="h-4 w-4 text-sky-300" /> Tropas em ataque
                <span className="rounded-full bg-sky-950 px-2 py-0.5 text-xs text-sky-200">{activeMarches.length}</span>
              </h2>
              <p className="mt-1 text-xs text-slate-400">Informe quantas morreram. As tropas sobreviventes voltam ao estoque automaticamente.</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeMarches.map((march) => {
              const isEditingReturn = editingReturnMarchId === march.id;
              const drafts = deathCountDrafts[march.id] || {};
              const sentCount = march.squads.reduce((sum, squad) => sum + squad.count, 0);

              return (
                <article key={march.id} className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-black text-white">{march.targetName} • Nv {march.targetLevel}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Reservada em {new Date(march.createdAt).toLocaleString('pt-BR')} • {sentCount.toLocaleString('pt-BR')} tropas enviadas
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {march.squads.map((squad) => (
                          <span key={squad.unitId} className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200">
                            {squad.unitName}: <strong className="text-amber-300">{squad.count.toLocaleString('pt-BR')}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingReturnMarchId(isEditingReturn ? null : march.id)}
                      className="shrink-0 rounded-xl border border-sky-500/60 bg-sky-950 px-3.5 py-2 text-xs font-black text-sky-200 transition hover:bg-sky-900"
                    >
                      {isEditingReturn ? 'Fechar' : 'Registrar baixas'}
                    </button>
                  </div>

                  {isEditingReturn && (
                    <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                      <p className="text-xs font-semibold text-slate-300">Informe quantas morreram de cada tipo. O campo começa em 0; as sobreviventes retornam ao estoque.</p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {march.squads.map((squad) => (
                          <label key={squad.unitId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
                            <span className="min-w-0 text-xs font-bold text-slate-200">{squad.unitName}<span className="mt-0.5 block font-normal text-slate-500">Enviadas: {squad.count.toLocaleString('pt-BR')} • Mortos</span></span>
                            <input
                              type="number"
                              min={0}
                              max={squad.count}
                              step={1}
                              inputMode="numeric"
                              aria-label={`Quantidade de ${squad.unitName} que morreu`}
                              value={drafts[squad.unitId] ?? '0'}
                              onChange={(event) => setDeathCountDrafts((previous) => ({
                                ...previous,
                                [march.id]: { ...(previous[march.id] || {}), [squad.unitId]: event.target.value },
                              }))}
                              className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-2 text-right font-mono text-sm font-black text-rose-300 outline-none focus:border-rose-400"
                            />
                          </label>
                        ))}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmMarchReturn(march)}
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:bg-emerald-500"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Confirmar baixas e atualizar estoque
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-slate-700 bg-slate-950/70 shadow-lg">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-100">
            Histórico de ataques
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{attackHistory.length}</span>
          </span>
          <span className="text-xs text-slate-400">Compare a previsão da simulação com as baixas reais</span>
        </summary>
        <div className="space-y-2 border-t border-slate-800 p-3 sm:p-4">
          {attackHistory.length === 0 ? (
            <p className="rounded-lg bg-slate-900/80 p-3 text-xs text-slate-400">
              Cada ataque reservado aparecerá aqui. Registre as baixas no retorno para comparar o resultado real com a previsão.
            </p>
          ) : (
            attackHistory.map((entry) => {
              const predictedDeathTotal = (entry.predictedCasualties || []).reduce((total, casualty) => total + casualty.lostCount, 0);
              const actualDeathTotal = (entry.actualDeaths || []).reduce((total, casualty) => total + casualty.count, 0);
              const returnedTotal = (entry.returnedSquads || []).reduce((total, squad) => total + squad.count, 0);
              const hasActualReport = entry.status === 'completed';

              return (
                <details key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/80">
                  <summary className="flex cursor-pointer list-none flex-col gap-2 p-3 marker:hidden sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
                    <div>
                      <h3 className="text-sm font-black text-white">{entry.targetName} • Nv {entry.targetLevel}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Marcha reservada {new Date(entry.createdAt).toLocaleString('pt-BR')}
                        {entry.completedAt ? ` • Retorno ${new Date(entry.completedAt).toLocaleString('pt-BR')}` : ''}
                        {' • '}{entry.captainName || 'Capitão não registrado'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-2xs font-bold">
                      <span className="rounded-lg border border-indigo-500/30 bg-indigo-950/60 px-2 py-1 text-indigo-200">
                        Previstas: {predictedDeathTotal.toLocaleString('pt-BR')}
                      </span>
                      {hasActualReport ? (
                        <>
                          <span className="rounded-lg border border-rose-500/30 bg-rose-950/60 px-2 py-1 text-rose-200">
                            Mortas: {actualDeathTotal.toLocaleString('pt-BR')}
                          </span>
                          <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/60 px-2 py-1 text-emerald-200">
                            Voltaram: {returnedTotal.toLocaleString('pt-BR')}
                          </span>
                        </>
                      ) : (
                        <span className="rounded-lg border border-sky-500/30 bg-sky-950/60 px-2 py-1 text-sky-200">Em andamento</span>
                      )}
                    </div>
                  </summary>
                  <div className="space-y-3 border-t border-slate-800 p-3">
                    <p className="text-xs text-slate-300">
                      Simulação: {entry.predictedOutcome === 'VICTORY' ? 'vitória' : entry.predictedOutcome === 'DEFEAT' ? 'derrota' : 'sem resultado'}
                      {entry.predictedSafetyLevel ? ` • ${entry.predictedSafetyLevel}` : ''}
                      {entry.predictedPlayerDamage !== undefined && entry.predictedEnemyHp !== undefined
                        ? ` • Dano previsto ${entry.predictedPlayerDamage.toLocaleString('pt-BR')} / ${entry.predictedEnemyHp.toLocaleString('pt-BR')} HP`
                        : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.squads.map((squad) => {
                        const predictedDeaths = entry.predictedCasualties?.find((casualty) => casualty.id === squad.unitId)?.lostCount || 0;
                        const actualDeaths = entry.actualDeaths?.find((casualty) => casualty.unitId === squad.unitId)?.count || 0;
                        const returned = entry.returnedSquads?.find((returnedSquad) => returnedSquad.unitId === squad.unitId)?.count || 0;

                        return (
                          <span key={squad.unitId} className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300">
                            {squad.unitName}: enviados {squad.count.toLocaleString('pt-BR')} • previsão {predictedDeaths.toLocaleString('pt-BR')} mortos • reais {hasActualReport ? `${actualDeaths.toLocaleString('pt-BR')} mortos` : 'baixas pendentes'} • {hasActualReport ? `voltaram ${returned.toLocaleString('pt-BR')}` : 'retorno pendente'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </details>
              );
            })
          )}
        </div>
      </details>

      {/* Segurança e recompensas da simulação */}
      {hasEnemyComposition && (
      <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            Segurança de Marcha & Recompensas Estimadas
          </span>
          <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isDefeat ? 'text-rose-400' : 'text-emerald-300'}`}>
            {isDefeat ? <XCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {isDefeat ? 'Risco Fatal de Baixas' : '100% Protegido contra Baixas Pesadas'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDefeat ? (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-300 block">Baixas em Tropas T2/T5</span>
                <span className={`font-mono font-black text-base ${isDefeat ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {isDefeat ? '100% Perdidas (Derrota)' : nobleCasualties > 0 ? `${nobleCasualties} Perdidas` : '0 Tropas Perdidas'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-300 block">Pontos de Valor (VP)</span>
                <span className="text-amber-300 font-mono font-black text-base">
                  {isDefeat ? '0 VP' : `+${projectedVP.toLocaleString('pt-BR')} VP`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-300 block">Experiência (XP)</span>
                <span className="text-purple-300 font-mono font-black text-base">
                  {isDefeat ? '0 XP' : `+${projectedXP.toLocaleString('pt-BR')} XP`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 7. INTERACTIVE COMBAT LOG PREVIEW (Informações da Batalha Turno a Turno) */}
      {hasEnemyComposition && (
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <button
          type="button"
          onClick={() => setShowCombatLog(!showCombatLog)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-black text-white hover:text-amber-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>Ver Simulação Turno a Turno ({simResult.rounds.length} etapas simuladas)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xs font-bold px-2 py-0.5 rounded border ${isDefeat ? 'bg-red-950 text-red-300 border-red-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'}`}>
              {isDefeat ? 'Resultado: DERROTA' : 'Resultado: VITÓRIA'}
            </span>
            {showCombatLog ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {showCombatLog && (
          <div className="space-y-2 pt-3 border-t border-slate-800 animate-fadeIn max-h-96 overflow-y-auto pr-1">
            {simResult.rounds.map((r) => (
              <div
                key={r.step}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  r.isEnemyAttacking
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-2xs text-white shrink-0">
                    {r.step}
                  </span>
                  <div className="min-w-0">
                    <span className="font-black block truncate">
                      {r.attackerName} ({r.attackerCount.toLocaleString('pt-BR')} un.) ➔ {r.defenderName}
                    </span>
                    <span className="text-2xs text-slate-400 block">
                      Causou <strong className="text-white font-mono">{r.damageDealt.toLocaleString('pt-BR')}</strong> de dano
                      {r.bonusText ? ` (${r.bonusText})` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-rose-300 block">
                    -{r.casualties.toLocaleString('pt-BR')} baixas
                  </span>
                  <span className="text-2xs text-slate-400">
                    Sobram: {r.defenderRemainingCount.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

    </div>
  );
};
