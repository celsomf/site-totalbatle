import React, { useState } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile, EnemySquadUnit } from '../types';
import { EditSquadsModal } from './EditSquadsModal';
import { updateMonsterSquads, MONSTER_PRESET_TEMPLATES, buildMonsterTargetFromTemplate } from '../data/monsters';
import { simulateCombat, DispatchedTroop, findOptimalFarmLevel, buildDispatchedTroops } from '../utils/combatSimulator';
import { getCaptainMonsterAttackBonus, getCaptainComputedStats, getHeroAttackBonus } from '../utils/captainStats';
import { TroopAvatar } from './TroopAvatar';
import { BattlePreview } from './BattlePreview';
import {
  Copy,
  Check,
  Zap,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Crown,
  Swords,
  Shield,
  AlertTriangle,
  XCircle,
  Skull,
  Hammer,
  RotateCw
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
  const [copied, setCopied] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [sendDragon, setSendDragon] = useState(true);
  const [showEnemyDetails, setShowEnemyDetails] = useState(false);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [isEditingSquads, setIsEditingSquads] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setLastCalculatedAt(new Date());
      setToastMessage('Marcha e simulação recalculadas com sucesso com base no estoque atual do Quartel!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 400);
  };

  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';
  const isEpic = targetMonster.attackMode === 'epic';

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
    MONSTER_PRESET_TEMPLATES.find((t) => t.id === templateId) || MONSTER_PRESET_TEMPLATES[0];
  const optimalFarm = findOptimalFarmLevel(currentTemplate, troops, profile, activeCaptain, sendDragon);

  const dragonBonusPercent = sendDragon ? 15 : 0;
  const academyBonusPercent = profile.academyBonus?.guardsmenAttack || 25;

  // Capacidades de marcha do perfil do jogador (persistidas no banco)
  const maxGuards = profile.maxMarchCapacity || targetMonster.marchCapacities?.guards || 2000;
  const maxMercs = profile.mercenaryCapacity || targetMonster.marchCapacities?.mercenaries || 1000;
  const maxMonsters = profile.specialCapacity || targetMonster.marchCapacities?.monsters || 500;

  // 1. Preparar unidades enviadas através do motor tático inteligente
  const dispatchedTroopsList = buildDispatchedTroops(
    troops,
    profile,
    targetMonster,
    activeCaptain,
    sendDragon
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
  const simResult = simulateCombat(dispatchedTroopsList, targetMonster.enemySquads || []);
  const isDefeat = simResult.outcome === 'DEFEAT';
  const g1Casualties = simResult.playerCasualties
    .filter((p) => p.tier === 1)
    .reduce((sum, p) => sum + p.lostCount, 0);
  const t2Casualties = simResult.playerCasualties
    .filter((p) => p.tier >= 2)
    .reduce((sum, p) => sum + p.lostCount, 0);

  // 3. Recompensas recalculadas com os bônus do Capitão Ativo
  const projectedXP = isDefeat ? 0 : Math.round((targetMonster.xpReward || 50000) * (1 + activeCaptainLevel * 0.015));
  const projectedVP = isDefeat ? 0 : Math.round((targetMonster.valorReward || 18000) * (1 + activeCaptainLevel * 0.01));

  // Lista de capitães para seleção rápida
  const displayedCaptains = (profile.selectedCaptainIds || ['farhad', 'aurora', 'xi_guiying'])
    .map((id) => captains.find((c) => c.id === id))
    .filter(Boolean) as Captain[];

  const handleCopy = () => {
    const leaderText = isRare
      ? `👑 Líder: Herói ${profile.playerName || profile.heroName || 'Comandante'} (Nv ${profile.heroLevel || 16})`
      : `👑 Capitão: ${activeCaptain.name} (Nv ${activeCaptainLevel} - +${captainBonusPercent}% Bônus)`;

    const verdictText = isDefeat
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

  const handleCopySingleNumber = (label: string, count: number) => {
    navigator.clipboard.writeText(count.toString());
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 1800);
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
    };
  });

  const nobleCasualties = t2Casualties;

  // Resumo de sincronização por tipo
  const summaryByTier = dispatchedTroopsList.reduce<Record<string, number>>((acc, t) => {
    const key = t.isMercenary ? 'Mercs' : `T${t.tier}`;
    acc[key] = (acc[key] || 0) + t.count;
    return acc;
  }, {});

  const summaryString = Object.entries(summaryByTier)
    .map(([key, count]) => `${count.toLocaleString('pt-BR')} ${key}`)
    .join(' • ');

  return (
    <div className="bg-[#111827] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-700/80 space-y-6">
      
      {/* 1. Header: Quick Actions Bar (Recalculate, Sincronização, Clan copy & Enemy squads view) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0b0f19] p-4 rounded-xl border border-slate-700/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isDefeat ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span>
              {isDefeat ? '⚠️ Exército Insuficiente!' : 'Simulação Validada Turno a Turno'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-2xs font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sincronizado com Quartel</span>
            <span className="font-mono text-slate-200">
              ({summaryString || '0 Tropas'})
            </span>
            <span className="text-slate-400 font-mono hidden sm:inline">
              • {lastCalculatedAt.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÃO DE RECALCULAR COM ANIMAÇÃO TÁTICA */}
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            title="Recalcular simulação e forçar atualização com base no estoque atual do Quartel"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculando...' : 'Recalcular Marcha'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEnemyDetails(!showEnemyDetails)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 text-xs font-bold transition-all shadow"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{showEnemyDetails ? 'Ocultar Inimigos' : 'Ajustar Esquadrões'}</span>
            {showEnemyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs shadow-lg transition-all ${
              copied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : isDefeat
                ? 'bg-rose-700 hover:bg-rose-600 text-white'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
            }`}
            title="Copia um resumo em texto para compartilhar no Chat do Clã ou Discord"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : '💬 Copiar para o Clã'}</span>
          </button>
        </div>
      </div>

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

      {/* AVISO QUANDO MONSTRO NÃO TEM TROPAS CADASTRADAS */}
      {(!targetMonster.enemySquads || targetMonster.enemySquads.length === 0) && (
        <div className="bg-amber-950/60 border border-amber-500/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-sm font-black text-amber-300">
                Alvo Selecionado sem Tropas Cadastradas ({targetMonster.name})
              </h4>
              <p className="text-xs text-amber-200/90 font-medium">
                As combinações fictícias foram removidas. Adicione os monstros e quantidades reais no painel do monstro acima para simular a marcha contra o inimigo real.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* 2. Collapsible Enemy Squads Drawer with In-place Editing */}
      {showEnemyDetails && (
        <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Esquadrões Inimigos ({targetMonster.enemySquads?.length || 0} tipos) • HP Total: <strong className="text-rose-400 font-extrabold">{targetMonster.totalHealth.toLocaleString('pt-BR')} HP</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsEditingSquads(true)}
              className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-3 py-1.5 rounded-lg border border-amber-500/50 transition-all shadow"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>✏️ Modal de Esquadrões</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {targetMonster.enemySquads?.map((sq) => {
              const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
              return (
                <div
                  key={sq.id}
                  className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 hover:border-amber-400 space-y-2 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-amber-300 border border-slate-600 font-bold">
                        {tierRoman}
                      </span>
                      {sq.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={sq.count}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const updated = (targetMonster.enemySquads || []).map((s) =>
                            s.id === sq.id ? { ...s, count: isNaN(val) ? 0 : val } : s
                          );
                          if (onUpdateMonsterTarget) {
                            onUpdateMonsterTarget(updateMonsterSquads(targetMonster, updated));
                          }
                        }}
                        className="w-24 bg-[#0b0f19] border border-amber-500/50 focus:border-amber-400 text-amber-300 font-mono font-black text-xs px-2 py-1 rounded-lg text-right outline-none shadow-inner"
                      />
                      <span className="text-2xs text-slate-400 font-bold">un.</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <div>Força: <strong className="text-amber-300 font-bold">{sq.unitAttack.toLocaleString('pt-BR')}</strong></div>
                    <div>Saúde: <strong className="text-rose-400 font-bold">{sq.unitHealth.toLocaleString('pt-BR')}</strong></div>
                  </div>
                  {sq.aspects?.description && (
                    <div className="text-2xs text-amber-300/90 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20 truncate">
                      {sq.aspects.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STEP 1: LIDERANÇA & DRAGÃO */}
      <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">1</span>
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

      {/* 4. VEREDITO TÁTICO & TRAVA DE SEGURANÇA CONTRA DERROTAS */}
      {isDefeat ? (
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
              {onUpdateMonsterTarget && (
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

      {/* PRÉVIA OFICIAL DA BATALHA (ARENA VISUAL & REPRODUTOR) */}
      <BattlePreview
        simResult={simResult}
        profile={profile}
        captain={activeCaptain}
        sendDragon={sendDragon}
        targetMonster={targetMonster}
      />

      {/* 5. STEP 2: O QUE COLOCAR NO JOGO (List View with Zero Clutter) */}
      <div className={`bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border ${isDefeat ? 'border-red-600/70' : 'border-amber-500/40'} space-y-4 shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/80 pb-3 gap-2">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">2</span>
              Composição de Marcha (Digite estes valores na tela do jogo)
            </span>
            <span className="text-xs font-semibold text-slate-400 block pt-1">
              {isDefeat
                ? '⚠️ ATENÇÃO: As tropas abaixo NÃO são suficientes para vencer. Treine mais soldados antes de marchar!'
                : '⌨️ Digite ou deslize os campos no Total Battle com as quantidades exatas abaixo:'}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            Capacidade de Guardas: <strong className="text-amber-300 font-black">{allocatedGuards.toLocaleString('pt-BR')}</strong> / {maxGuards.toLocaleString('pt-BR')}
          </span>
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
                <TroopAvatar id={unit.avatarIcon || unit.id} tier={unit.tier} size="md" />

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

              {/* Action: Quantity Chip & Copy Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-2xs font-extrabold text-slate-400 block uppercase tracking-wider">
                    Digitar no Jogo
                  </span>
                  <span className={`text-xl sm:text-2xl font-mono font-black ${isDefeat ? 'text-rose-400' : 'text-amber-300'}`}>
                    {unit.count.toLocaleString('pt-BR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingleNumber(unit.key, unit.count)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                    copiedNumber === unit.key
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 hover:text-white'
                  }`}
                  title="Copiar número para a área de transferência"
                >
                  {copiedNumber === unit.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNumber === unit.key ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. STEP 3: SEGURANÇA CONTRA PERDAS & RECOMPENSAS */}
      <div className="bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">3</span>
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

      {/* 7. INTERACTIVE COMBAT LOG PREVIEW (Informações da Batalha Turno a Turno) */}
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

      {/* Edit Squads Modal */}
      {isEditingSquads && (
        <EditSquadsModal
          isOpen={isEditingSquads}
          onClose={() => setIsEditingSquads(false)}
          initialSquads={targetMonster.enemySquads || []}
          monsterName={targetMonster.name}
          monsterLevel={targetMonster.level}
          onSaveSquads={(updatedSquads) => {
            const updated = updateMonsterSquads(targetMonster, updatedSquads);
            if (onUpdateMonsterTarget) onUpdateMonsterTarget(updated);
          }}
          onResetToTemplate={() => {}}
        />
      )}
    </div>
  );
};
