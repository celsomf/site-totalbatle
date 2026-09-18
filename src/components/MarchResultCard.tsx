import React, { useState } from 'react';
import { MarchRecommendation } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { ShieldCheck, Copy, Check, AlertTriangle, Award, Coins, Flame, Swords } from 'lucide-react';

interface MarchResultCardProps {
  recommendation: MarchRecommendation;
}

export const MarchResultCard: React.FC<MarchResultCardProps> = ({ recommendation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarch = () => {
    const fodderLines = recommendation.squads
      .filter((s) => s.role === 'fodder')
      .map((s, idx) => `Slot #${idx + 1} [Bucha]: ${s.count}x ${s.unitName}`)
      .join('\n');

    const damageLines = recommendation.squads
      .filter((s) => s.role !== 'fodder')
      .map((s) => `Núcleo de Dano: ${s.count.toLocaleString('pt-BR')}x ${s.unitName}`)
      .join('\n');

    const formattedText = `⚔️ MARCHA TOTAL BATTLE - ${recommendation.targetName.toUpperCase()} (Nível ${recommendation.targetLevel})\n` +
      `👤 Capitão: ${recommendation.captainName}\n` +
      `🛡️ BUCHAS DE ABSORÇÃO (2n+1):\n${fodderLines}\n\n` +
      `💥 TROPAS DE DANO:\n${damageLines}\n\n` +
      `📊 Total de Tropas: ${recommendation.totalMarchSize.toLocaleString('pt-BR')} / ${recommendation.maxCapacity.toLocaleString('pt-BR')}\n` +
      `💰 Custo Templo (Prata): ~${recommendation.estimatedTempleRevivalSilver.toLocaleString('pt-BR')}\n` +
      `🏆 Pontos de Bravura (VP): +${recommendation.projectedValorPoints.toLocaleString('pt-BR')}`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fodderSquads = recommendation.squads.filter((s) => s.role === 'fodder');
  const damageSquads = recommendation.squads.filter((s) => s.role !== 'fodder');

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-5 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5a3e22] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
              <ShieldCheck className="w-6 h-6 text-[#fef08a]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#fef08a] font-fantasy tracking-wide">
              Marcha Recomendada (2n+1)
            </h2>
          </div>
          <p className="text-xs text-[#caa568]/80 mt-1">
            Blindagem de Max-HP para {recommendation.targetName} (Nível {recommendation.targetLevel})
          </p>
        </div>

        <button
          onClick={handleCopyMarch}
          className={`tb-btn-green flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs shadow-lg transition-all ${
            copied ? '!bg-emerald-700 !border-emerald-400' : ''
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado para o Jogo!' : 'Copiar Marcha Completa'}
        </button>
      </div>

      {/* Capacity Utilization Bar */}
      <div className="bg-[#180f0a] p-3 rounded-lg border border-[#5a3e22] space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#caa568] flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-amber-400" />
            Capacidade de Marcha:
          </span>
          <span className={recommendation.exceedsCapacity ? 'text-red-400' : 'text-[#fef08a]'}>
            {recommendation.totalMarchSize.toLocaleString('pt-BR')} / {recommendation.maxCapacity.toLocaleString('pt-BR')} ({recommendation.capacityUtilizationPercent}%)
          </span>
        </div>
        <div className="w-full bg-[#100a06] h-2.5 rounded-full overflow-hidden border border-[#5a3e22]">
          <div
            className={`h-full transition-all duration-300 ${
              recommendation.exceedsCapacity ? 'bg-red-600' : 'bg-gradient-to-r from-[#caa568] to-[#2e7d32]'
            }`}
            style={{ width: `${Math.min(100, recommendation.capacityUtilizationPercent)}%` }}
          />
        </div>
        {recommendation.exceedsCapacity && (
          <div className="flex items-center gap-1.5 text-xs text-amber-300 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
            <span>Aviso: A marcha calculada atinge o limite total da sua liderança.</span>
          </div>
        )}
      </div>

      {/* ROI & Rewards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#180f0a] border border-[#5a3e22] p-3 rounded-lg">
          <span className="text-[11px] text-blue-300 font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-blue-400" /> Bravura (VP)
          </span>
          <span className="text-base font-black text-blue-100 block mt-1">
            +{recommendation.projectedValorPoints.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="bg-[#180f0a] border border-[#5a3e22] p-3 rounded-lg">
          <span className="text-[11px] text-[#caa568] font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> XP de Capitão
          </span>
          <span className="text-base font-black text-[#fef08a] block mt-1">
            +{recommendation.projectedCaptainXP.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="bg-[#180f0a] border border-[#5a3e22] p-3 rounded-lg">
          <span className="text-[11px] text-purple-300 font-bold flex items-center gap-1">
            🎁 Baú de Clã (CP)
          </span>
          <span className="text-base font-black text-purple-100 block mt-1">
            +{recommendation.projectedChestPoints} pts
          </span>
        </div>

        <div className="bg-[#180f0a] border border-[#5a3e22] p-3 rounded-lg">
          <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-emerald-400" /> Templo (Prata)
          </span>
          <span className="text-base font-black text-emerald-100 block mt-1">
            ~{recommendation.estimatedTempleRevivalSilver.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Squad Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[#fef08a] flex items-center gap-1.5 font-fantasy">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Distribuição dos Slots na Formação:
        </h3>

        {/* Fodder Stacks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#caa568] px-1">
            <span>🛡️ Slots de Sacrifício / Buchas (Absorvem Ataques Inimigos):</span>
            <span className="text-[#fef08a]">{fodderSquads.length} slots separados</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {fodderSquads.map((squad, idx) => (
              <div
                key={squad.unitId}
                className="bg-[#180f0a] border-2 border-[#5a3e22] p-2.5 rounded-lg text-xs flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <TroopAvatar id={squad.unitId.split('_stack_')[0]} tier={squad.tier} size="sm" />
                  <div>
                    <span className="font-bold text-[#fef08a] block">Slot #{idx + 1}</span>
                    <span className="text-[#caa568] text-[11px] truncate block max-w-[90px]">{squad.unitName.split('[')[0]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#fef08a] text-sm block">{squad.count}x</span>
                  <span className="text-[10px] font-bold text-amber-400">Absorção</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Damage Squads */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#caa568] px-1">
            <span>💥 Núcleo de Dano Principal (Zero Baixas com Stacking):</span>
          </div>
          {damageSquads.map((squad) => (
            <div
              key={squad.unitId}
              className="bg-gradient-to-r from-[#180f0a] to-[#2a170d] border-2 border-[#caa568] p-3 rounded-lg flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <TroopAvatar id={squad.unitId} tier={squad.tier} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-[#fef08a] font-fantasy">{squad.unitName}</h4>
                  <span className="text-xs text-[#caa568] font-serif block">
                    Ataque: {squad.totalSquadAttack.toLocaleString('pt-BR')} • Saúde: {squad.totalSquadHealth.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#fef08a] block">{squad.count.toLocaleString('pt-BR')} tropas</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-600">
                  ✅ 0 Mortes Caras
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tactical Notes */}
      {recommendation.tacticalNotes.length > 0 && (
        <div className="bg-[#180f0a] border border-[#5a3e22] rounded-lg p-3 space-y-1 text-xs text-[#caa568]">
          <span className="font-bold text-[#fef08a] block font-fantasy">💡 Dica Estratégica do Conselheiro:</span>
          <ul className="list-disc list-inside space-y-0.5 text-[#caa568]/90">
            {recommendation.tacticalNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
