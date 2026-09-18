import React, { useState, useMemo } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile, EnemySquadUnit } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { EditSquadsModal } from './EditSquadsModal';
import { updateMonsterSquads } from '../data/monsters';
import { Copy, Check, ChevronRight, Zap, Flame, ShieldAlert, Sparkles, UserCheck, Shield, CheckCircle2, Edit3 } from 'lucide-react';

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
  const titanDamage = Math.round((titanM5?.baseAttack || 4600) * titanRecommended * (1 + (dragonBonusPercent + (profile.academyBonus?.monstersAttack || 20)) / 100));

  // 2. Dano necessário para abater o monstro
  const enemyHealth = targetMonster.totalHealth;
  const remainingHealthAfterMercs = Math.max(0, enemyHealth - titanDamage);

  // 3. Alocação Inteligente de Tropas baseada nas Fraquezas e Bônus do Capitão Ativo
  const weakness = targetMonster.weaknessClasses || ['ranged'];
  const prefersRanged = weakness.includes('ranged');
  const prefersMelee = weakness.includes('melee');
  const prefersMounted = weakness.includes('mounted');

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

  // Lista de capitães disponíveis para exibição nos slots
  const displayedCaptains = (profile.selectedCaptainIds || ['farhad', 'aurora', 'xi_guiying'])
    .map((id) => captains.find((c) => c.id === id))
    .filter(Boolean) as Captain[];

  const handleCopy = () => {
    const leaderText = isRare
      ? `👑 Líder: Herói ${profile.heroName || 'Araning'} (Nv ${profile.heroLevel || 18})`
      : `👑 Capitão Ativo: ${activeCaptain.name} (Nv ${activeCaptainLevel} - +${captainBonusPercent}% Bônus)`;

    const text = `📜 GUIA DE MARCHA TOTAL BATTLE - DESTINO: ${targetMonster.coordinates || '(K:310 X:924 Y:264)'}\n` +
      `🎯 Alvo: ${targetMonster.name} [${isRare ? 'ATAQUE RARO' : isCommon ? 'ATAQUE COMUM' : 'ÉPICO'}]\n` +
      `${leaderText}\n` +
      `🐉 Dragão: ${sendDragon ? 'Sim (⚡ 50 Energia)' : 'Não'}\n\n` +
      `🔥 MERCENÁRIOS:\n` +
      `• Titã de Fogo / Berserker (M5): ${titanRecommended} un.\n\n` +
      `⚔️ EXÉRCITO (Total: ${allocatedGuards.toLocaleString('pt-BR')} / ${maxGuards.toLocaleString('pt-BR')}):\n` +
      (g2RangedRec > 0 ? `• [II] Arqueiro de Linha: ${g2RangedRec.toLocaleString('pt-BR')}x\n` : '') +
      (g1RangedRec > 0 ? `• [I] Arqueiro Recruta: ${g1RangedRec.toLocaleString('pt-BR')}x\n` : '') +
      (g1MeleeRec > 0 ? `• [I] Espadachim (Bucha): ${g1MeleeRec.toLocaleString('pt-BR')}x\n` : '') +
      (g2MeleeRec > 0 ? `• [II] Guerreiro Veterano: ${g2MeleeRec.toLocaleString('pt-BR')}x\n` : '') +
      (g2MountedRec > 0 ? `• [II] Cavaleiro: ${g2MountedRec.toLocaleString('pt-BR')}x\n` : '') +
      `\n🏆 Recompensas: +${projectedVP.toLocaleString('pt-BR')} VP | +${projectedXP.toLocaleString('pt-BR')} XP | 0 Baixas Pesadas`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#e9dfcb] text-[#2c2214] rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-[#b49053] font-serif space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#caa568] pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="bg-[#caa568]/40 px-2.5 py-1 rounded-md border border-[#9b783c]">
            Iniciar: Sua Cidade
          </span>
          <ChevronRight className="w-4 h-4 text-[#9b783c] flex-shrink-0" />
          <span className="bg-[#caa568]/40 px-2.5 py-1 rounded-md border border-[#9b783c]">
            Destino: {targetMonster.coordinates || '(K:310 X:924 Y:264)'}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-sans text-xs ${
            isRare ? 'bg-purple-800 text-purple-100' : isCommon ? 'bg-red-800 text-red-100' : 'bg-amber-800 text-amber-100'
          }`}>
            {isRare ? '👑 Ataque Raro' : isCommon ? '⚔️ Ataque Comum' : '🐉 Monstro Épico'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans font-bold text-xs shadow-md transition-all flex-shrink-0 ${
            copied ? 'bg-emerald-700 text-white' : 'bg-gradient-to-r from-[#9b783c] to-[#7c5f2b] text-white hover:brightness-110'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado para o Jogo!' : 'Copiar Quantidades para o Jogo'}
        </button>
      </div>

      {/* Main 2-Page Book Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Page (7 Cols): March Leadership, Dragon, Mercenaries, Army */}
        <div className="lg:col-span-7 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-4">
          
          {/* Section: LIDERANÇA DA MARCHA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d6c39f] pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c5f2b]">
                ♦ {isRare ? 'Herói da Marcha' : 'Capitães da Marcha'} ♦
              </span>
              <span className="text-[11px] font-sans text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                {isRare ? 'Herói Líder' : `Líder Ativo: ${activeCaptain.name} (+${captainBonusPercent}%)`}
              </span>
            </div>

            {/* Ataque Raro: Herói como Líder Exclusivo */}
            {isRare && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100/70 to-white p-3 rounded-xl border-2 border-purple-400">
                <div className="w-13 h-13 rounded-lg border-2 border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt="Herói"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-purple-950 truncate">
                    {profile.heroName || 'Araning'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                  </h4>
                  <span className="text-xs text-purple-800 font-sans font-bold block">
                    Nível {profile.heroLevel || 18} • Comandante Oficial de Ataques Raros
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Capacidade de Guardas expandida para {maxGuards.toLocaleString('pt-BR')} soldados.
                  </span>
                </div>
              </div>
            )}

            {/* Ataque Comum: Seleção Dinâmica do Capitão Líder com Bônus recalculados */}
            {isCommon && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-600 font-sans">
                  Clique no capitão para ativá-lo como <strong>Líder da Marcha</strong> e recalcular os bônus:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {displayedCaptains.slice(0, 3).map((cap) => {
                    const lvl = profile.captainLevels[cap.id] || cap.level || 1;
                    const isActive = cap.id === activeCaptain.id;
                    const bonus = Math.round((cap.monsterAttackBonusPercent || 20) + (lvl * 1.2));

                    return (
                      <div
                        key={cap.id}
                        onClick={() => onSelectCaptain(cap.id)}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer relative flex flex-col items-center justify-between ${
                          isActive
                            ? 'bg-gradient-to-b from-amber-100 via-amber-50 to-white border-amber-600 shadow-md ring-2 ring-amber-500/50'
                            : 'bg-white/80 border-[#caa568]/60 hover:bg-amber-50/50 hover:border-amber-500'
                        }`}
                      >
                        <div className="relative inline-block mb-1">
                          <TroopAvatar id={cap.id} tier={lvl} size="md" />
                          {isActive && (
                            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-[#2c2214] block truncate w-full">
                          {cap.name}
                        </span>

                        <span className="text-[10px] text-amber-900 font-sans font-bold block">
                          Nv {lvl} (+{bonus}%)
                        </span>

                        {isActive && (
                          <span className="mt-1 text-[9px] font-sans font-black uppercase tracking-wider bg-amber-600 text-white px-1.5 py-0.2 rounded">
                            Líder Ativo
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ataque Épico: 1 Herói + até 3 Capitães */}
            {isEpic && (
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-lg border-2 bg-amber-100 border-[#9b783c] flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded border border-[#caa568] bg-[#3a2214] overflow-hidden mb-1">
                    <img
                      src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                      alt="Herói"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold truncate w-full">{profile.heroName || 'Araning'}</span>
                  <span className="text-[9px] text-amber-900 font-sans font-bold">Nv {profile.heroLevel || 18}</span>
                </div>

                {displayedCaptains.slice(0, 3).map((cap) => {
                  const lvl = profile.captainLevels[cap.id] || cap.level || 1;
                  const isActive = cap.id === activeCaptain.id;
                  return (
                    <div
                      key={cap.id}
                      onClick={() => onSelectCaptain(cap.id)}
                      className={`p-2 rounded-lg border-2 flex flex-col items-center text-center cursor-pointer ${
                        isActive ? 'bg-amber-100 border-amber-600 shadow' : 'bg-white border-[#caa568]/60'
                      }`}
                    >
                      <TroopAvatar id={cap.id} tier={lvl} size="sm" />
                      <span className="text-[11px] font-bold truncate w-full mt-1">{cap.name}</span>
                      <span className="text-[9px] text-emerald-800 font-sans font-bold">Nv {lvl}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: DRAGÃO (Layout Limpo sem Sobreposição) */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🐉 Dragão
            </span>

            <div className="bg-white p-3 rounded-xl border border-[#d6c39f] space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-lg border-2 border-amber-600 bg-gradient-to-b from-red-800 to-amber-950 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-inner">
                    <span className="text-xl">🐉</span>
                    <span className="absolute bottom-0 right-0 bg-amber-600 text-amber-950 font-bold text-[8px] px-1 rounded-tl font-sans">
                      Nv 15
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2c2214] block font-sans">
                      Dragão Guardião da Cidade
                    </span>
                    <div className="flex items-center gap-2 text-xs font-sans mt-0.5">
                      <span className="text-amber-900 font-bold bg-amber-100 px-2 py-0.2 rounded border border-amber-300">
                        ⚡ Custo: 50 Energia
                      </span>
                      <span className="text-slate-600">
                        Saldo: <strong className="text-amber-800">⚡ 750</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-sans font-bold px-2 py-1 rounded flex-shrink-0 ${
                  sendDragon ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {sendDragon ? 'Ativo na Marcha' : 'No Ninho'}
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={sendDragon}
                    onChange={(e) => setSendDragon(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#2c2214]">
                    Enviar Dragão no Ataque (+15% de Dano em todas as tropas)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: MERCENÁRIOS */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🦅 Mercenários
            </span>

            <div className="bg-white p-3 rounded-xl border border-[#d6c39f] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <TroopAvatar id="m5_titan" tier={5} size="md" />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#2c2214] truncate">
                    Titã de Fogo / Berserker (M5)
                  </h4>
                  <span className="text-[11px] font-sans text-slate-600 block">
                    Estoque no Quartel: <strong className="text-[#2c2214]">81 unidades</strong>
                  </span>
                </div>
              </div>

              <div className="text-right font-sans flex-shrink-0">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">DIGITAR NO JOGO:</span>
                <span className="text-lg font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-md border border-amber-300">
                  {titanRecommended}
                </span>
              </div>
            </div>
          </div>

          {/* Section: EXÉRCITO / TROPAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d6c39f] pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c5f2b]">
                🛡️ Exército Recomendado
              </span>
              <span className="text-xs font-sans font-bold text-amber-900">
                Capacidade: {allocatedGuards.toLocaleString('pt-BR')} / {maxGuards.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans">
              {/* Arqueiros G2 */}
              {g2RangedRec > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-white p-2.5 rounded-xl border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TroopAvatar id="g2_ranged" tier={2} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-950 block truncate">Arqueiro de Linha</span>
                      <span className="text-[10px] text-slate-500 block">Estoque: {g2Ranged?.ownedCount || 1797}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-emerald-800 font-bold block">COLOCAR:</span>
                    <span className="text-base font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-400">
                      {g2RangedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Arqueiros G1 */}
              {g1RangedRec > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-white p-2.5 rounded-xl border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TroopAvatar id="g1_ranged" tier={1} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-950 block truncate">Arqueiro Recruta</span>
                      <span className="text-[10px] text-slate-500 block">Estoque: {g1Ranged?.ownedCount || 580}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-emerald-800 font-bold block">COLOCAR:</span>
                    <span className="text-base font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-400">
                      {g1RangedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Espadachins G1 (Bucha) */}
              {g1MeleeRec > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-white p-2.5 rounded-xl border-2 border-amber-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TroopAvatar id="g1_melee" tier={1} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-amber-950 block truncate">Espadachim (Bucha)</span>
                      <span className="text-[10px] text-slate-500 block">Estoque: {g1Melee?.ownedCount || 1369}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-amber-800 font-bold block">COLOCAR:</span>
                    <span className="text-base font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-400">
                      {g1MeleeRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Guerreiro Veterano G2 */}
              {g2MeleeRec > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-white p-2.5 rounded-xl border-2 border-red-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TroopAvatar id="g2_melee" tier={2} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-red-950 block truncate">Guerreiro Veterano</span>
                      <span className="text-[10px] text-slate-500 block">Estoque: {g2Melee?.ownedCount || 1799}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-red-800 font-bold block">COLOCAR:</span>
                    <span className="text-base font-black text-red-800 bg-red-100 px-2.5 py-0.5 rounded-md border border-red-400">
                      {g2MeleeRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Cavaleiro G2 */}
              {g2MountedRec > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-white p-2.5 rounded-xl border-2 border-amber-600 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TroopAvatar id="g2_mounted" tier={2} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-amber-950 block truncate">Cavaleiro Veterano</span>
                      <span className="text-[10px] text-slate-500 block">Estoque: {g2Mounted?.ownedCount || 523}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-amber-800 font-bold block">COLOCAR:</span>
                    <span className="text-base font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-400">
                      {g2MountedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Capacidades & Status de Baixas */}
          <div className="bg-[#eedec5] p-3 rounded-xl border border-[#caa568] flex flex-wrap items-center justify-between gap-3 font-sans text-xs font-bold">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-red-900">
                🛡️ Guardas: <strong>{allocatedGuards.toLocaleString('pt-BR')} / {maxGuards.toLocaleString('pt-BR')}</strong>
              </span>
              <span className="text-amber-900">
                🦅 Mercs: <strong>{titanRecommended} / {maxMercs.toLocaleString('pt-BR')}</strong>
              </span>
              <span className="text-purple-900">
                🦁 Monstros: <strong>0 / {maxMonsters.toLocaleString('pt-BR')}</strong>
              </span>
            </div>

            <span className={`px-3 py-1 rounded-md shadow-sm ${
              heavyLosses === 0 ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
            }`}>
              {heavyLosses === 0
                ? (fodderLosses > 0 ? `✅ 0 Baixas Pesadas (~${fodderLosses} Buchas)` : '✅ 0 Baixas em Combate')
                : `⚠️ ${heavyLosses} Baixas Estimadas`}
            </span>
          </div>
        </div>

        {/* Right Page (5 Cols): Enemy Troops & Strategy */}
        <div className="lg:col-span-5 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-4">
          <div className="flex items-center justify-between border-b border-[#d6c39f] pb-2 gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7c5f2b]">
              ♦ Tropas Inimigas no Destino ♦
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-red-800 font-sans bg-red-100 px-2 py-0.5 rounded border border-red-300">
                Nível {targetMonster.level}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingSquads(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2 py-0.5 rounded border border-amber-500 shadow-sm transition-all"
                title="Editar quantidade ou atributos dos esquadrões inimigos"
              >
                <Edit3 className="w-3 h-3 text-amber-800" />
                <span>✏️ Ajustar</span>
              </button>
            </div>
          </div>

          {/* Enemy Squads Display */}
          <div className="space-y-3">
            {targetMonster.enemySquads && targetMonster.enemySquads.length > 0 ? (
              targetMonster.enemySquads.map((sq) => {
                const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
                return (
                  <div
                    key={sq.id}
                    onClick={() => setIsEditingSquads(true)}
                    className="bg-white p-3 rounded-xl border-2 border-red-500/60 shadow-sm space-y-2 cursor-pointer hover:border-red-600 transition-all group"
                    title="Clique para editar este esquadrão"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-900 text-amber-100 border border-amber-600 font-serif font-bold flex-shrink-0">
                          {tierRoman}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-red-950 font-serif truncate leading-tight group-hover:text-amber-900 transition-colors">
                            {sq.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-sans block truncate">
                            {sq.subType}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-red-800 bg-red-100 px-2.5 py-1 rounded-md border border-red-300 font-sans flex-shrink-0">
                        {sq.count.toLocaleString('pt-BR')} un.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans bg-[#fbf7ee] p-2 rounded-lg border border-[#d6c39f]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Força Unitária:</span>
                        <span className="font-bold text-amber-800">{sq.unitAttack.toLocaleString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Saúde Unitária:</span>
                        <span className="font-bold text-red-800">{sq.unitHealth.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {sq.aspects?.description && (
                      <div className="text-[10px] text-red-900 bg-red-50 p-1.5 rounded-md border border-red-200 font-sans leading-tight">
                        ⚠️ <strong>{sq.aspects.description}</strong>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-4 rounded-xl border border-red-300 text-center">
                <span className="text-sm font-bold text-red-950 block">{targetMonster.name}</span>
                <span className="text-xs text-slate-600">Total HP: {targetMonster.totalHealth.toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>

          {/* Tactical Strategy */}
          <div className="bg-gradient-to-r from-amber-100 to-emerald-50 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs font-sans text-slate-800">
            <span className="font-black text-amber-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-700" />
              Estratégia Vitoriosa com 0 Baixas Caras:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
              {prefersRanged && (
                <li>
                  <strong>Arqueiros G2 & G1</strong> atacam primeiro à distância com bônus de <strong>+{captainBonusPercent}%</strong> de {activeCaptain.name}.
                </li>
              )}
              <li>
                <strong>{titanRecommended} Titãs M5</strong> aplicam {titanDamage.toLocaleString('pt-BR')} de dano frontal esmagador.
              </li>
              {g1MeleeRec > 0 && (
                <li>
                  <strong>{g1MeleeRec.toLocaleString('pt-BR')} Espadachins G1</strong> servem de blindagem sacrificial para absorver o contra-ataque.
                </li>
              )}
            </ul>
          </div>

          {/* Rewards Badge */}
          <div className="bg-[#eedec5] p-3 rounded-xl border border-[#caa568] flex items-center justify-between gap-2 text-xs font-sans font-bold">
            <span className="text-blue-900">
              🏆 Bravura: +{projectedVP.toLocaleString('pt-BR')} VP
            </span>
            <span className="text-emerald-900">
              ⚡ XP: +{projectedXP.toLocaleString('pt-BR')} XP
            </span>
          </div>
        </div>
      </div>

      {/* Edit Squads Modal for MarchBookView */}
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
