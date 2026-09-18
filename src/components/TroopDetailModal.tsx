import React from 'react';
import { TroopUnit, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { X, Swords, Heart, Coins, Crosshair, Sparkles, Zap, Shield, Target } from 'lucide-react';

interface TroopDetailModalProps {
  troop: TroopUnit | null;
  profile?: PlayerProfile;
  onClose: () => void;
}

export const TroopDetailModal: React.FC<TroopDetailModalProps> = ({
  troop,
  profile,
  onClose,
}) => {
  if (!troop) return null;

  // Exact account bonuses based on in-game screenshots and profile
  const getAccountBonuses = () => {
    let strengthBonus = 111.5; // Default guardsman
    let healthBonus = 25.5;

    if (troop.category === 'specialist') {
      if (troop.troopClass === 'ranged') {
        strengthBonus = troop.id.includes('spy') || troop.id.includes('jaeger') || troop.id.includes('panoptic') ? 121.5 : 99.0;
        healthBonus = 25.5;
      } else if (troop.troopClass === 'melee') {
        strengthBonus = 77.0;
        healthBonus = 25.5;
      } else if (troop.troopClass === 'mounted') {
        strengthBonus = 76.5;
        healthBonus = 25.5;
      } else if (troop.troopClass === 'flying') {
        strengthBonus = 75.5;
        healthBonus = 27.5;
      }
    } else if (troop.category === 'guardsman') {
      strengthBonus = profile?.academyBonus?.guardsmenAttack || 111.5;
      healthBonus = profile?.academyBonus?.guardsmenHealth || 25.5;
    } else if (troop.category === 'monster') {
      strengthBonus = profile?.academyBonus?.monstersAttack || 88.0;
      healthBonus = profile?.academyBonus?.monstersHealth || 40.5;
    }

    return {
      carryingCapacity: 4.0,
      health: healthBonus,
      marchSpeed: 41.0,
      strength: strengthBonus,
      trainingCost: 29.0,
      trainingSpeed: 57.7,
      revivalReductionMultiplier: 1.74,
    };
  };

  const accountBonuses = getAccountBonuses();
  const effectiveAttack = Math.round(troop.baseAttack * (1 + accountBonuses.strength / 100));
  const effectiveHealth = Math.round(troop.baseHealth * (1 + accountBonuses.health / 100));

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'guardsman': return 'Guarda, Humano';
      case 'specialist': return 'Especialista, Humano';
      case 'monster': return 'Monstro / Fera';
      case 'mercenary': return 'Mercenário';
      default: return cat;
    }
  };

  const getClassLabel = (cls: string) => {
    switch (cls) {
      case 'ranged': return 'Unidade de longo alcance';
      case 'melee': return 'Unidade corpo a corpo';
      case 'mounted': return 'Unidade montada';
      case 'flying': return 'Unidade voadora';
      case 'siege': return 'Arma de cerco';
      default: return cls;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner Top */}
        <div className="bg-[#0b0f19] p-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="md" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                {troop.name}
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                {getCategoryLabel(troop.category)} • {getClassLabel(troop.troopClass)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Main Stats (Base & Buffed) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40">
                <Swords className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-2xs font-bold text-slate-400 block">Força Base / Com Bônus</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-white font-mono">{troop.baseAttack.toLocaleString('pt-BR')}</span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">({effectiveAttack.toLocaleString('pt-BR')})</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-2xs font-bold text-slate-400 block">Saúde Base / Com Bônus</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-white font-mono">{troop.baseHealth.toLocaleString('pt-BR')}</span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">({effectiveHealth.toLocaleString('pt-BR')})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Attributes List */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-700/80 space-y-2.5 text-xs">
            <h3 className="font-black text-white border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
              <span>Atributos Gerais da Unidade</span>
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600">
                Tier {troop.tier}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-300 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Liderança:</span>
                <strong className="text-white font-mono">{troop.leadershipCost}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocidade:</span>
                <strong className="text-white font-mono">{troop.speed || 50}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Iniciativa:</span>
                <strong className="text-white font-mono">10</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consumo de Comida:</span>
                <strong className="text-white font-mono">{troop.foodConsumption || 5}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacidade de Carga:</span>
                <strong className="text-white font-mono">{troop.capacity || 100}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estoque no Quartel:</span>
                <strong className="text-emerald-400 font-mono font-black">{troop.ownedCount.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </div>

          {/* FEATURES / CARACTERÍSTICAS DE COMBATE */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-700/80 space-y-2.5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/80 pb-1.5">
              <Crosshair className="w-4 h-4 text-amber-400" />
              Características da Tropa (Features)
            </h3>
            <div className="space-y-1.5 text-xs">
              {troop.aspects?.isPvpDoubled && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Batalha PvP contra outros jogadores:</span>
                  <span className="text-amber-300 font-black">Força Dobrada (2x)</span>
                </div>
              )}
              {troop.aspects?.bonusVsHumanPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Humanos:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsHumanPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsMeleePercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Corpo a Corpo (Melee):</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsMeleePercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsFlyingPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Voadores:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsFlyingPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsMountedPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Montadas (Cavalaria):</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsMountedPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsRangedPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Longo Alcance (Ranged):</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsRangedPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsSiegePercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Armas de Cerco:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsSiegePercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsBeastsPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Feras (Beasts):</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsBeastsPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsFortificationsPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Força contra Fortificações:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{troop.aspects.bonusVsFortificationsPercent}%</span>
                </div>
              )}
              {troop.aspects?.nativeCriticalPercent && (
                <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Chance de Dano Crítico:</span>
                  <span className="text-amber-400 font-bold font-mono">+{troop.aspects.nativeCriticalPercent}%</span>
                </div>
              )}
            </div>
          </div>

          {/* BÔNUS DA CONTA / JOGADOR */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-700/80 space-y-2.5 text-xs">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/80 pb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Bônus da Conta (Bonuses)
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-300 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Força:</span>
                <strong className="text-emerald-400 font-mono">+{accountBonuses.strength.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saúde:</span>
                <strong className="text-emerald-400 font-mono">+{accountBonuses.health.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocidade de Marcha:</span>
                <strong className="text-emerald-400 font-mono">+{accountBonuses.marchSpeed.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacidade de Carga:</span>
                <strong className="text-emerald-400 font-mono">+{accountBonuses.carryingCapacity.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custo de Treinamento:</span>
                <strong className="text-amber-300 font-mono">+{accountBonuses.trainingCost.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocidade de Treinamento:</span>
                <strong className="text-emerald-400 font-mono">+{accountBonuses.trainingSpeed.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400">Custo de Reviver Reduzido em:</span>
                <strong className="text-amber-300 font-mono font-bold">{accountBonuses.revivalReductionMultiplier} vezes</strong>
              </div>
            </div>
          </div>

          {/* Revival Costs */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 font-bold">Custo para Reviver:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-200 font-mono font-bold">{troop.revivalSilverCost} Prata (Defesa)</span>
              <span className="text-amber-400 font-mono font-bold">{troop.revivalGoldCost || 4} Ouro (Ataque)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0b0f19] p-3.5 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl text-xs shadow-lg transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
