import React from 'react';
import { TroopUnit, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { X, Shield, Swords, Zap, Heart, Footprints, Coins, Crosshair, Sparkles } from 'lucide-react';

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

  // Account bonuses
  const getCategoryBonus = () => {
    if (!profile?.academyBonus) return { attack: 0, health: 0 };
    switch (troop.category) {
      case 'guardsman':
        return {
          attack: profile.academyBonus.guardsmenAttack || 111.5,
          health: profile.academyBonus.guardsmenHealth || 38.5,
        };
      case 'specialist':
        return {
          attack: profile.academyBonus.specialistsAttack || 50,
          health: profile.academyBonus.specialistsHealth || 30,
        };
      case 'monster':
        return {
          attack: profile.academyBonus.monstersAttack || 88,
          health: profile.academyBonus.monstersHealth || 40.5,
        };
      default:
        return { attack: 0, health: 0 };
    }
  };

  const bonuses = getCategoryBonus();
  const effectiveAttack = Math.round(troop.baseAttack * (1 + bonuses.attack / 100));
  const effectiveHealth = Math.round(troop.baseHealth * (1 + bonuses.health / 100));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-serif">
      <div className="relative w-full max-w-lg bg-[#241912] border-2 border-[#caa568] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
        <div className="p-5 space-y-4 overflow-y-auto">
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
                <span>Estoque Atual:</span>
                <strong className="text-emerald-400 font-bold">{troop.ownedCount.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Aspects (Vantagens Táticas de Combate) */}
          {troop.aspects && (
            <div className="bg-[#1c120c] p-3.5 rounded-xl border border-[#caa568]/40 space-y-2">
              <h3 className="text-xs font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#5a3e22] pb-1">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                Aspectos de Combate (Vantagens de Classe)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {troop.aspects.bonusVsMeleePercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Corpo a Corpo:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsMeleePercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsFlyingPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Voadores:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsFlyingPercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsMountedPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Montadas:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsMountedPercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsRangedPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Longo Alcance:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsRangedPercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsSiegePercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Armas de Cerco:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsSiegePercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsBeastsPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Feras:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsBeastsPercent}%</span>
                  </div>
                )}
                {troop.aspects.bonusVsFortificationsPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">vs Fortificações:</span>
                    <span className="text-emerald-400 font-bold">+{troop.aspects.bonusVsFortificationsPercent}%</span>
                  </div>
                )}
                {troop.aspects.nativeCriticalPercent && (
                  <div className="bg-[#120a06] p-2 rounded border border-[#5a3e22] flex justify-between">
                    <span className="text-[#caa568]">Chance Dano Crítico:</span>
                    <span className="text-amber-400 font-bold">+{troop.aspects.nativeCriticalPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
