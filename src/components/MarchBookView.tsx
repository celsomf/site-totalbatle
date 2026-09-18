import React, { useState } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile, EnemySquadUnit } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { EditSquadsModal } from './EditSquadsModal';
import { updateMonsterSquads } from '../data/monsters';
import {
  Copy,
  Check,
  Zap,
  Flame,
  ShieldAlert,
  Sparkles,
  Shield,
  CheckCircle2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Crown,
  Swords,
  Crosshair,
  AlertTriangle
} from 'lucide-react';

interface MarchBookViewProps {
  profile: PlayerProfile;
  troops: TroopUnit[];
  captains: Captain[];
  selectedCaptainId?: string;
  onSelectCaptain: (id: string) => void;
  targetMonster: MonsterTarget;
  onUpdateMonsterTarget?: (monster: MonsterTarget) => void;
}

export const MarchBookView: React.FC<MarchBookViewProps> = ({
  profile,
  troops,
  captains,
  selectedCaptainId,
  onSelectCaptain,
  targetMonster,
  onUpdateMonsterTarget,
}) => {
  const [copied, setCopied] = useState(false);
  const [sendDragon, setSendDragon] = useState(true);
  const [showEnemyDetails, setShowEnemyDetails] = useState(false);
  const [isEditingSquads, setIsEditingSquads] = useState(false);

  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';
  const isEpic = targetMonster.attackMode === 'epic';

  // Capitão Ativo selecionado para a marcha
  const activeCapId = selectedCaptainId || profile.selectedCaptainId || profile.selectedCaptainIds?.[0] || 'farhad';
  const activeCaptain = captains.find((c) => c.id === activeCapId) || captains[0];
  const activeCaptainLevel = profile.captainLevels[activeCaptain.id] || activeCaptain.level || 1;

  // Bônus do Capitão Ativo calculado dinamicamente
  const captainBonusPercent = Math.round(
    (activeCaptain.monsterAttackBonusPercent || 20) + (activeCaptainLevel * 1.2)
  );

  const dragonBonusPercent = sendDragon ? 15 : 0;
  const academyBonusPercent = profile.academyBonus?.guardsmenAttack || 25;
  const totalDamageMultiplier = 1 + (captainBonusPercent + dragonBonusPercent + academyBonusPercent) / 100;

  // Capacidades de marcha dinâmicas
  const maxGuards = targetMonster.marchCapacities?.guards || (isRare ? 5250 : isCommon ? 2000 : profile.maxMarchCapacity || 3125);
  const maxMercs = targetMonster.marchCapacities?.mercenaries || (isRare ? 2520 : isCommon ? 1000 : profile.mercenaryCapacity || 1540);
  const maxMonsters = targetMonster.marchCapacities?.monsters || (isRare ? 1260 : isCommon ? 500 : profile.specialCapacity || 770);

  // 1. Mercenários: Titãs M5
  const titanM5 = troops.find((t) => t.id === 'm5_titan' || t.id === 'merc_titan_v');
  const titanRecommended = Math.min(titanM5?.ownedCount || 81, maxMercs);
  const titanDamage = Math.round(
    (titanM5?.baseAttack || 4600) *
      titanRecommended *
      (1 + (dragonBonusPercent + (profile.academyBonus?.monstersAttack || 20)) / 100)
  );

  // 2. Dano necessário para abater o monstro
  const enemyHealth = targetMonster.totalHealth;
  const remainingHealthAfterMercs = Math.max(0, enemyHealth - titanDamage);

  // 3. Alocação Inteligente de Tropas baseada nas Fraquezas e Bônus do Capitão Ativo
  const weakness = targetMonster.weaknessClasses || ['ranged'];
  const prefersRanged = weakness.includes('ranged');
  const prefersMelee = weakness.includes('melee');

  const g2Ranged = troops.find((t) => t.id === 'g2_ranged');
  const g1Ranged = troops.find((t) => t.id === 'g1_ranged');
  const g2Melee = troops.find((t) => t.id === 'g2_melee');
  const g1Melee = troops.find((t) => t.id === 'g1_melee');
  const g2Mounted = troops.find((t) => t.id === 'g2_mounted');

  let g2RangedRec = 0;
  let g1RangedRec = 0;
  let g1MeleeRec = 0;
  let g2MeleeRec = 0;
  let g2MountedRec = 0;

  let allocatedGuards = 0;

  if (prefersRanged) {
    // Arqueiros G2 como dano principal com multiplicador total ativo
    const g2EffectiveAtk = Math.round((g2Ranged?.baseAttack || 90) * totalDamageMultiplier * 1.5);
    const g2Needed = Math.ceil(remainingHealthAfterMercs / g2EffectiveAtk);
    g2RangedRec = Math.min(g2Ranged?.ownedCount || 1797, g2Needed, maxGuards - allocatedGuards);
    allocatedGuards += g2RangedRec;

    const remainingHpAfterG2 = Math.max(0, remainingHealthAfterMercs - (g2RangedRec * g2EffectiveAtk));

    if (remainingHpAfterG2 > 0 && allocatedGuards < maxGuards) {
      const g1EffectiveAtk = Math.round((g1Ranged?.baseAttack || 50) * totalDamageMultiplier * 1.5);
      const g1Needed = Math.ceil(remainingHpAfterG2 / g1EffectiveAtk);
      g1RangedRec = Math.min(g1Ranged?.ownedCount || 580, g1Needed, maxGuards - allocatedGuards);
      allocatedGuards += g1RangedRec;
    }

    // Completar o limite de marcha com Bucha (Espadachins G1) para absorver o primeiro impacto
    if (allocatedGuards < maxGuards) {
      const fodderSlots = maxGuards - allocatedGuards;
      g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, fodderSlots);
      allocatedGuards += g1MeleeRec;
    }

    if (allocatedGuards < maxGuards && g2Melee) {
      const fodderSlots2 = maxGuards - allocatedGuards;
      g2MeleeRec = Math.min(g2Melee.ownedCount || 0, fodderSlots2);
      allocatedGuards += g2MeleeRec;
    }
  } else if (prefersMelee) {
    const g2MeleeEffectiveAtk = Math.round((g2Melee?.baseAttack || 90) * totalDamageMultiplier * 1.5);
    const g2Needed = Math.ceil(remainingHealthAfterMercs / g2MeleeEffectiveAtk);
    g2MeleeRec = Math.min(g2Melee?.ownedCount || 1799, g2Needed, maxGuards - allocatedGuards);
    allocatedGuards += g2MeleeRec;

    if (allocatedGuards < maxGuards) {
      g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, maxGuards - allocatedGuards);
      allocatedGuards += g1MeleeRec;
    }

    if (allocatedGuards < maxGuards) {
      g2RangedRec = Math.min(g2Ranged?.ownedCount || 0, maxGuards - allocatedGuards);
      allocatedGuards += g2RangedRec;
    }
  } else {
    g2MountedRec = Math.min(g2Mounted?.ownedCount || 523, maxGuards - allocatedGuards);
    allocatedGuards += g2MountedRec;

    g2RangedRec = Math.min(g2Ranged?.ownedCount || 1797, maxGuards - allocatedGuards);
    allocatedGuards += g2RangedRec;

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, maxGuards - allocatedGuards);
    allocatedGuards += g1MeleeRec;
  }

  // 4. Cálculo Real de Baixas (Casualties)
  const enemyAttack = targetMonster.baseAttack;
  let fodderLosses = 0;
  let heavyLosses = 0;

  if (g1MeleeRec > 0) {
    const fodderUnitHp = g1Melee?.baseHealth || 150;
    fodderLosses = Math.min(g1MeleeRec, Math.ceil(enemyAttack / fodderUnitHp));
  } else if (g2RangedRec > 0) {
    const heavyUnitHp = g2Ranged?.baseHealth || 270;
    heavyLosses = Math.min(g2RangedRec, Math.ceil(enemyAttack / heavyUnitHp));
  }

  // 5. Recompensas recalculadas com os bônus do Capitão Ativo
  const projectedXP = Math.round(
    (targetMonster.xpReward || targetMonster.estimatedCaptainXP) * (1 + activeCaptainLevel * 0.015)
  );
  const projectedVP = Math.round(
    (targetMonster.valorReward || targetMonster.estimatedValorPoints) * (1 + activeCaptainLevel * 0.01)
  );
  const projectedTar = targetMonster.tarReward || Math.round(targetMonster.level * 14000);

  // Lista de capitães para seleção rápida
  const displayedCaptains = (profile.selectedCaptainIds || ['farhad', 'aurora', 'xi_guiying'])
    .map((id) => captains.find((c) => c.id === id))
    .filter(Boolean) as Captain[];

  const handleCopy = () => {
    const leaderText = isRare
      ? `👑 Líder: Herói ${profile.heroName || 'Araning'} (Nv ${profile.heroLevel || 18})`
      : `👑 Capitão: ${activeCaptain.name} (Nv ${activeCaptainLevel} - +${captainBonusPercent}% Bônus)`;

    const text =
      `📜 ORDEM DE MARCHA TOTAL BATTLE\n` +
      `🎯 Alvo: ${targetMonster.name} ${targetMonster.coordinates || ''}\n` +
      `${leaderText}\n` +
      `🐉 Dragão: ${sendDragon ? 'Sim (⚡ 50 Energia)' : 'Não'}\n\n` +
      `🔥 MERCENÁRIOS:\n` +
      `• Titã M5: ${titanRecommended} un.\n\n` +
      `⚔️ EXÉRCITO (${allocatedGuards.toLocaleString('pt-BR')} / ${maxGuards.toLocaleString('pt-BR')}):\n` +
      (g2RangedRec > 0 ? `• [II] Arqueiro de Linha: ${g2RangedRec.toLocaleString('pt-BR')} un. (Dano Principal)\n` : '') +
      (g1RangedRec > 0 ? `• [I] Arqueiro Recruta: ${g1RangedRec.toLocaleString('pt-BR')} un.\n` : '') +
      (g1MeleeRec > 0 ? `• [I] Espadachim (Bucha): ${g1MeleeRec.toLocaleString('pt-BR')} un. (Absorção de Baixas)\n` : '') +
      (g2MeleeRec > 0 ? `• [II] Guerreiro Veterano: ${g2MeleeRec.toLocaleString('pt-BR')} un.\n` : '') +
      (g2MountedRec > 0 ? `• [II] Cavaleiro: ${g2MountedRec.toLocaleString('pt-BR')} un.\n` : '') +
      `\n✅ Resultado Previsto: 0 Baixas em Tropas Pesadas | +${projectedVP.toLocaleString('pt-BR')} VP | +${projectedXP.toLocaleString('pt-BR')} XP`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#1e140d] text-[#f4ebd9] rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-[#caa568] font-serif space-y-5">
      
      {/* 1. Header: Target Badge + Copy Action Button */}
      <div className="bg-gradient-to-r from-[#2e1d12] via-[#24160d] to-[#1a0f08] border border-[#caa568]/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-sans ${
              isRare ? 'bg-purple-900 text-purple-200 border border-purple-500' : isCommon ? 'bg-red-900 text-red-200 border border-red-500' : 'bg-amber-900 text-amber-200 border border-amber-500'
            }`}>
              {isRare ? '👑 ATAQUE RARO' : isCommon ? '⚔️ ATAQUE COMUM' : '🐉 MONSTRO ÉPICO'}
            </span>
            <span className="text-xs font-bold text-[#caa568] font-sans">
              Nível {targetMonster.level}
            </span>
            {targetMonster.coordinates && (
              <span className="text-xs text-[#caa568]/80 font-sans">
                • {targetMonster.coordinates}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#fef08a] font-fantasy tracking-wide">
            {targetMonster.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowEnemyDetails(!showEnemyDetails)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#2a1a10] hover:bg-[#382316] text-[#caa568] hover:text-[#fef08a] border border-[#5a3e22] text-xs font-sans font-bold transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{showEnemyDetails ? 'Ocultar Inimigos' : 'Ver Inimigos'}</span>
            {showEnemyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-sans font-black text-xs shadow-lg transition-all ${
              copied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 text-[#1a1006] ring-2 ring-amber-400/80'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para o Jogo!' : '📋 Copiar para o Jogo'}</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Enemy Squads Drawer (Optional) */}
      {showEnemyDetails && (
        <div className="bg-[#140d08] p-4 rounded-xl border border-[#caa568]/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#5a3e22] pb-2">
            <span className="text-xs font-bold text-[#caa568] flex items-center gap-1.5 font-serif">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Esquadrões Inimigos ({targetMonster.enemySquads?.length || 0} tipos) • HP Total: <strong className="text-red-400 font-sans">{targetMonster.totalHealth.toLocaleString('pt-BR')}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsEditingSquads(true)}
              className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-2.5 py-1 rounded border border-amber-600 transition-all font-sans"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Ajustar Esquadrões</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-sans">
            {targetMonster.enemySquads?.map((sq) => {
              const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
              return (
                <div
                  key={sq.id}
                  onClick={() => setIsEditingSquads(true)}
                  className="bg-[#241912] p-2.5 rounded-lg border border-[#5a3e22] hover:border-[#caa568] cursor-pointer space-y-1.5 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#fef08a] flex items-center gap-1 truncate group-hover:text-amber-300">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-900 text-amber-200 border border-amber-600 font-serif">
                        {tierRoman}
                      </span>
                      {sq.name}
                    </span>
                    <span className="text-xs font-black text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-900">
                      {sq.count.toLocaleString('pt-BR')} un.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 bg-[#120b07] p-1.5 rounded">
                    <div>Força: <strong className="text-amber-300 font-sans">{sq.unitAttack.toLocaleString('pt-BR')}</strong></div>
                    <div>Saúde: <strong className="text-red-400 font-sans">{sq.unitHealth.toLocaleString('pt-BR')}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STEP 1: LIDERANÇA & DRAGÃO (Clean & Direct) */}
      <div className="bg-[#140d08] p-4 rounded-xl border border-[#5a3e22] space-y-3">
        <div className="flex items-center justify-between border-b border-[#5a3e22]/80 pb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#caa568] flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-200 border border-amber-500 flex items-center justify-center text-xs font-black">1</span>
            {isRare ? 'Comandante da Marcha (Herói)' : 'Capitão da Marcha'}
          </span>
          <span className="text-[11px] font-sans font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            {isRare ? `👑 Herói Ativo (Nv ${profile.heroLevel || 18})` : `👑 Líder: ${activeCaptain.name} (+${captainBonusPercent}%)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Left: Captains or Hero (8 cols) */}
          <div className="sm:col-span-8">
            {isRare ? (
              <div className="flex items-center gap-3 bg-[#241912] p-2.5 rounded-xl border border-purple-500/60">
                <div className="w-11 h-11 rounded-lg border border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt="Herói"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#fef08a] truncate">
                    Herói {profile.heroName || 'Araning'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                  </h4>
                  <p className="text-[11px] text-purple-300 font-sans">
                    Nível {profile.heroLevel || 18} • Comandante Oficial para Ataques Raros
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 font-sans">
                {displayedCaptains.map((cap) => {
                  const isSelected = cap.id === activeCapId;
                  const level = profile.captainLevels[cap.id] || cap.level || 1;
                  const bonus = Math.round((cap.monsterAttackBonusPercent || 20) + (level * 1.2));
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => onSelectCaptain(cap.id)}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950 to-[#241912] border-[#eab308] ring-1 ring-[#eab308] shadow-md'
                          : 'bg-[#241912] border-[#5a3e22] hover:border-[#caa568] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg border border-[#caa568]/60 bg-[#140d08] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={cap.avatarIcon} alt={cap.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#fef08a] block truncate font-serif">
                          {cap.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400 block">
                          +{bonus}% Atk
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
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                sendDragon
                  ? 'bg-[#241912] border-emerald-500/70 text-emerald-300'
                  : 'bg-[#180f0a] border-[#5a3e22] text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={sendDragon}
                onChange={(e) => setSendDragon(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-[#100a06] border-[#5a3e22]"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#fef08a] block font-serif">
                  🐉 Dragão (+15% Dano)
                </span>
                <span className="text-[10px] font-sans block text-slate-400">
                  ⚡ 50 / 750 de Energia
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. STEP 2: O QUE COLOCAR NO JOGO (Main Focus / Army Selection Cards) */}
      <div className="bg-[#140d08] p-4 sm:p-5 rounded-xl border-2 border-[#caa568] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5a3e22] pb-2 gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#fef08a] flex items-center gap-2 font-serif">
            <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-200 border border-amber-500 flex items-center justify-center text-xs font-black">2</span>
            Composição Exata para Digitar no Jogo (Ordem de Marcha)
          </span>
          <span className="text-xs font-sans font-bold text-[#caa568]">
            Capacidade de Guardas: <strong className="text-[#fef08a]">{allocatedGuards.toLocaleString('pt-BR')}</strong> / {maxGuards.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-sans">
          
          {/* Card 1: Mercenários Titãs M5 */}
          {titanRecommended > 0 && (
            <div className="bg-gradient-to-b from-[#2a170e] to-[#1e110a] p-3 rounded-xl border-2 border-amber-500/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-amber-500 bg-[#3a1d0e] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/m5_titan.png" alt="Titã M5" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#fef08a] block truncate font-serif">
                    Titã de Fogo (M5)
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    Mercenário de Ataque
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {titanM5?.ownedCount || 81}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-amber-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-amber-200 bg-amber-950/90 px-3 py-0.5 rounded-lg border-2 border-amber-500 shadow-inner">
                  {titanRecommended}
                </span>
              </div>
            </div>
          )}

          {/* Card 2: Arqueiros G2 (Dano Principal) */}
          {g2RangedRec > 0 && (
            <div className="bg-gradient-to-b from-[#102418] to-[#0c1a11] p-3 rounded-xl border-2 border-emerald-500/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-emerald-500 bg-[#0d2816] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/g2_ranged.png" alt="Arqueiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-200 block truncate font-serif">
                    Arqueiro de Linha (G2)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    Dano Principal Seguro
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {g2Ranged?.ownedCount || 1797}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-emerald-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-emerald-200 bg-emerald-950/90 px-3 py-0.5 rounded-lg border-2 border-emerald-500 shadow-inner">
                  {g2RangedRec.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Arqueiros G1 (Dano Complementar) */}
          {g1RangedRec > 0 && (
            <div className="bg-gradient-to-b from-[#102418] to-[#0c1a11] p-3 rounded-xl border-2 border-emerald-600/70 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-emerald-600 bg-[#0d2816] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/g1_ranged.png" alt="Arqueiro G1" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-200 block truncate font-serif">
                    Arqueiro Recruta (G1)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    Dano Suporte
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {g1Ranged?.ownedCount || 580}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-emerald-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-emerald-200 bg-emerald-950/90 px-3 py-0.5 rounded-lg border-2 border-emerald-500 shadow-inner">
                  {g1RangedRec.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Card 4: Espadachins G1 (Bucha / Absorção de Baixas) */}
          {g1MeleeRec > 0 && (
            <div className="bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] p-3 rounded-xl border-2 border-amber-600/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-amber-600 bg-[#351e11] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/g1_melee.png" alt="Espadachim G1" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-200 block truncate font-serif">
                    Espadachim (G1)
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold block">
                    🛡️ Bucha de Absorção
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {g1Melee?.ownedCount || 1369}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-amber-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-amber-200 bg-amber-950/90 px-3 py-0.5 rounded-lg border-2 border-amber-500 shadow-inner">
                  {g1MeleeRec.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Card 5: Guerreiro G2 (Se Melee) */}
          {g2MeleeRec > 0 && (
            <div className="bg-gradient-to-b from-[#2a1010] to-[#1a0808] p-3 rounded-xl border-2 border-red-500/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-red-500 bg-[#381010] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/g2_melee.png" alt="Guerreiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-red-200 block truncate font-serif">
                    Guerreiro Veterano (G2)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {g2Melee?.ownedCount || 1799}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-red-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-red-200 bg-red-950/90 px-3 py-0.5 rounded-lg border-2 border-red-500 shadow-inner">
                  {g2MeleeRec.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* Card 6: Cavaleiro G2 (Se Montada) */}
          {g2MountedRec > 0 && (
            <div className="bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] p-3 rounded-xl border-2 border-amber-600/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-lg border-2 border-amber-600 bg-[#351e11] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/assets/troops/g2_mounted.png" alt="Cavaleiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-200 block truncate font-serif">
                    Cavaleiro Veterano (G2)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estoque: {g2Mounted?.ownedCount || 523}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-[10px] text-amber-400 font-black block tracking-wider">COLOCAR:</span>
                <span className="text-lg font-black text-amber-200 bg-amber-950/90 px-3 py-0.5 rounded-lg border-2 border-amber-500 shadow-inner">
                  {g2MountedRec.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. STEP 3: RESULTADO PREVISTO, BAIXAS & RECOMPENSAS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Casualties / Safety Verdict (7 cols) */}
        <div className="sm:col-span-7 bg-[#140d08] p-3.5 rounded-xl border border-[#5a3e22] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              heavyLosses === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-red-950 text-red-400 border border-red-600'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-[#fef08a] block font-serif">
                {heavyLosses === 0 ? '✅ VITÓRIA GARANTIDA • ZERO BAIXAS PESADAS' : '⚠️ ALERTA DE BAIXAS'}
              </span>
              <p className="text-[11px] text-slate-300 font-sans">
                {heavyLosses === 0
                  ? `Seus Titãs M5 e Arqueiros G2 voltam 100% vivos. ~${fodderLosses} Espadachins G1 absorvem o dano.`
                  : `${heavyLosses} baixas estimadas nas tropas principais.`}
              </p>
            </div>
          </div>
        </div>

        {/* Rewards Summary (5 cols) */}
        <div className="sm:col-span-5 bg-[#140d08] p-3 rounded-xl border border-[#5a3e22] grid grid-cols-3 gap-1.5 text-center font-sans">
          <div className="bg-[#1c120a] p-1.5 rounded border border-[#5a3e22]/60">
            <span className="text-[10px] text-slate-400 block">Bravura (VP):</span>
            <span className="font-extrabold text-blue-400 text-xs">+{projectedVP.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#1c120a] p-1.5 rounded border border-[#5a3e22]/60">
            <span className="text-[10px] text-slate-400 block">XP Capitão:</span>
            <span className="font-extrabold text-emerald-400 text-xs">+{projectedXP.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#1c120a] p-1.5 rounded border border-[#5a3e22]/60">
            <span className="text-[10px] text-slate-400 block">Tar:</span>
            <span className="font-extrabold text-purple-400 text-xs">+{projectedTar.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Edit Squads Modal */}
      {isEditingSquads && onUpdateMonsterTarget && (
        <EditSquadsModal
          isOpen={isEditingSquads}
          onClose={() => setIsEditingSquads(false)}
          initialSquads={targetMonster.enemySquads || []}
          monsterName={targetMonster.name}
          monsterLevel={targetMonster.level}
          onSaveSquads={(newSquads) => {
            const updated = updateMonsterSquads(targetMonster, newSquads);
            onUpdateMonsterTarget(updated);
          }}
        />
      )}
    </div>
  );
};
