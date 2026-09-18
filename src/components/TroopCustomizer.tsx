import React, { useState } from 'react';
import { TroopUnit, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { AddTroopModal } from './AddTroopModal';
import { TroopDetailModal } from './TroopDetailModal';
import { Shield, Swords, Heart, CheckSquare, Square, Users, ChevronDown, ChevronUp, Plus, Trash2, X, Info } from 'lucide-react';

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

  const filteredTroops = selectedCategory === 'all'
    ? troops
    : troops.filter((t) => t.category === selectedCategory);

  const totalOwnedInView = filteredTroops.reduce((sum, t) => sum + (t.isUnlocked ? t.ownedCount : 0), 0);

  const handleClearStock = (troop: TroopUnit, e: React.MouseEvent) => {
    e.stopPropagation();
    if (troop.id.startsWith('custom_') && onRemoveCustomTroop) {
      onRemoveCustomTroop(troop.id);
    } else {
      onUpdateOwnedCount(troop.id, 0);
    }
  };

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
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
            <p className="text-xs text-[#caa568]/80 font-serif">
              Disponível na aba: <strong className="text-[#fef08a]">{totalOwnedInView.toLocaleString('pt-BR')} tropas</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddTroop && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tb-btn-gold text-[11px] px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow font-serif"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Soldado
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-[#caa568] hover:text-[#fef08a] transition-colors flex items-center gap-1 font-serif"
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
              className={`py-2 text-[11px] font-bold font-serif rounded-md transition-all ${
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

      {/* Troop List Cards with in-game framing */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredTroops.map((troop) => {
            const isCustom = troop.id.startsWith('custom_');

            return (
              <div
                key={troop.id}
                onClick={() => setSelectedTroopForDetail(troop)}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer relative group hover:border-[#caa568] ${
                  troop.isUnlocked && troop.ownedCount > 0
                    ? 'bg-[#1a110b] border-[#5a3e22] shadow-md'
                    : 'bg-[#120a06]/80 border-[#3d2917] opacity-65 hover:opacity-100'
                }`}
              >
                {/* Header Card: Avatar + Name + Tier + Remove (X) */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="relative">
                    <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#fef08a] truncate font-serif">{troop.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#caa568]">
                      <span>Tier {troop.tier}</span>
                      <span>•</span>
                      <span className="text-amber-300 flex items-center gap-0.5">
                        <Swords className="w-2.5 h-2.5" /> {troop.baseAttack.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-red-300 flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> {troop.baseHealth.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTroopForDetail(troop);
                      }}
                      className="text-[#caa568] hover:text-[#fef08a] p-1 rounded hover:bg-[#2e1d11]"
                      title="Ver ficha técnica detalhada"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Botão 'X' para remover do estoque ou excluir */}
                    <button
                      onClick={(e) => handleClearStock(troop, e)}
                      title={isCustom ? 'Excluir soldado personalizado' : 'Zerar/Remover tropa do estoque'}
                      className="text-red-400 hover:text-red-200 p-1 rounded hover:bg-red-950/60 transition-colors"
                    >
                      {isCustom ? <Trash2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Quantity in Army Control */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#100a06] p-2 rounded border border-[#5a3e22] flex items-center justify-between font-serif"
                >
                  <span className="text-[11px] text-[#caa568] font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Estoque no Quartel:
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={troop.ownedCount}
                      onChange={(e) => onUpdateOwnedCount(troop.id, Math.max(0, Number(e.target.value)))}
                      className="w-24 bg-[#1a110b] border border-[#5a3e22] rounded px-2 py-0.5 text-xs text-[#fef08a] font-bold text-right focus:outline-none focus:border-[#caa568]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
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
          onClose={() => setIsAddModalOpen(false)}
          onAddTroop={(newTroop) => {
            onAddTroop(newTroop);
          }}
        />
      )}
    </div>
  );
};

