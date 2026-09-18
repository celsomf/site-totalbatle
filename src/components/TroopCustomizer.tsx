import React, { useState } from 'react';
import { TroopUnit, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { AddTroopModal } from './AddTroopModal';
import { TroopDetailModal } from './TroopDetailModal';
import { Shield, Swords, Heart, Users, ChevronDown, ChevronUp, Plus, Trash2, X, Info, Minus } from 'lucide-react';

interface TroopCustomizerProps {
  troops: TroopUnit[];
  profile?: PlayerProfile;
  onToggleUnlocked: (troopId: string) => void;
  onUpdateOwnedCount: (troopId: string, count: number) => void;
  onUpdateCustomStat?: (troopId: string, attack: number, health: number) => void;
  onAddTroop?: (troop: TroopUnit) => void;
  onRemoveCustomTroop?: (troopId: string) => void;
}

export const TroopCustomizer: React.FC<TroopCustomizerProps> = ({
  troops,
  profile,
  onToggleUnlocked,
  onUpdateOwnedCount,
  onAddTroop,
  onRemoveCustomTroop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guardsman' | 'specialist' | 'monster' | 'mercenary'>('guardsman');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTroopForDetail, setSelectedTroopForDetail] = useState<TroopUnit | null>(null);

  const activeTroops = troops.filter((t) => t.isUnlocked);
  const filteredTroops = selectedCategory === 'all'
    ? activeTroops
    : activeTroops.filter((t) => t.category === selectedCategory);

  const totalOwnedInView = filteredTroops.reduce((sum, t) => sum + t.ownedCount, 0);

  const handleRemoveTroop = (troop: TroopUnit, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveCustomTroop) {
      onRemoveCustomTroop(troop.id);
    } else {
      onToggleUnlocked(troop.id);
      onUpdateOwnedCount(troop.id, 0);
    }
  };

  const handleAdjustCount = (troopId: string, currentCount: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateOwnedCount(troopId, Math.max(0, currentCount + delta));
  };

  return (
    <div className="bg-[#1c120a] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568] shadow">
            <Shield className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-yellow-300 tracking-wide">
              Quartel & Tropas em Estoque
            </h2>
            <p className="text-xs font-bold text-amber-200/90">
              Ativas nesta aba: <strong className="text-yellow-300 font-black">{totalOwnedInView.toLocaleString('pt-BR')} tropas</strong> ({filteredTroops.length} tipos)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddTroop && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tb-btn-gold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow font-black"
            >
              <Plus className="w-4 h-4" /> Adicionar Soldado
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-amber-200 hover:text-white transition-colors flex items-center gap-1 p-1"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quartel Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-[#120a06] border-2 border-[#5a3e22]">
        {[
          { id: 'guardsman', label: '🛡️ Guardas' },
          { id: 'specialist', label: '⚔️ Especialistas' },
          { id: 'monster', label: '🦁 Monstros' },
          { id: 'mercenary', label: '🦅 Mercenários' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`py-2 text-xs font-black rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-800 to-amber-800 text-yellow-200 border border-yellow-400 shadow-md'
                  : 'text-amber-200/80 hover:text-white hover:bg-[#20140d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Troop List Cards */}
      {isExpanded && (
        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredTroops.length === 0 ? (
            <div className="bg-[#120a06] p-6 rounded-xl border-2 border-dashed border-[#5a3e22] text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-amber-200">
                Nenhuma tropa desta categoria está no seu Quartel no momento.
              </p>
              {onAddTroop && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="tb-btn-gold text-xs px-4 py-2.5 rounded-lg inline-flex items-center gap-2 font-black shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Adicionar do Catálogo Oficial
                </button>
              )}
            </div>
          ) : (
            filteredTroops.map((troop) => {
              const isCustom = troop.id.startsWith('custom_');

              return (
                <div
                  key={troop.id}
                  onClick={() => setSelectedTroopForDetail(troop)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative group hover:border-yellow-400 ${
                    troop.ownedCount > 0
                      ? 'bg-[#1a110b] border-[#5a3e22] shadow-md'
                      : 'bg-[#120a06]/80 border-[#3d2917] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Top Row: Avatar + Name + Buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-black text-yellow-200 truncate leading-tight group-hover:text-yellow-300">
                          {troop.name}
                        </h3>
                        {/* Stats Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                          <span className="px-2 py-0.5 bg-[#2a1a0f] border border-[#5a3e22] rounded text-amber-300 font-bold">
                            Tier {troop.tier}
                          </span>
                          <span className="text-amber-200/90 font-bold">
                            ⚔️ {troop.customAttack || troop.baseAttack} Atk
                          </span>
                          <span className="text-red-300 font-bold">
                            ❤️ {troop.customHealth || troop.baseHealth} HP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTroopForDetail(troop);
                        }}
                        className="p-1.5 rounded-lg bg-[#2a1a0f] hover:bg-[#3d2917] text-amber-300 border border-[#5a3e22] transition-colors"
                        title="Ver detalhes da tropa"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleRemoveTroop(troop, e)}
                        className="p-1.5 rounded-lg bg-[#2a1010] hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
                        title={isCustom ? 'Excluir esta tropa' : 'Remover do quartel ativo'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity Control Row */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-2.5 border-t border-[#3d2917] flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-bold text-slate-300">
                      Tropas Prontas:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, -100, e)}
                        className="px-2 py-1 bg-[#241912] hover:bg-[#382316] text-amber-300 rounded border border-[#5a3e22] text-xs font-black transition-colors"
                        title="-100"
                      >
                        -100
                      </button>
                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, -10, e)}
                        className="p-1 bg-[#241912] hover:bg-[#382316] text-amber-300 rounded border border-[#5a3e22] text-xs font-bold transition-colors"
                        title="-10"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={troop.ownedCount}
                        onChange={(e) => onUpdateOwnedCount(troop.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 px-2 py-1 bg-[#080402] border-2 border-[#caa568] rounded-lg text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400 shadow-inner"
                      />

                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, 10, e)}
                        className="p-1 bg-[#241912] hover:bg-[#382316] text-amber-300 rounded border border-[#5a3e22] text-xs font-bold transition-colors"
                        title="+10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, 100, e)}
                        className="px-2 py-1 bg-[#241912] hover:bg-[#382316] text-amber-300 rounded border border-[#5a3e22] text-xs font-black transition-colors"
                        title="+100"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Troop Modal */}
      {isAddModalOpen && onAddTroop && (
        <AddTroopModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTroop={onAddTroop}
          currentTroops={troops}
        />
      )}

      {/* Detail Modal */}
      {selectedTroopForDetail && (
        <TroopDetailModal
          troop={selectedTroopForDetail}
          profile={profile}
          onClose={() => setSelectedTroopForDetail(null)}
        />
      )}
    </div>
  );
};
