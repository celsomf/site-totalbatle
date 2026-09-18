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

  // Show only unlocked troops in the player's active Quartel
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
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-3 sm:p-4 shadow-2xl space-y-3.5 font-serif">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Shield className="w-5 h-5 text-[#fef08a]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wide">
              Quartel & Tropas em Estoque
            </h2>
            <p className="text-xs text-[#caa568]/80">
              Ativas nesta aba: <strong className="text-[#fef08a]">{totalOwnedInView.toLocaleString('pt-BR')} tropas</strong> ({filteredTroops.length} tipos)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddTroop && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tb-btn-gold text-[11px] px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Soldado
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-[#caa568] hover:text-[#fef08a] transition-colors flex items-center gap-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quartel Tabs (Styled like in-game Quartel menu) */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#140c07] border border-[#5a3e22]">
        {[
          { id: 'guardsman', label: 'Guardas' },
          { id: 'specialist', label: 'Especialistas' },
          { id: 'monster', label: 'Monstros' },
          { id: 'mercenary', label: 'Mercenários' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`py-2 text-[11px] font-bold rounded-md transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-[#fef08a] border border-[#f59e0b] shadow-md'
                  : 'text-[#caa568]/70 hover:text-[#fef08a] hover:bg-[#20140d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Troop List Cards in clean 1-column layout */}
      {isExpanded && (
        <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
          {filteredTroops.length === 0 ? (
            <div className="bg-[#140c07] p-6 rounded-xl border border-dashed border-[#5a3e22] text-center space-y-3">
              <p className="text-xs text-[#caa568]">
                Nenhuma tropa desta categoria está no seu Quartel no momento.
              </p>
              {onAddTroop && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="tb-btn-gold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 font-bold shadow"
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
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative group hover:border-[#caa568] ${
                    troop.ownedCount > 0
                      ? 'bg-[#1a110b] border-[#5a3e22] shadow-md'
                      : 'bg-[#120a06]/80 border-[#3d2917] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Top Row: Avatar + Name + Buttons */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-black text-[#fef08a] truncate font-serif leading-tight">
                          {troop.name}
                        </h3>
                        {/* Stats Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-[#2a1a0f] border border-[#5a3e22] rounded text-[#caa568] font-bold">
                            Tier {troop.tier}
                          </span>
                          <span className="text-amber-300 font-bold flex items-center gap-0.5">
                            <Swords className="w-3 h-3 text-amber-400" /> {troop.baseAttack.toLocaleString()}
                          </span>
                          <span className="text-red-300 font-bold flex items-center gap-0.5">
                            <Heart className="w-3 h-3 text-red-400" /> {troop.baseHealth.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTroopForDetail(troop);
                        }}
                        className="text-[#caa568] hover:text-[#fef08a] p-1.5 rounded-lg bg-[#24170e] border border-[#5a3e22] hover:bg-[#382315] transition-colors"
                        title="Ver ficha técnica detalhada e bônus"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleRemoveTroop(troop, e)}
                        title={isCustom ? 'Excluir tropa personalizada' : 'Remover tropa do Quartel'}
                        className="text-red-400 hover:text-white p-1.5 rounded-lg bg-[#290e0e]/80 border border-red-900/60 hover:bg-red-900 transition-colors"
                      >
                        {isCustom ? <Trash2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Stock Controller */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 bg-[#100a06] p-2 rounded-lg border border-[#5a3e22] flex items-center justify-between gap-2"
                  >
                    <span className="text-[11px] text-[#caa568] font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Estoque no Quartel:
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, -100, e)}
                        title="Subtrair 100"
                        className="w-6 h-6 rounded bg-[#24170e] hover:bg-[#3d2917] border border-[#5a3e22] text-[#caa568] hover:text-[#fef08a] text-xs font-bold flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={troop.ownedCount}
                        onChange={(e) => onUpdateOwnedCount(troop.id, Math.max(0, Number(e.target.value)))}
                        className="w-24 bg-[#1a110b] border border-[#5a3e22] rounded px-2 py-0.5 text-xs text-[#fef08a] font-bold text-right focus:outline-none focus:border-[#caa568]"
                      />
                      <button
                        onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, 100, e)}
                        title="Adicionar 100"
                        className="w-6 h-6 rounded bg-[#24170e] hover:bg-[#3d2917] border border-[#5a3e22] text-[#caa568] hover:text-[#fef08a] text-xs font-bold flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Troop Detail Modal */}
      {selectedTroopForDetail && (
        <TroopDetailModal
          troop={selectedTroopForDetail}
          profile={profile}
          onClose={() => setSelectedTroopForDetail(null)}
        />
      )}

      {/* Add Troop Modal */}
      {onAddTroop && (
        <AddTroopModal
          isOpen={isAddModalOpen}
          initialCategory={selectedCategory === 'all' ? 'guardsman' : selectedCategory}
          currentTroops={troops}
          onClose={() => setIsAddModalOpen(false)}
          onAddTroop={(newTroop) => {
            onAddTroop(newTroop);
          }}
        />
      )}
    </div>
  );
};

