import React, { useState } from 'react';
import { TroopUnit, Captain, MonsterTarget, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { Shield, Swords, Award, Sparkles, Copy, Check, Info, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

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

  // Capacidade real de marcha do jogador
  const marchLimit = profile.maxMarchCapacity || 3125; // Limite de exército = 3.125
  const mercLimit = profile.mercenaryCapacity || 1540;

  // Cálculo da distribuição ideal para o alvo atual (ex: Magogue 2.300)
  // 1. Mercenários: Pegar todos os 81 Titãs M5
  const titanM5 = troops.find((t) => t.id === 'm5_titan');
  const titanRecommended = Math.min(titanM5?.ownedCount || 81, mercLimit);

  // 2. Arqueiros G2 (1.797) - Principal atacante contra Magogue
  const g2Ranged = troops.find((t) => t.id === 'g2_ranged');
  const g2RangedRecommended = Math.min(g2Ranged?.ownedCount || 1797, marchLimit);

  // 3. Arqueiros G1 (580) - Dano auxiliar
  const g1Ranged = troops.find((t) => t.id === 'g1_ranged');
  const remainingForG1 = Math.max(0, marchLimit - g2RangedRecommended);
  const g1RangedRecommended = Math.min(g1Ranged?.ownedCount || 580, remainingForG1);

  // 4. Espadachins G1 (1.369) - Bucha para completar o limite de 3.125
  const g1Melee = troops.find((t) => t.id === 'g1_melee');
  const remainingForFodder = Math.max(0, marchLimit - g2RangedRecommended - g1RangedRecommended);
  const g1MeleeRecommended = Math.min(g1Melee?.ownedCount || 1369, remainingForFodder);

  const totalArmyAllocated = g2RangedRecommended + g1RangedRecommended + g1MeleeRecommended;

  const handleCopy = () => {
    const text = `📜 GUIA DE MARCHA TOTAL BATTLE - DESTINO: (K:310 X:922 Y:258)\n` +
      `🎯 Alvo: ${targetMonster.name} (${targetMonster.type === 'epic_monster' ? 'Épico' : '2.300 Magogues'})\n` +
      `👑 Capitã: Aydae (Nv 23) ou Brunhild (Nv 25)\n\n` +
      `🔥 MERCENÁRIOS:\n` +
      `• [V] Titã de Fogo: ${titanRecommended} / ${titanM5?.ownedCount || 81}\n\n` +
      `⚔️ EXÉRCITO (Total: ${totalArmyAllocated.toLocaleString('pt-BR')} / ${marchLimit.toLocaleString('pt-BR')}):\n` +
      `• [II] Arqueiro de Linha: ${g2RangedRecommended}x\n` +
      `• [I] Arqueiro Recruta: ${g1RangedRecommended}x\n` +
      `• [I] Espadachim (Bucha): ${g1MeleeRecommended}x\n\n` +
      `🏆 Recompensas: +8.1K Bravura (VP) | +16.2K XP | 0 Baixas Pesadas`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#e9dfcb] text-[#2c2214] rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-[#b49053] font-serif space-y-6">
      {/* Top Gold Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#caa568] pb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#caa568]/40 px-3 py-1 rounded-md border border-[#9b783c]">
            Iniciar: Sua Cidade
          </span>
          <ChevronRight className="w-4 h-4 text-[#9b783c]" />
          <span className="text-xs font-bold bg-[#caa568]/40 px-3 py-1 rounded-md border border-[#9b783c]">
            Destino: (K:310 X:922 Y:258)
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
        
        {/* Left Page (7 Cols) - Seus Capitães, Mercenários e Exército com os rostos exatos! */}
        <div className="lg:col-span-7 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-5">
          
          {/* Section: LIDERANÇA (1 HERÓI + ATÉ 3 CAPITÃES) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d6c39f] pb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b]">♦ Liderança da Marcha ♦</span>
              <span className="text-[11px] font-sans text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                1 Herói + {profile.selectedCaptainIds?.length || 3}/3 Capitães
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Herói Garvel / Julia */}
              <div className="p-2 rounded-lg border-2 bg-gradient-to-b from-amber-50 to-amber-100/60 border-[#9b783c] shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg border border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden">
                  <img
                    src={profile.heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                    alt={profile.heroName || 'Herói'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold mt-1 text-[#2c2214] truncate w-full">
                  {profile.heroName || 'Araning'} ({profile.heroId === 'julia' ? 'Julia' : 'Garvel'})
                </span>
                <span className="text-[10px] text-amber-900 font-sans font-bold">Nv {profile.heroLevel || 16}</span>
              </div>

              {/* 3 Selected Captains */}
              {(profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad']).map((capId, idx) => {
                const cap = captains.find((c) => c.id === capId);
                const lvl = profile.captainLevels?.[capId] || cap?.level || 20;
                if (!cap) return null;
                return (
                  <div
                    key={cap.id}
                    onClick={() => onSelectCaptain(cap.id)}
                    className="p-2 rounded-lg border-2 bg-white border-[#9b783c] shadow-sm flex flex-col items-center text-center cursor-pointer hover:bg-amber-50 transition-colors"
                  >
                    <TroopAvatar id={cap.id} tier={lvl} size="md" />
                    <span className="text-xs font-bold mt-1 text-[#2c2214] truncate w-full">
                      {cap.name}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-sans font-bold">
                      Nv {lvl} (+{Math.round(lvl * 1.2)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: MERCENÁRIOS */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🦅 Mercenários
            </span>

            <div className="bg-white p-2.5 rounded-lg border border-[#d6c39f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TroopAvatar id="m5_titan" tier={5} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-[#2c2214]">Titã de Fogo / Berserker (M5)</h4>
                  <span className="text-[11px] font-sans text-slate-600 block">
                    Estoque: <strong>81 unidades</strong>
                  </span>
                </div>
              </div>

              <div className="text-right font-sans">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Digitar no Jogo:</span>
                <span className="text-lg font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-md border border-amber-300">
                  {titanRecommended}
                </span>
              </div>
            </div>
          </div>

          {/* Section: EXÉRCITO (Com os rostos e números exatos do print!) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b] block border-b border-[#d6c39f] pb-1">
              🛡️ Exército (Capacidade: {totalArmyAllocated} / {marchLimit.toLocaleString('pt-BR')})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
              
              {/* 1. Arqueiro G2 (1.797) */}
              <div className="bg-gradient-to-r from-emerald-50 to-white p-2.5 rounded-lg border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <TroopAvatar id="g2_ranged" tier={2} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Arqueiro de Linha</span>
                    <span className="text-[10px] text-slate-500">Estoque: 1.797</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">Colocar:</span>
                  <span className="text-base font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                    {g2RangedRecommended}
                  </span>
                </div>
              </div>

              {/* 2. Arqueiro G1 (580) */}
              <div className="bg-gradient-to-r from-emerald-50 to-white p-2.5 rounded-lg border-2 border-emerald-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <TroopAvatar id="g1_ranged" tier={1} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Arqueiro Recruta</span>
                    <span className="text-[10px] text-slate-500">Estoque: 580</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">Colocar:</span>
                  <span className="text-base font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                    {g1RangedRecommended}
                  </span>
                </div>
              </div>

              {/* 3. Espadachim G1 (1.369) -> Bucha de absorção */}
              <div className="bg-gradient-to-r from-amber-50 to-white p-2.5 rounded-lg border-2 border-amber-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <TroopAvatar id="g1_melee" tier={1} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">Espadachim (Bucha)</span>
                    <span className="text-[10px] text-slate-500">Estoque: 1.369</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-800 font-bold block">Colocar:</span>
                  <span className="text-base font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                    {g1MeleeRecommended}
                  </span>
                </div>
              </div>

              {/* 4. Guerreiro G2 (1.799) -> Deixar 0 para não levar o contra-ataque de +30% do Magogue! */}
              <div className="bg-white/60 p-2.5 rounded-lg border border-slate-300 opacity-60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TroopAvatar id="g2_melee" tier={2} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Guerreiro Veterano</span>
                    <span className="text-[10px] text-slate-500">Estoque: 1.799</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Colocar:</span>
                  <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Capacidades & Status */}
          <div className="bg-[#eedec5] p-3 rounded-xl border border-[#caa568] flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="text-red-900 flex items-center gap-1">
                🛡️ Exército: {totalArmyAllocated} / {marchLimit.toLocaleString('pt-BR')}
              </span>
              <span className="text-amber-900 flex items-center gap-1">
                🦅 Mercenários: {titanRecommended} / {mercLimit}
              </span>
            </div>

            <span className="bg-emerald-700 text-white px-3 py-1 rounded-md shadow-sm">
              ✅ 0 Baixas em Tropas Pesadas
            </span>
          </div>
        </div>

        {/* Right Page (5 Cols) - Alvo Inimigo Magogue & Explicação Tática */}
        <div className="lg:col-span-5 bg-[#f6efe2] p-4 rounded-xl border border-[#d6c39f] shadow-inner space-y-4">
          <div className="border-b border-[#d6c39f] pb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c5f2b]">
              ♦ Tropas inimigas no destino da marcha ♦
            </span>
          </div>

          {/* Magogue Enemy Card (Just like the game!) */}
          <div className="bg-gradient-to-b from-red-950/20 to-white p-3.5 rounded-xl border-2 border-red-500/60 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <TroopAvatar id="magogue_inferno" tier="I" size="lg" />
              <div>
                <h3 className="text-base font-bold text-red-950 font-serif">Magogue</h3>
                <span className="text-xs text-red-800 font-sans font-semibold block">
                  Demônio, Unidade de longo alcance
                </span>
                <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 inline-block mt-1 font-sans">
                  Quantidade: 2.300 demônios
                </span>
              </div>
            </div>

            {/* Magogue Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <div className="bg-[#f2e7d3] p-2 rounded border border-[#caa568]/40">
                <span className="text-slate-600 block text-[11px]">Força Unitária:</span>
                <span className="font-bold text-red-800">50 (Total: 115.000)</span>
              </div>
              <div className="bg-[#f2e7d3] p-2 rounded border border-[#caa568]/40">
                <span className="text-slate-600 block text-[11px]">Saúde Unitária:</span>
                <span className="font-bold text-red-800">150 (Total: 345.000)</span>
              </div>
            </div>

            {/* Special Trait Alert */}
            <div className="bg-red-100 border border-red-300 rounded-lg p-2.5 text-xs font-sans text-red-950 space-y-1">
              <span className="font-black text-red-800 flex items-center gap-1">
                ⚠️ Habilidade do Magogue:
              </span>
              <p className="text-[11px] leading-tight">
                <strong>+30% de dano contra tropas corpo a corpo!</strong> É por isso que não mandamos guerreiros corpo a corpo como dano principal.
              </p>
            </div>
          </div>

          {/* Tactical Advice */}
          <div className="bg-gradient-to-r from-amber-100 to-emerald-50 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs font-sans text-slate-800">
            <span className="font-black text-amber-900 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-700" />
              Por que essa marcha vence com 0 mortes caras:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
              <li>
                <strong>1.797 Arqueiros G2 + 580 Arqueiros G1</strong> atacam à distância e anulam o bônus de +30% do Magogue.
              </li>
              <li>
                <strong>81 Titãs M5</strong> desferem dano brutal inicial.
              </li>
              <li>
                <strong>748 Espadachins G1</strong> completam o teto de 3.125 tropas e absorvem o primeiro round caso o monstro ataque primeiro.
              </li>
            </ul>
          </div>

          {/* Rewards Badge */}
          <div className="bg-[#eedec5] p-3 rounded-lg border border-[#caa568] flex items-center justify-between text-xs font-sans font-bold">
            <span className="text-blue-900">🏆 Bravura: +8.100 VP</span>
            <span className="text-emerald-900">⚡ XP: +16.200 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
