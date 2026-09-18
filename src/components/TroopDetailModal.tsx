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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-serif">
      <div className="relative w-full max-w-xl bg-[#241912] border-2 border-[#caa568] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner Top Total Battle Style */}
        <div className="bg-gradient-to-r from-[#4a2e15] via-[#6d441e] to-[#4a2e15] p-4 border-b-2 border-[#caa568] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="md" />
            <div>
              <h2 className="text-lg font-black text-[#fef08a] font-fantasy tracking-wider uppercase">
                {troop.name}
              </h2>
              <p className="text-xs text-[#caa568]">
                {getCategoryLabel(troop.category)} • {getClassLabel(troop.troopClass)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#180f0a] hover:bg-red-900/60 border border-[#caa568] text-[#caa568] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Main Stats (Base & Buffed) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3a1d0f] border border-amber-600/40">
                <Swords className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] text-[#caa568]/80 block">Força Base / Com Bônus</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-[#fef08a]">{troop.baseAttack.toLocaleString()}</span>
                  <span className="text-xs text-emerald-400 font-bold">({effectiveAttack.toLocaleString()})</span>
                </div>
              </div>
            </div>

            <div className="bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3a1215] border border-red-600/40">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-[11px] text-[#caa568]/80 block">Saúde Base / Com Bônus</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-[#fef08a]">{troop.baseHealth.toLocaleString()}</span>
                  <span className="text-xs text-emerald-400 font-bold">({effectiveHealth.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Attributes List */}
          <div className="bg-[#180f0a] p-3.5 rounded-xl border border-[#5a3e22] space-y-2 text-xs">
            <h3 className="font-bold text-[#fef08a] border-b border-[#5a3e22] pb-1 flex items-center justify-between">
              <span>Atributos Gerais da Unidade</span>
              <span className="text-[10px] text-[#caa568]">Tier {troop.tier}</span>
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#caa568]">
              <div className="flex justify-between">
                <span>Liderança:</span>
                <strong className="text-[#fef08a]">{troop.leadershipCost}</strong>
              </div>
              <div className="flex justify-between">
                <span>Velocidade:</span>
                <strong className="text-[#fef08a]">{troop.speed || 50}</strong>
              </div>
              <div className="flex justify-between">
                <span>Iniciativa:</span>
                <strong className="text-[#fef08a]">10</strong>
              </div>
              <div className="flex justify-between">
                <span>Consumo de Comida:</span>
                <strong className="text-[#fef08a]">{troop.foodConsumption || 5}</strong>
              </div>
              <div className="flex justify-between">
                <span>Capacidade de Carga:</span>
                <strong className="text-[#fef08a]">{troop.capacity || 100}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estoque no Quartel:</span>
                <strong className="text-emerald-400 font-bold">{troop.ownedCount.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* FEATURES / CARACTERÍSTICAS DE COMBATE */}
          <div className="bg-[#1c120c] p-3.5 rounded-xl border border-[#caa568]/40 space-y-2">
            <h3 className="text-xs font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#5a3e22] pb-1">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              Características da Tropa (Features)
            </h3>
            <div className="space-y-1.5 text-xs">
              {troop.aspects?.isPvpDoubled && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Batalha PvP contra outros jogadores:</span>
                  <span className="text-amber-300 font-black">Força Dobrada (2x)</span>
                </div>
              )}
              {troop.aspects?.bonusVsHumanPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Humanos:</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsHumanPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsMeleePercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Corpo a Corpo (Melee):</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsMeleePercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsFlyingPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Voadores:</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsFlyingPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsMountedPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Montadas (Cavalaria):</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsMountedPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsRangedPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Longo Alcance (Ranged):</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsRangedPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsSiegePercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Armas de Cerco:</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsSiegePercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsBeastsPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Feras (Beasts):</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsBeastsPercent}%</span>
                </div>
              )}
              {troop.aspects?.bonusVsFortificationsPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Força contra Fortificações:</span>
                  <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsFortificationsPercent}%</span>
                </div>
              )}
              {troop.aspects?.nativeCriticalPercent && (
                <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between">
                  <span className="text-[#caa568]">Chance de Dano Crítico:</span>
                  <span className="text-amber-400 font-bold">+{troop.aspects.nativeCriticalPercent}%</span>
                </div>
              )}
            </div>
          </div>

          {/* BÔNUS DA CONTA / JOGADOR (BONUSES - COMO NO JOGO) */}
          <div className="bg-[#180f0a] p-3.5 rounded-xl border border-[#5a3e22] space-y-2 text-xs">
            <h3 className="text-xs font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#5a3e22] pb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Bônus da Conta (Bonuses)
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#caa568]">
              <div className="flex justify-between">
                <span>Força:</span>
                <strong className="text-emerald-400">+{accountBonuses.strength.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Saúde:</span>
                <strong className="text-emerald-400">+{accountBonuses.health.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Velocidade de Marcha:</span>
                <strong className="text-emerald-400">+{accountBonuses.marchSpeed.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Capacidade de Carga:</span>
                <strong className="text-emerald-400">+{accountBonuses.carryingCapacity.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Custo de Treinamento:</span>
                <strong className="text-amber-300">+{accountBonuses.trainingCost.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Velocidade de Treinamento:</span>
                <strong className="text-emerald-400">+{accountBonuses.trainingSpeed.toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-[#3d2917]">
                <span>Custo de Reviver Reduzido em:</span>
                <strong className="text-amber-300">{accountBonuses.revivalReductionMultiplier} vezes</strong>
              </div>
            </div>
          </div>

          {/* Revival Costs */}
          <div className="bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#caa568]" />
              <span className="text-[#caa568]">Custo para Reviver:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-bold">{troop.revivalSilverCost} Prata (Defesa)</span>
              <span className="text-amber-400 font-bold">{troop.revivalGoldCost || 4} Ouro (Ataque)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#180f0a] p-3 border-t border-[#5a3e22] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-b from-[#6d441e] to-[#4a2e15] hover:from-[#805024] hover:to-[#5a371a] border border-[#caa568] text-[#fef08a] font-bold rounded-lg text-xs tracking-wider transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
