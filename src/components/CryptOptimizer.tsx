import React, { useState } from 'react';
import { PlayerProfile, TroopUnit, Captain } from '../types';
import { calculateCryptOneShot } from '../engine/crypt';
import { Compass, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

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
    const text = `🧭 MARCHA CRIPTA 1-SHOT - NÍVEL ${cryptLevel}\n` +
      `👤 Capitão: ${captain.name}\n` +
      `⚡ Consumo de Alcatrão (Tar): ${recommendation.tarCost} pts\n` +
      `💥 Tropa Recomendada: ${squad?.count.toLocaleString('pt-BR')}x ${squad?.unitName}\n` +
      `🛡️ Baixas Esperadas: 0 (1-Hit KO)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-5 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5a3e22] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568] text-[#fef08a]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#fef08a] font-fantasy tracking-wide">
              Caçador de Criptas (1-Hit KO)
            </h2>
            <p className="text-xs text-[#caa568]/80">
              Economia de Alcatrão (Tar) e farm de materiais de forja sem perdas
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`tb-btn-green flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all ${
            copied ? '!bg-emerald-700 !border-emerald-400' : ''
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar Marcha da Cripta'}
        </button>
      </div>

      {/* Level Slider & Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2 bg-[#180f0a] p-3.5 rounded-lg border border-[#5a3e22]">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#caa568]">Nível da Cripta:</span>
            <span className="text-[#fef08a] font-extrabold text-sm">Nível {cryptLevel}</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="5"
            value={cryptLevel}
            onChange={(e) => setCryptLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#100a06] rounded-lg appearance-none cursor-pointer accent-[#caa568]"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-sans font-bold">
            <span>Nv 5</span>
            <span>Nv 15</span>
            <span>Nv 25</span>
            <span>Nv 35</span>
          </div>
        </div>

        {/* Tar Cost Badge */}
        <div className="bg-[#180f0a] p-3.5 rounded-lg border border-[#5a3e22] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Consumo de Alcatrão (Tar):</span>
            <span className="text-lg font-black text-[#fef08a]">{recommendation.tarCost} pts</span>
          </div>
          {captain.id === 'carter' && (
            <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#581c87] text-purple-200 border border-[#c084fc]">
              -30% Bônus Carter
            </span>
          )}
        </div>
      </div>

      {/* 1-Shot Status Card */}
      {recommendation.canOneShot ? (
        <div className="bg-gradient-to-r from-[#182012] to-[#120a06] border-2 border-[#2e7d32] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-sm font-fantasy">1-Hit KO (One-Shot) Garantido!</h3>
          </div>
          <p className="text-xs text-[#caa568]">
            Seu exército elimina a Cripta Nível {cryptLevel} no primeiro ataque sem sofrer contra-ataque ou baixas de tropas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-[#100a06] p-2.5 rounded border border-[#5a3e22]">
              <span className="text-slate-400 block">Dano Necessário:</span>
              <span className="font-extrabold text-[#fef08a]">{recommendation.requiredAttackPower.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-[#100a06] p-2.5 rounded border border-[#5a3e22]">
              <span className="text-slate-400 block">Tropa Recomendada:</span>
              <span className="font-extrabold text-blue-300">
                {recommendation.recommendedSquads[0]?.count.toLocaleString('pt-BR')}x {recommendation.recommendedSquads[0]?.unitName.split('[')[0]}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#2a100a] border-2 border-red-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-sm font-fantasy">Capacidade Insuficiente para 1-Shot</h3>
          </div>
          <p className="text-xs text-red-200/90">{recommendation.warningMessage}</p>
        </div>
      )}
    </div>
  );
};
