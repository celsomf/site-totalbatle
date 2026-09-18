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
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
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

  const handleCopySingleNumber = (label: string, count: number) => {
    navigator.clipboard.writeText(count.toString());
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 1800);
  };

  return (
    <div className="bg-[#1c120a] text-white rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-[#caa568] space-y-6">
      
      {/* 1. Header: Target Badge + Copy Action Button */}
      <div className="bg-gradient-to-r from-[#2e1d12] via-[#24160d] to-[#1a0f08] border-2 border-[#caa568] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-3 py-1 rounded-md text-xs font-black tracking-wide ${
              isRare ? 'bg-purple-800 text-purple-100 border border-purple-400' : isCommon ? 'bg-red-800 text-red-100 border border-red-400' : 'bg-amber-700 text-amber-100 border border-amber-400'
            }`}>
              {isRare ? '👑 ATAQUE RARO (HERÓI)' : isCommon ? '⚔️ ATAQUE COMUM (CAPITÃO)' : '🐉 MONSTRO ÉPICO'}
            </span>
            <span className="text-xs font-black text-amber-300 bg-[#120804] px-2.5 py-1 rounded border border-[#5a3e22]">
              Nível {targetMonster.level}
            </span>
            {targetMonster.coordinates && (
              <span className="text-xs font-bold text-amber-200/90 bg-[#120804] px-2.5 py-1 rounded border border-[#5a3e22]">
                📍 {targetMonster.coordinates}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-yellow-300 tracking-tight">
            {targetMonster.name}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowEnemyDetails(!showEnemyDetails)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#2a1a10] hover:bg-[#3d2719] text-amber-200 hover:text-yellow-300 border-2 border-[#5a3e22] text-xs font-bold transition-all shadow"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{showEnemyDetails ? 'Ocultar Inimigos' : 'Ver Inimigos'}</span>
            {showEnemyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-black text-xs shadow-lg transition-all ${
              copied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-[#2a1a10] hover:bg-[#3d2719] text-amber-200 hover:text-yellow-300 border-2 border-[#5a3e22]'
            }`}
            title="Copia um resumo em texto para compartilhar no Chat do Clã ou Discord"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Copiado para o Chat do Clã!' : '💬 Copiar Texto para o Clã'}</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Enemy Squads Drawer (Optional) */}
      {showEnemyDetails && (
        <div className="bg-[#120a06] p-4 sm:p-5 rounded-xl border-2 border-[#caa568]/60 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#5a3e22] pb-2.5">
            <span className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Esquadrões Inimigos ({targetMonster.enemySquads?.length || 0} tipos) • HP Total: <strong className="text-red-400 font-extrabold">{targetMonster.totalHealth.toLocaleString('pt-BR')}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsEditingSquads(true)}
              className="flex items-center gap-1.5 text-xs font-black text-amber-200 bg-amber-950 hover:bg-amber-900 px-3 py-1.5 rounded-lg border border-amber-500 transition-all shadow"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>✏️ Ajustar Esquadrões</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {targetMonster.enemySquads?.map((sq) => {
              const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
              return (
                <div
                  key={sq.id}
                  onClick={() => setIsEditingSquads(true)}
                  className="bg-[#241912] p-3 rounded-xl border-2 border-[#5a3e22] hover:border-[#caa568] cursor-pointer space-y-2 transition-all group shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-200 flex items-center gap-1.5 truncate group-hover:text-yellow-300">
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-950 text-amber-200 border border-amber-500 font-bold">
                        {tierRoman}
                      </span>
                      {sq.name}
                    </span>
                    <span className="text-xs font-black text-red-200 bg-red-950 px-2.5 py-1 rounded border border-red-700 shadow-sm">
                      {sq.count.toLocaleString('pt-BR')} un.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-200 bg-[#120b07] p-2 rounded-lg border border-[#5a3e22]/60">
                    <div>Força: <strong className="text-amber-300 font-bold">{sq.unitAttack.toLocaleString('pt-BR')}</strong></div>
                    <div>Saúde: <strong className="text-red-400 font-bold">{sq.unitHealth.toLocaleString('pt-BR')}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STEP 1: LIDERANÇA & DRAGÃO */}
      <div className="bg-[#120a06] p-4 sm:p-5 rounded-xl border-2 border-[#5a3e22] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#5a3e22] pb-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-800 text-yellow-200 border border-amber-400 flex items-center justify-center text-xs font-black shadow">1</span>
            {isRare ? 'Comandante da Marcha (Herói)' : 'Capitão da Marcha'}
          </span>
          <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-md border border-emerald-600 shadow-sm">
            {isRare ? `👑 Herói Ativo (Nv ${profile.heroLevel || 18})` : `👑 Líder: ${activeCaptain.name} (+${captainBonusPercent}%)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Left: Captains or Hero (8 cols) */}
          <div className="sm:col-span-8">
            {isRare ? (
              <div className="flex items-center gap-3.5 bg-[#241912] p-3 rounded-xl border-2 border-purple-500/80 shadow-md">
                <div className="w-12 h-12 rounded-lg border-2 border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt="Herói"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-black text-yellow-300 truncate">
                    Herói {profile.heroName || 'Araning'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                  </h4>
                  <p className="text-xs font-bold text-purple-300">
                    Nível {profile.heroLevel || 18} • Comandante Oficial para Ataques Raros
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {displayedCaptains.map((cap) => {
                  const isSelected = cap.id === activeCapId;
                  const level = profile.captainLevels[cap.id] || cap.level || 1;
                  const bonus = Math.round((cap.monsterAttackBonusPercent || 20) + (level * 1.2));
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => onSelectCaptain(cap.id)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950 to-[#2e1d12] border-yellow-400 ring-2 ring-yellow-400/80 shadow-lg'
                          : 'bg-[#241912] border-[#5a3e22] hover:border-[#caa568] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg border-2 border-[#caa568] bg-[#140d08] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                        <img src={cap.avatarIcon} alt={cap.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-black text-yellow-200 block truncate">
                          {cap.name}
                        </span>
                        <span className="text-xs font-black text-emerald-400 block">
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
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all shadow-md ${
                sendDragon
                  ? 'bg-[#241912] border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/60'
                  : 'bg-[#180f0a] border-[#5a3e22] text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={sendDragon}
                onChange={(e) => setSendDragon(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-[#100a06] border-[#caa568]"
              />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-yellow-300 block">
                  🐉 Dragão (+15% Dano)
                </span>
                <span className="text-xs font-bold text-slate-300 block">
                  ⚡ 50 / 750 de Energia
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. STEP 2: O QUE COLOCAR NO JOGO (Main Focus / High Contrast Cards) */}
      <div className="bg-[#120a06] p-4 sm:p-6 rounded-xl border-2 border-[#caa568] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5a3e22] pb-3 gap-2">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-yellow-200 border border-amber-400 flex items-center justify-center text-xs font-black shadow">2</span>
              Composição de Marcha (Digite estes valores na tela do jogo)
            </span>
            <span className="text-xs font-bold text-amber-200/90 block pt-1">
              ⌨️ Digite ou deslize os campos do quartel/marcha no Total Battle com as quantidades abaixo:
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-amber-200 bg-[#241912] px-3 py-1.5 rounded-lg border border-[#5a3e22]">
            Capacidade de Guardas: <strong className="text-yellow-300 font-black">{allocatedGuards.toLocaleString('pt-BR')}</strong> / {maxGuards.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* Card 1: Mercenários Titãs M5 */}
          {titanRecommended > 0 && (
            <div className="bg-gradient-to-b from-[#2e170c] to-[#1c0e07] p-3.5 rounded-xl border-2 border-amber-500 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-amber-400 bg-[#3a1d0e] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/m5_titan.png" alt="Titã M5" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-yellow-200 block truncate">
                    Titã de Fogo (M5)
                  </span>
                  <span className="text-xs font-black text-amber-300 block">
                    Mercenário de Ataque
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {titanM5?.ownedCount || 81}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('m5', titanRecommended)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-amber-300 font-black block tracking-wider">
                  {copiedNumber === 'm5' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-yellow-300 bg-[#0d0704] px-3.5 py-1 rounded-lg border-2 border-amber-400 shadow-inner group-hover:border-yellow-300 transition-colors inline-block">
                  {titanRecommended}
                </span>
              </button>
            </div>
          )}

          {/* Card 2: Arqueiros G2 (Dano Principal) */}
          {g2RangedRec > 0 && (
            <div className="bg-gradient-to-b from-[#0f2d1c] to-[#0a1f13] p-3.5 rounded-xl border-2 border-emerald-500 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-emerald-400 bg-[#0d2816] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/g2_ranged.png" alt="Arqueiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-emerald-100 block truncate">
                    Arqueiro de Linha (G2)
                  </span>
                  <span className="text-xs font-black text-emerald-400 block">
                    Dano Principal Seguro
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {g2Ranged?.ownedCount || 1797}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('g2_ranged', g2RangedRec)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-emerald-300 font-black block tracking-wider">
                  {copiedNumber === 'g2_ranged' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-emerald-200 bg-[#05140b] px-3.5 py-1 rounded-lg border-2 border-emerald-400 shadow-inner group-hover:border-emerald-300 transition-colors inline-block">
                  {g2RangedRec.toLocaleString('pt-BR')}
                </span>
              </button>
            </div>
          )}

          {/* Card 3: Arqueiros G1 (Dano Complementar) */}
          {g1RangedRec > 0 && (
            <div className="bg-gradient-to-b from-[#0f2d1c] to-[#0a1f13] p-3.5 rounded-xl border-2 border-emerald-600 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-emerald-500 bg-[#0d2816] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/g1_ranged.png" alt="Arqueiro G1" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-emerald-100 block truncate">
                    Arqueiro Recruta (G1)
                  </span>
                  <span className="text-xs font-black text-emerald-400 block">
                    Dano Suporte
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {g1Ranged?.ownedCount || 580}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('g1_ranged', g1RangedRec)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-emerald-300 font-black block tracking-wider">
                  {copiedNumber === 'g1_ranged' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-emerald-200 bg-[#05140b] px-3.5 py-1 rounded-lg border-2 border-emerald-400 shadow-inner group-hover:border-emerald-300 transition-colors inline-block">
                  {g1RangedRec.toLocaleString('pt-BR')}
                </span>
              </button>
            </div>
          )}

          {/* Card 4: Espadachins G1 (Bucha / Absorção de Baixas) */}
          {g1MeleeRec > 0 && (
            <div className="bg-gradient-to-b from-[#2e1d12] to-[#1c110a] p-3.5 rounded-xl border-2 border-amber-600 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-amber-500 bg-[#351e11] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/g1_melee.png" alt="Espadachim G1" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-amber-100 block truncate">
                    Espadachim (G1)
                  </span>
                  <span className="text-xs font-black text-amber-400 block">
                    🛡️ Bucha de Absorção
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {g1Melee?.ownedCount || 1369}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('g1_melee', g1MeleeRec)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-amber-300 font-black block tracking-wider">
                  {copiedNumber === 'g1_melee' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-amber-200 bg-[#0d0704] px-3.5 py-1 rounded-lg border-2 border-amber-400 shadow-inner group-hover:border-yellow-300 transition-colors inline-block">
                  {g1MeleeRec.toLocaleString('pt-BR')}
                </span>
              </button>
            </div>
          )}

          {/* Card 5: Guerreiro G2 (Se Melee) */}
          {g2MeleeRec > 0 && (
            <div className="bg-gradient-to-b from-[#2e1212] to-[#1c0909] p-3.5 rounded-xl border-2 border-red-500 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-red-400 bg-[#381010] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/g2_melee.png" alt="Guerreiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-red-100 block truncate">
                    Guerreiro Veterano (G2)
                  </span>
                  <span className="text-xs font-black text-red-400 block">
                    Dano Frontal
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {g2Melee?.ownedCount || 1799}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('g2_melee', g2MeleeRec)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-red-300 font-black block tracking-wider">
                  {copiedNumber === 'g2_melee' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-red-200 bg-[#0d0404] px-3.5 py-1 rounded-lg border-2 border-red-400 shadow-inner group-hover:border-red-300 transition-colors inline-block">
                  {g2MeleeRec.toLocaleString('pt-BR')}
                </span>
              </button>
            </div>
          )}

          {/* Card 6: Cavaleiro G2 (Se Montada) */}
          {g2MountedRec > 0 && (
            <div className="bg-gradient-to-b from-[#2e1d12] to-[#1c110a] p-3.5 rounded-xl border-2 border-amber-600 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl border-2 border-amber-500 bg-[#351e11] flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
                  <img src="/assets/troops/g2_mounted.png" alt="Cavaleiro G2" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).src='/assets/troops/default.png'}} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black text-amber-100 block truncate">
                    Cavaleiro Veterano (G2)
                  </span>
                  <span className="text-xs font-black text-amber-400 block">
                    Dano Montado Rápido
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Estoque: {g2Mounted?.ownedCount || 523}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopySingleNumber('g2_mounted', g2MountedRec)}
                className="text-right flex-shrink-0 pl-2 cursor-pointer group"
                title="Clique para copiar este número"
              >
                <span className="text-xs text-amber-300 font-black block tracking-wider">
                  {copiedNumber === 'g2_mounted' ? 'COPIADO!' : 'COLOCAR:'}
                </span>
                <span className="text-xl font-black text-amber-200 bg-[#0d0704] px-3.5 py-1 rounded-lg border-2 border-amber-400 shadow-inner group-hover:border-yellow-300 transition-colors inline-block">
                  {g2MountedRec.toLocaleString('pt-BR')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. STEP 3: RESULTADO PREVISTO, BAIXAS & RECOMPENSAS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Casualties / Safety Verdict (7 cols) */}
        <div className="sm:col-span-7 bg-[#120a06] p-4 rounded-xl border-2 border-[#5a3e22] flex items-center justify-between gap-3.5 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shadow ${
              heavyLosses === 0 ? 'bg-emerald-950 text-emerald-400 border-2 border-emerald-500' : 'bg-red-950 text-red-400 border-2 border-red-500'
            }`}>
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-yellow-300 block">
                {heavyLosses === 0 ? '✅ VITÓRIA GARANTIDA • ZERO BAIXAS PESADAS' : '⚠️ ALERTA DE BAIXAS'}
              </span>
              <p className="text-xs font-bold text-slate-200 pt-0.5">
                {heavyLosses === 0
                  ? `Seus Titãs M5 e Arqueiros G2 voltam 100% vivos. ~${fodderLosses} Espadachins G1 absorvem o dano frontal.`
                  : `${heavyLosses} baixas estimadas nas tropas principais.`}
              </p>
            </div>
          </div>
        </div>

        {/* Rewards Summary (5 cols) */}
        <div className="sm:col-span-5 bg-[#120a06] p-3.5 rounded-xl border-2 border-[#5a3e22] grid grid-cols-3 gap-2 text-center shadow-lg">
          <div className="bg-[#1c120a] p-2 rounded-lg border border-[#5a3e22]">
            <span className="text-xs font-bold text-slate-300 block">Bravura (VP):</span>
            <span className="font-black text-blue-300 text-sm sm:text-base">+{projectedVP.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#1c120a] p-2 rounded-lg border border-[#5a3e22]">
            <span className="text-xs font-bold text-slate-300 block">XP Capitão:</span>
            <span className="font-black text-emerald-300 text-sm sm:text-base">+{projectedXP.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#1c120a] p-2 rounded-lg border border-[#5a3e22]">
            <span className="text-xs font-bold text-slate-300 block">Pontos Tar:</span>
            <span className="font-black text-purple-300 text-sm sm:text-base">+{projectedTar.toLocaleString('pt-BR')}</span>
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
