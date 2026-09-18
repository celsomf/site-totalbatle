import React, { useState } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { Copy, Check, ChevronRight, Zap, Flame, ShieldAlert, Sparkles, UserCheck, Shield } from 'lucide-react';

interface MarchBookViewProps {
  profile: PlayerProfile;
  troops: TroopUnit[];
  captains: Captain[];
  selectedCaptainId: string;
  onSelectCaptain: (id: string) => void;
  targetMonster: MonsterTarget;
}

export const MarchBookView: React.FC<MarchBookViewProps> = ({
  profile,
  troops,
  captains,
  selectedCaptainId,
  onSelectCaptain,
  targetMonster,
}) => {
  const [copied, setCopied] = useState(false);
  const [sendDragon, setSendDragon] = useState(true);

  const isRare = targetMonster.attackMode === 'rare';
  const isCommon = targetMonster.attackMode === 'common';
  const isEpic = targetMonster.attackMode === 'epic';

  // Capacidades de marcha dinâmicas
  const maxGuards = targetMonster.marchCapacities?.guards || (isRare ? 5250 : isCommon ? 2000 : profile.maxMarchCapacity || 3125);
  const maxMercs = targetMonster.marchCapacities?.mercenaries || (isRare ? 2520 : isCommon ? 1000 : profile.mercenaryCapacity || 1540);
  const maxMonsters = targetMonster.marchCapacities?.monsters || (isRare ? 1260 : isCommon ? 500 : profile.specialCapacity || 770);

  // 1. Mercenários: Titãs M5
  const titanM5 = troops.find((t) => t.id === 'm5_titan');
  const titanRecommended = Math.min(titanM5?.ownedCount || 81, maxMercs);

  // 2. Cálculo dinâmico do exército baseado no alvo
  // Identifica a classe primária de fraqueza do inimigo
  const weakness = targetMonster.weaknessClasses || ['ranged'];
  const prefersRanged = weakness.includes('ranged');
  const prefersMelee = weakness.includes('melee');
  const prefersMounted = weakness.includes('mounted');

  // Arqueiros disponíveis
  const g2Ranged = troops.find((t) => t.id === 'g2_ranged');
  const g1Ranged = troops.find((t) => t.id === 'g1_ranged');

  // Infantaria disponível
  const g2Melee = troops.find((t) => t.id === 'g2_melee');
  const g1Melee = troops.find((t) => t.id === 'g1_melee');

  // Cavalaria disponível
  const g2Mounted = troops.find((t) => t.id === 'g2_mounted');

  let g2RangedRec = 0;
  let g1RangedRec = 0;
  let g1MeleeRec = 0;
  let g2MeleeRec = 0;
  let g2MountedRec = 0;

  let allocated = 0;

  if (prefersRanged) {
    // Foco em Arqueiros como atacantes principais
    g2RangedRec = Math.min(g2Ranged?.ownedCount || 1797, maxGuards - allocated);
    allocated += g2RangedRec;

    g1RangedRec = Math.min(g1Ranged?.ownedCount || 580, maxGuards - allocated);
    allocated += g1RangedRec;

    // Se sobrou espaço, completa com Espadachins G1 de bucha
    if (allocated < maxGuards) {
      g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, maxGuards - allocated);
      allocated += g1MeleeRec;
    }

    if (allocated < maxGuards) {
      g2MeleeRec = Math.min(g2Melee?.ownedCount || 0, maxGuards - allocated);
      allocated += g2MeleeRec;
    }
  } else if (prefersMelee) {
    g2MeleeRec = Math.min(g2Melee?.ownedCount || 1799, maxGuards - allocated);
    allocated += g2MeleeRec;

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, maxGuards - allocated);
    allocated += g1MeleeRec;

    if (allocated < maxGuards) {
      g2RangedRec = Math.min(g2Ranged?.ownedCount || 0, maxGuards - allocated);
      allocated += g2RangedRec;
    }
  } else {
    // Padrão equilibrado
    g2MountedRec = Math.min(g2Mounted?.ownedCount || 523, maxGuards - allocated);
    allocated += g2MountedRec;

    g2RangedRec = Math.min(g2Ranged?.ownedCount || 1797, maxGuards - allocated);
    allocated += g2RangedRec;

    g1MeleeRec = Math.min(g1Melee?.ownedCount || 1369, maxGuards - allocated);
    allocated += g1MeleeRec;
  }

  const totalArmyAllocated = allocated;

  const handleCopy = () => {
    const leaderText = isRare
      ? `👑 Líder: Herói ${profile.heroName || 'Araning'} (Nv ${profile.heroLevel || 18})`
      : `👑 Capitão: ${(profile.selectedCaptainIds || ['farhad']).join(', ').toUpperCase()}`;

    const text = `📜 GUIA DE MARCHA TOTAL BATTLE - DESTINO: ${targetMonster.coordinates || '(K:310 X:924 Y:264)'}\n` +
      `🎯 Alvo: ${targetMonster.name} [${isRare ? 'ATAQUE RARO' : isCommon ? 'ATAQUE COMUM' : 'ÉPICO'}]\n` +
      `${leaderText}\n` +
      `🐉 Dragão: ${sendDragon ? 'Sim (50 Energia)' : 'Não'}\n\n` +
      `🔥 MERCENÁRIOS:\n` +
      `• Titã de Fogo / Berserker (M5): ${titanRecommended} un.\n\n` +
      `⚔️ EXÉRCITO (Total: ${totalArmyAllocated.toLocaleString('pt-BR')} / ${maxGuards.toLocaleString('pt-BR')}):\n` +
      (g2RangedRec > 0 ? `• [II] Arqueiro de Linha: ${g2RangedRec.toLocaleString('pt-BR')}x\n` : '') +
      (g1RangedRec > 0 ? `• [I] Arqueiro Recruta: ${g1RangedRec.toLocaleString('pt-BR')}x\n` : '') +
      (g1MeleeRec > 0 ? `• [I] Espadachim (Bucha): ${g1MeleeRec.toLocaleString('pt-BR')}x\n` : '') +
      (g2MeleeRec > 0 ? `• [II] Guerreiro Veterano: ${g2MeleeRec.toLocaleString('pt-BR')}x\n` : '') +
      (g2MountedRec > 0 ? `• [II] Cavaleiro: ${g2MountedRec.toLocaleString('pt-BR')}x\n` : '') +
      `\n🏆 Recompensas: +${(targetMonster.valorReward || targetMonster.estimatedValorPoints).toLocaleString('pt-BR')} VP | +${(targetMonster.xpReward || targetMonster.estimatedCaptainXP).toLocaleString('pt-BR')} XP | 0 Baixas Pesadas`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedCaptainsList = (profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad'])
    .map((id) => captains.find((c) => c.id === id))
    .filter(Boolean) as Captain[];

  return (
    <div className="bg-[#e9dfcb] text-[#2c2214] rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-[#b49053] font-serif space-y-6">
      {/* Top Gold Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#caa568] pb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold bg-[#caa568]/40 px-3 py-1 rounded-md border border-[#9b783c]">
            Iniciar: Sua Cidade
          </span>
          <ChevronRight className="w-4 h-4 text-[#9b783c]" />
          <span className="text-xs font-bold bg-[#caa568]/40 px-3 py-1 rounded-md border border-[#9b783c]">
            Destino: {targetMonster.coordinates || '(K:310 X:924 Y:264)'}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded font-bold font-sans ${
            isRare ? 'bg-purple-800 text-purple-100' : isCommon ? 'bg-red-800 text-red-100' : 'bg-amber-800 text-amber-100'
          }`}>
            {isRare ? '⚔️ Ataque Raro' : isCommon ? '⚔️ Ataque Comum' : '👑 Monstro Épico'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans font-bold text-xs shadow-md transition-all ${
            copied ? 'bg-emerald-700 text-white' : 'bg-gradient-to-r from-[#9b783c] to-[#7c5f2b] text-white hover:brightness-110'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado para o Jogo!' : 'Copiar Quantidades para o Jogo'}
        </button>
      </div>

      {/* Main 2-Page Book Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Page (7 Cols) - Liderança, Dragão, Mercenários, Exército */}
        <div className="lg:col-span-7 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-4">
          {/* Section: LIDERANÇA DA MARCHA (Adaptada para Ataque Comum vs Raro) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d6c39f] pb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b]">
                ♦ {isRare ? 'Herói (Líder do Ataque Raro)' : isCommon ? 'Capitães (Ataque Comum)' : 'Liderança da Marcha'} ♦
              </span>
              <span className="text-[11px] font-sans text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                {isRare ? '1 Herói Ativo' : isCommon ? `${selectedCaptainsList.length} Capitão(ães) Ativo(s)` : 'Herói + Capitães'}
              </span>
            </div>

            {/* If Rare Attack: Only Hero is sent */}
            {isRare && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border-2 border-purple-400">
                <div className="w-14 h-14 rounded-lg border-2 border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt={profile.heroName || 'Herói'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-950 font-serif">
                    {profile.heroName || 'Araning'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                  </h4>
                  <span className="text-xs text-purple-800 font-sans font-bold block">
                    Nível {profile.heroLevel || 18} • Líder Oficial de Ataques Raros
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Capacidade de Guardas expandida para {maxGuards.toLocaleString('pt-BR')} unidades.
                  </span>
                </div>
              </div>
            )}

            {/* If Common Attack: Only Captains are sent */}
            {isCommon && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[0, 1, 2].map((slotIdx) => {
                  const cap = selectedCaptainsList[slotIdx];
                  if (!cap) {
                    return (
                      <div
                        key={`empty-slot-${slotIdx}`}
                        className="p-2 rounded-lg border border-dashed border-[#b49053]/50 bg-white/40 text-center flex flex-col items-center justify-center text-[#7c5f2b]/60"
                      >
                        <UserCheck className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Slot {slotIdx + 1} Vazio</span>
                      </div>
                    );
                  }
                  const lvl = profile.captainLevels?.[cap.id] || cap.level;
                  const isChecked = slotIdx === 0; // Primeiro capitão é o líder ativo
                  return (
                    <div
                      key={cap.id}
                      onClick={() => onSelectCaptain(cap.id)}
                      className={`p-2 rounded-lg border-2 text-center transition-all cursor-pointer relative ${
                        isChecked
                          ? 'bg-gradient-to-b from-amber-100 to-white border-amber-600 shadow-sm'
                          : 'bg-white border-[#caa568]/60 hover:border-amber-600'
                      }`}
                    >
                      <div className="relative inline-block">
                        <TroopAvatar id={cap.id} tier={lvl} size="md" />
                        {isChecked && (
                          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 text-[9px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold mt-1 text-[#2c2214] block truncate">
                        {cap.name}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-sans font-bold">
                        Nv {lvl}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* If Epic Attack: 1 Hero + 3 Captains */}
            {isEpic && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg border-2 bg-gradient-to-b from-amber-50 to-amber-100/60 border-[#9b783c] shadow-sm flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-lg border border-[#caa568] bg-[#3a2214] overflow-hidden">
                    <img
                      src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                      alt="Herói"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold mt-1 text-[#2c2214] truncate w-full">
                    {profile.heroName || 'Araning'}
                  </span>
                  <span className="text-[10px] text-amber-900 font-sans font-bold">Nv {profile.heroLevel || 18}</span>
                </div>

                {selectedCaptainsList.slice(0, 3).map((cap) => {
                  const lvl = profile.captainLevels?.[cap.id] || cap.level;
                  return (
                    <div
                      key={cap.id}
                      onClick={() => onSelectCaptain(cap.id)}
                      className="p-2 rounded-lg border-2 bg-white border-[#9b783c] shadow-sm flex flex-col items-center text-center cursor-pointer"
                    >
                      <TroopAvatar id={cap.id} tier={lvl} size="sm" />
                      <span className="text-[11px] font-bold mt-1 text-[#2c2214] truncate w-full">
                        {cap.name}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-sans font-bold">Nv {lvl}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: DRAGÃO (Exatamente como na janela de marcha do jogo!) */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🐉 Dragão
            </span>

            <div className="bg-white p-2.5 rounded-lg border border-[#d6c39f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border-2 border-amber-600 bg-gradient-to-b from-red-800 to-amber-950 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <span className="text-2xl">🐉</span>
                  <span className="absolute bottom-0 right-0 bg-amber-600 text-amber-950 font-bold text-[9px] px-1 rounded-tl">
                    Nv 15
                  </span>
                </div>

                <div className="font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      ⚡ 50 Energia
                    </span>
                    <span className="text-xs text-slate-600">
                      Você tem: <strong className="text-amber-800">⚡ 750</strong>
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendDragon}
                      onChange={(e) => setSendDragon(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-[#2c2214]">Enviar Dragão (+15% Dano Total)</span>
                  </label>
                </div>
              </div>

              <span className={`text-[10px] font-sans font-bold px-2 py-1 rounded ${
                sendDragon ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {sendDragon ? 'Ativo na Marcha' : 'Dragão no Ninho'}
              </span>
            </div>
          </div>

          {/* Section: MERCENÁRIOS */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🦅 Mercenários
            </span>

            <div className="bg-white p-2.5 rounded-lg border border-[#d6c39f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TroopAvatar id="m5_titan" tier={5} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-[#2c2214]">Titã de Fogo / Berserker (M5)</h4>
                  <span className="text-[11px] font-sans text-slate-600 block">
                    Estoque do Jogador: <strong>81 unidades</strong>
                  </span>
                </div>
              </div>

              <div className="text-right font-sans">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Digitar no Jogo:</span>
                <span className="text-lg font-black text-amber-700 bg-amber-100 px-3 py-0.5 rounded-md border border-amber-300">
                  {titanRecommended}
                </span>
              </div>
            </div>
          </div>

          {/* Section: EXÉRCITO / TROPAS */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🛡️ Exército (Capacidade: {totalArmyAllocated.toLocaleString('pt-BR')} / {maxGuards.toLocaleString('pt-BR')})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
              {/* Arqueiros G2 */}
              {g2RangedRec > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-white p-2 rounded-lg border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <TroopAvatar id="g2_ranged" tier={2} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Arqueiro de Linha</span>
                      <span className="text-[10px] text-slate-500">Estoque: {g2Ranged?.ownedCount || 1797}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold block">Colocar:</span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                      {g2RangedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Arqueiros G1 */}
              {g1RangedRec > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-white p-2 rounded-lg border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <TroopAvatar id="g1_ranged" tier={1} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Arqueiro Recruta</span>
                      <span className="text-[10px] text-slate-500">Estoque: {g1Ranged?.ownedCount || 580}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold block">Colocar:</span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                      {g1RangedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Espadachim G1 (Bucha) */}
              {g1MeleeRec > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-white p-2 rounded-lg border-2 border-amber-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <TroopAvatar id="g1_melee" tier={1} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">Espadachim (Bucha)</span>
                      <span className="text-[10px] text-slate-500">Estoque: {g1Melee?.ownedCount || 1369}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-800 font-bold block">Colocar:</span>
                    <span className="text-sm font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                      {g1MeleeRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Guerreiro Veterano G2 */}
              {g2MeleeRec > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-white p-2 rounded-lg border-2 border-red-500 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <TroopAvatar id="g2_melee" tier={2} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-red-950 block">Guerreiro Veterano</span>
                      <span className="text-[10px] text-slate-500">Estoque: {g2Melee?.ownedCount || 1799}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-red-800 font-bold block">Colocar:</span>
                    <span className="text-sm font-black text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-400">
                      {g2MeleeRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Cavaleiro G2 */}
              {g2MountedRec > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-white p-2 rounded-lg border-2 border-amber-600 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <TroopAvatar id="g2_mounted" tier={2} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">Cavaleiro Veterano</span>
                      <span className="text-[10px] text-slate-500">Estoque: {g2Mounted?.ownedCount || 523}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-800 font-bold block">Colocar:</span>
                    <span className="text-sm font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                      {g2MountedRec.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Capacidades & Status de Baixas */}
          <div className="bg-[#eedec5] p-3 rounded-xl border border-[#caa568] flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="text-red-900 flex items-center gap-1">
                🛡️ Guardas: {totalArmyAllocated.toLocaleString('pt-BR')} / {maxGuards.toLocaleString('pt-BR')}
              </span>
              <span className="text-amber-900 flex items-center gap-1">
                🦅 Mercs: {titanRecommended} / {maxMercs.toLocaleString('pt-BR')}
              </span>
              <span className="text-purple-900 flex items-center gap-1">
                🦁 Monstros: 0 / {maxMonsters.toLocaleString('pt-BR')}
              </span>
            </div>

            <span className="bg-emerald-700 text-white px-3 py-1 rounded-md shadow-sm">
              ✅ 0 Baixas em Tropas Pesadas
            </span>
          </div>
        </div>

        {/* Right Page (5 Cols) - Alvo Inimigo & Esquadrões Reais */}
        <div className="lg:col-span-5 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-4">
          <div className="flex items-center justify-between border-b border-[#d6c39f] pb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b]">
              ♦ Tropas Inimigas no Destino ♦
            </span>
            <span className="text-xs font-black text-red-800 font-sans">
              Nv {targetMonster.level}
            </span>
          </div>

          {/* Enemy Squads Display */}
          <div className="space-y-2.5">
            {targetMonster.enemySquads && targetMonster.enemySquads.length > 0 ? (
              targetMonster.enemySquads.map((sq) => {
                const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
                return (
                  <div
                    key={sq.id}
                    className="bg-white p-3 rounded-xl border-2 border-red-500/60 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-900 text-amber-100 border border-amber-600 font-serif font-bold">
                          {tierRoman}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-red-950 font-serif">{sq.name}</h4>
                          <span className="text-[10px] text-slate-600 font-sans block">{sq.subType}</span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-red-800 bg-red-100 px-2.5 py-1 rounded border border-red-300 font-sans">
                        {sq.count.toLocaleString('pt-BR')} un.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans bg-[#fbf7ee] p-1.5 rounded border border-[#d6c39f]">
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
                      <div className="text-[10px] text-red-900 bg-red-50 p-1.5 rounded border border-red-200 font-sans">
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

          {/* Tactical Explanation */}
          <div className="bg-gradient-to-r from-amber-100 to-emerald-50 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs font-sans text-slate-800">
            <span className="font-black text-amber-900 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-700" />
              Estratégia Vitoriosa com 0 Baixas Caras:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
              {prefersRanged && (
                <li>
                  <strong>Arqueiros G2 & G1</strong> atacam primeiro à distância e anulam a vantagem de montadas e voadores.
                </li>
              )}
              <li>
                <strong>{titanRecommended} Titãs M5</strong> desferem dano frontal esmagador.
              </li>
              {g1MeleeRec > 0 && (
                <li>
                  <strong>{g1MeleeRec.toLocaleString('pt-BR')} Espadachins G1</strong> servem de blindagem (bucha sacrificial) para proteger arqueiros e mercenários no Round 1.
                </li>
              )}
            </ul>
          </div>

          {/* Rewards Badge */}
          <div className="bg-[#eedec5] p-3 rounded-lg border border-[#caa568] flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-blue-900">
              🏆 Bravura: +{(targetMonster.valorReward || targetMonster.estimatedValorPoints).toLocaleString('pt-BR')} VP
            </span>
            <span className="text-emerald-900">
              ⚡ XP: +{(targetMonster.xpReward || targetMonster.estimatedCaptainXP).toLocaleString('pt-BR')} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
