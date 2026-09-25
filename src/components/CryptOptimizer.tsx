import React, { useState } from 'react';
import { PlayerProfile, TroopUnit, Captain } from '../types';
import { calculateCryptOneShot } from '../engine/crypt';
import { Compass, CheckCircle2, Copy, Check, Zap, Shield, Sparkles } from 'lucide-react';
import { TroopAvatar } from './TroopAvatar';

interface CryptOptimizerProps {
  profile: PlayerProfile;
  troops: TroopUnit[];
  captain: Captain;
}

export const CryptOptimizer: React.FC<CryptOptimizerProps> = ({ profile, troops, captain }) => {
  const [cryptLevel, setCryptLevel] = useState<number>(15);
  const [copied, setCopied] = useState(false);

  const recommendation = calculateCryptOneShot(profile, troops, captain, cryptLevel);

  const handleCopy = () => {
    const squad = recommendation.recommendedSquads[0];
    const text =
      `🧭 MARCHA CRIPTA 1-SHOT - NÍVEL ${cryptLevel}\n` +
      `👤 Capitão: ${captain.name}\n` +
      `⚡ Consumo de Alcatrão (Tar): ${recommendation.tarCost} pts\n` +
      `💥 Tropa Recomendada: ${squad?.count.toLocaleString('pt-BR')}x ${squad?.unitName}\n` +
      `🛡️ Baixas Esperadas: 0 (1-Hit KO)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const primarySquad = recommendation.recommendedSquads[0];

  return (
    <div className="bg-[#111827] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-700/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b0f19] p-5 rounded-2xl border border-slate-700/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 flex-shrink-0">
            <Compass className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Caçador de Criptas (1-Hit KO)
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400">
              Cálculo exato de tropas para eliminar a cripta no 1º turno sem perdas e com menor consumo de Alcatrão (Tar)
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
            copied
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado!' : 'Copiar Marcha da Cripta'}</span>
        </button>
      </div>

      {/* Crypt Level Selector & Tar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Slider Card (7 cols) */}
        <div className="md:col-span-7 bg-[#0b0f19] p-5 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">Nível da Cripta:</span>
            <span className="font-black text-amber-300 text-base font-mono">Nível {cryptLevel}</span>
          </div>

          <input
            type="range"
            min="5"
            max="35"
            step="5"
            value={cryptLevel}
            onChange={(e) => setCryptLevel(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <div className="flex justify-between text-2xs text-slate-400 font-mono font-bold pt-1">
            <span>Nv 5</span>
            <span>Nv 10</span>
            <span>Nv 15</span>
            <span>Nv 20</span>
            <span>Nv 25</span>
            <span>Nv 30</span>
            <span>Nv 35</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {[5, 10, 15, 20, 25, 30, 35].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setCryptLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  cryptLevel === lvl
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                Nv {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Tar Cost & Details (5 cols) */}
        <div className="md:col-span-5 bg-[#0b0f19] p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Consumo Estimado de Alcatrão:</span>
            <div className="text-2xl font-mono font-black text-amber-300 mt-1">
              {recommendation.tarCost.toLocaleString('pt-BR')} <span className="text-xs font-sans text-slate-400 font-normal">pts Tar</span>
            </div>
          </div>

          <div className="text-2xs font-semibold text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>Capitão Responsável:</span>
            <span className="font-bold text-white">{captain.name} (Nv {profile.captainLevels[captain.id] || captain.level || 1})</span>
          </div>
        </div>
      </div>

      {/* Recommended 1-Shot Troop Card */}
      <div className="bg-[#0b0f19] p-5 sm:p-6 rounded-2xl border border-emerald-500/40 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Tropa Otimizada para 1-Hit KO
            </h3>
          </div>
          <span className="text-2xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/50">
            0 Baixas de Soldados
          </span>
        </div>

        {primarySquad ? (
          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <TroopAvatar id={primarySquad.unitId} tier={primarySquad.tier} size="md" />

              <div>
                <span className="text-2xs font-bold text-emerald-400 uppercase tracking-wide block">
                  Envio Ideal
                </span>
                <h4 className="text-lg font-black text-white">
                  {primarySquad.unitName}
                </h4>
                <p className="text-xs font-semibold text-slate-400">
                  Dano Total Necessário: <strong className="text-amber-300 font-mono font-bold">320.000</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-left sm:text-right">
                <span className="text-2xs font-extrabold text-slate-400 block uppercase tracking-wider">
                  Quantidade
                </span>
                <span className="text-2xl font-mono font-black text-amber-300">
                  {primarySquad.count.toLocaleString('pt-BR')}
                </span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(primarySquad.count.toString());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 rounded-xl text-xs font-black shadow"
              >
                Copiar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-400">Nenhuma tropa encontrada para o cálculo.</p>
        )}
      </div>
    </div>
  );
};
