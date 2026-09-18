import React, { useState, useMemo, useEffect } from 'react';
import { TroopUnit, TroopCategory, TroopClass } from '../types';
import { DEFAULT_TROOPS } from '../data/troops';
import { TroopAvatar } from './TroopAvatar';
import { X, Plus, Swords, Heart, Users, Shield, Zap, Crosshair, Filter } from 'lucide-react';

interface AddTroopModalProps {
  isOpen: boolean;
  initialCategory?: TroopCategory;
  currentTroops?: TroopUnit[];
  onClose: () => void;
  onAddTroop: (troop: TroopUnit) => void;
}

export const AddTroopModal: React.FC<AddTroopModalProps> = ({
  isOpen,
  initialCategory = 'guardsman',
  currentTroops = [],
  onClose,
  onAddTroop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TroopCategory>(initialCategory);
  const [selectedClass, setSelectedClass] = useState<TroopClass | 'all'>('all');
  const [selectedTroopId, setSelectedTroopId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(500);

  // Sync initialCategory when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(initialCategory);
      setSelectedClass('all');
      const firstInCat = DEFAULT_TROOPS.find((t) => t.category === initialCategory);
      if (firstInCat) {
        setSelectedTroopId(firstInCat.id);
      }
    }
  }, [isOpen, initialCategory]);

  // Filter available troops STRICTLY by selected category and optional class filter
  const availableTroopsInCategory = useMemo(() => {
    return DEFAULT_TROOPS.filter((t) => {
      if (t.category !== selectedCategory) return false;
      if (selectedClass !== 'all' && t.troopClass !== selectedClass) return false;
      return true;
    });
  }, [selectedCategory, selectedClass]);

  // Ensure activeTroop is always from the filtered list
  const activeTroop = useMemo(() => {
    const found = availableTroopsInCategory.find((t) => t.id === selectedTroopId);
    return found || availableTroopsInCategory[0] || null;
  }, [availableTroopsInCategory, selectedTroopId]);

  // When category changes, auto-select the first unit in that category
  const handleCategorySelect = (cat: TroopCategory) => {
    setSelectedCategory(cat);
    setSelectedClass('all');
    const first = DEFAULT_TROOPS.find((t) => t.category === cat);
    if (first) {
      setSelectedTroopId(first.id);
    }
  };

  const handleClassSelect = (cls: TroopClass | 'all') => {
    setSelectedClass(cls);
    const filtered = DEFAULT_TROOPS.filter((t) => {
      if (t.category !== selectedCategory) return false;
      if (cls !== 'all' && t.troopClass !== cls) return false;
      return true;
    });
    if (filtered.length > 0) {
      setSelectedTroopId(filtered[0].id);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-1.5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300 shadow-md">
            <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              Adicionar Tropa ao Quartel
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              Selecione a categoria, a tropa e a quantidade para adicionar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          {/* Passo 1: Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> 1. Categoria:
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#0b0f19] border border-slate-700">
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
                    onClick={() => handleCategorySelect(cat.id as TroopCategory)}
                    className={`py-2 text-xs font-black rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-filtro de Classe Tática */}
          <div className="flex flex-wrap items-center gap-1.5 text-2xs">
            <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Classe:
            </span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'ranged', label: '🏹 Longo' },
              { id: 'melee', label: '⚔️ Corpo' },
              { id: 'mounted', label: '🐎 Montadas' },
              { id: 'flying', label: '🦅 Voadores' },
              { id: 'siege', label: '🛡️ Cerco' },
            ].map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => handleClassSelect(cls.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                  selectedClass === cls.id
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>

          {/* Passo 2: Seleção da Tropa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> 2. Tipo de Tropa ({availableTroopsInCategory.length} disponíveis):
              </span>
              <span className="text-2xs text-slate-400 font-semibold">
                {selectedCategory === 'guardsman' ? 'Guardas' : selectedCategory === 'specialist' ? 'Especialistas' : selectedCategory === 'monster' ? 'Monstros' : 'Mercenários'}
              </span>
            </label>
            <select
              value={activeTroop?.id || ''}
              onChange={(e) => setSelectedTroopId(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-black focus:outline-none focus:border-amber-400 shadow-inner"
            >
              {availableTroopsInCategory.map((t) => (
                <option key={t.id} value={t.id}>
                  Tier {t.tier} • {t.name} (⚔ {t.baseAttack.toLocaleString('pt-BR')} | 💖 {t.baseHealth.toLocaleString('pt-BR')})
                </option>
              ))}
            </select>
          </div>

          {/* Preview Card */}
          {activeTroop && (
            <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700 flex items-center gap-3.5 shadow-inner">
              <div className="flex-shrink-0">
                <TroopAvatar id={activeTroop.avatarIcon || activeTroop.id} tier={activeTroop.tier} size="md" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white truncate text-sm">{activeTroop.name}</h4>
                  <span className="text-2xs font-bold px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-amber-300">
                    Tier {activeTroop.tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-300 font-semibold">
                  <span className="text-rose-300 font-bold flex items-center gap-0.5">
                    <Swords className="w-3 h-3 text-rose-400" /> {activeTroop.baseAttack.toLocaleString('pt-BR')}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                    <Heart className="w-3 h-3 text-emerald-400" /> {activeTroop.baseHealth.toLocaleString('pt-BR')}
                  </span>
                  <span>•</span>
                  <span>Lid: <strong className="text-white font-mono">{activeTroop.leadershipCost}</strong></span>
                  <span>•</span>
                  <span>Vel: <strong className="text-white font-mono">{activeTroop.speed || 50}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Passo 3: Quantidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300">3. Quantidade em Estoque no Quartel:</label>
              <div className="flex gap-1">
                {[100, 500, 1000, 5000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setQuantity(quick)}
                    className="px-2 py-0.5 text-2xs font-bold bg-slate-800 border border-slate-600 rounded-lg hover:border-amber-400 text-slate-300 hover:text-white"
                  >
                    +{quick.toLocaleString('pt-BR')}
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
              className="w-full bg-[#0b0f19] border border-amber-500/50 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono font-black text-center focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Adicionar Tropa ao Quartel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

