import React, { useState, useMemo } from 'react';
import { TroopUnit, TroopCategory } from '../types';
import { DEFAULT_TROOPS } from '../data/troops';
import { TroopAvatar } from './TroopAvatar';
import { X, Plus, Swords, Heart, Users, Shield, Zap, Crosshair } from 'lucide-react';

interface AddTroopModalProps {
  isOpen: boolean;
  currentTroops?: TroopUnit[];
  onClose: () => void;
  onAddTroop: (troop: TroopUnit) => void;
}

export const AddTroopModal: React.FC<AddTroopModalProps> = ({
  isOpen,
  currentTroops = [],
  onClose,
  onAddTroop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TroopCategory>('guardsman');
  const [selectedTroopId, setSelectedTroopId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(500);

  // Filter available troops in the selected category
  const availableTroopsInCategory = useMemo(() => {
    return DEFAULT_TROOPS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Set default selected troop when category changes
  const activeTroop = useMemo(() => {
    const found = availableTroopsInCategory.find((t) => t.id === selectedTroopId);
    return found || availableTroopsInCategory[0] || DEFAULT_TROOPS[0];
  }, [availableTroopsInCategory, selectedTroopId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTroop) return;

    onAddTroop({
      ...activeTroop,
      isUnlocked: true,
      ownedCount: Math.max(0, Number(quantity) || 0),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn font-serif text-[#f4ebd9]">
      <div className="bg-[#241912] border-2 border-[#caa568] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#caa568] hover:text-white bg-[#180f0a] border border-[#5a3e22] rounded-full p-1.5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#5a3e22] pb-3 mb-4">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Plus className="w-6 h-6 text-[#fef08a]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wider">
              Adicionar Tropa ao Quartel
            </h2>
            <p className="text-xs text-[#caa568]/80">
              Selecione a categoria, a tropa e a quantidade para adicionar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passo 1: Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#caa568] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> 1. Categoria:
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#140c07] border border-[#5a3e22]">
              {[
                { id: 'guardsman', label: 'Guardas' },
                { id: 'specialist', label: 'Especialistas' },
                { id: 'monster', label: 'Monstros' },
                { id: 'mercenary', label: 'Mercenários' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id as TroopCategory);
                      const firstInCat = DEFAULT_TROOPS.find((t) => t.category === cat.id);
                      if (firstInCat) setSelectedTroopId(firstInCat.id);
                    }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-[#fef08a] border border-[#f59e0b] shadow-md'
                        : 'text-[#caa568]/70 hover:text-[#fef08a]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Seleção da Tropa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#caa568] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> 2. Tipo de Tropa / Soldado:
            </label>
            <select
              value={activeTroop?.id || ''}
              onChange={(e) => setSelectedTroopId(e.target.value)}
              className="w-full bg-[#100a06] border border-[#5a3e22] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568]"
            >
              {availableTroopsInCategory.map((t) => (
                <option key={t.id} value={t.id}>
                  Tier {t.tier} • {t.name} (⚔ {t.baseAttack} | 💖 {t.baseHealth})
                </option>
              ))}
            </select>
          </div>

          {/* Preview Card Automático com os dados internos */}
          {activeTroop && (
            <div className="bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22] flex items-center gap-3">
              <div className="flex-shrink-0">
                <TroopAvatar id={activeTroop.avatarIcon || activeTroop.id} tier={activeTroop.tier} size="md" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#fef08a] truncate text-sm">{activeTroop.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2d1b0f] border border-[#caa568]/40 rounded text-[#caa568]">
                    Tier {activeTroop.tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#caa568]">
                  <span className="text-amber-300 font-bold flex items-center gap-0.5">
                    <Swords className="w-3 h-3 text-amber-400" /> {activeTroop.baseAttack.toLocaleString()}
                  </span>
                  <span>•</span>
                  <span className="text-red-300 font-bold flex items-center gap-0.5">
                    <Heart className="w-3 h-3 text-red-400" /> {activeTroop.baseHealth.toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>Liderança: <strong className="text-[#fef08a]">{activeTroop.leadershipCost}</strong></span>
                  <span>•</span>
                  <span>Vel: <strong className="text-[#fef08a]">{activeTroop.speed || 50}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Passo 3: Quantidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#caa568]">3. Quantidade em Estoque no Quartel:</label>
              <div className="flex gap-1">
                {[100, 500, 1000, 5000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setQuantity(quick)}
                    className="px-2 py-0.5 text-[10px] bg-[#140e0a] border border-[#5a3e22] rounded hover:border-[#caa568] text-[#caa568] hover:text-[#fef08a]"
                  >
                    +{quick.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#100a06] border border-[#5a3e22] rounded-xl px-3 py-2 text-sm text-[#fef08a] font-bold text-center focus:outline-none focus:border-[#caa568]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#5a3e22]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#180f0a] border border-[#5a3e22] text-[#caa568] hover:text-white rounded-lg text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="tb-btn-gold px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Adicionar Tropa ao Quartel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

