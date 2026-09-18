import React, { useState } from 'react';
import { TroopUnit, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { AddTroopModal } from './AddTroopModal';
import { TroopDetailModal } from './TroopDetailModal';
import { Shield, Swords, Heart, Users, Plus, Search, RefreshCw } from 'lucide-react';

interface BarracksViewProps {
  troops: TroopUnit[];
  profile?: PlayerProfile;
  onToggleUnlocked: (troopId: string) => void;
  onUpdateOwnedCount: (troopId: string, count: number) => void;
  onUpdateCustomStat?: (troopId: string, attack: number, health: number) => void;
  onAddTroop?: (troop: TroopUnit) => void;
  onRemoveCustomTroop?: (troopId: string) => void;
  onResetDefaults?: () => void;
}

export const BarracksView: React.FC<BarracksViewProps> = ({
  troops,
  profile,
  onToggleUnlocked,
  onUpdateOwnedCount,
  onAddTroop,
  onRemoveCustomTroop,
  onResetDefaults,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guardsman' | 'specialist' | 'monster' | 'mercenary' | 'spy'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTroopForDetail, setSelectedTroopForDetail] = useState<TroopUnit | null>(null);

  const activeTroops = troops.filter((t) => t.isUnlocked);
  
  const filteredTroops = activeTroops.filter((troop) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'spy' && (troop.troopClass === 'melee' || troop.id.includes('spies') || troop.id.includes('assassin'))) ||
      troop.category === selectedCategory;
    
    const matchesSearch =
      troop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      troop.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `T${troop.tier}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalAllArmy = activeTroops.reduce((sum, t) => sum + t.ownedCount, 0);

  const handleAdjustCount = (troopId: string, currentCount: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateOwnedCount(troopId, Math.max(0, currentCount + delta));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Actions */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 flex-shrink-0">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Quartel & Estoque de Exército
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Gerencie o número de tropas reais da sua conta para alimentar o algoritmo tático de ataque
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onAddTroop && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="tb-btn-gold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg font-black flex-1 md:flex-initial"
              >
                <Plus className="w-4 h-4" /> Adicionar Tropa Customizada
              </button>
            )}

            {onResetDefaults && (
              <button
                onClick={() => {
                  if (window.confirm('Deseja restaurar as tropas para a configuração padrão de Araning?')) {
                    onResetDefaults();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow"
                title="Restaurar exército original de Araning"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Restaurar Padrão</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0b0f19] border border-slate-700/80 p-3.5 rounded-xl shadow-inner">
            <span className="text-xs font-semibold text-slate-400 block">Total do Exército</span>
            <div className="text-lg sm:text-xl font-mono font-black text-amber-300 mt-0.5">
              {totalAllArmy.toLocaleString('pt-BR')} <span className="text-xs font-sans text-slate-400 font-normal">soldados</span>
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-slate-700/80 p-3.5 rounded-xl shadow-inner">
            <span className="text-xs font-semibold text-slate-400 block">Tipos de Tropas Ativas</span>
            <div className="text-lg sm:text-xl font-mono font-black text-emerald-300 mt-0.5">
              {activeTroops.length} <span className="text-xs font-sans text-slate-400 font-normal">classes</span>
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-slate-700/80 p-3.5 rounded-xl shadow-inner">
            <span className="text-xs font-semibold text-slate-400 block">Lanceiros de Bucha (G1)</span>
            <div className="text-lg sm:text-xl font-mono font-black text-sky-300 mt-0.5">
              {(troops.find((t) => t.id === 'sperman_I' || t.id === 'g1_melee')?.ownedCount || 0).toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-slate-700/80 p-3.5 rounded-xl shadow-inner">
            <span className="text-xs font-semibold text-slate-400 block">Titãs de Choque (M5)</span>
            <div className="text-lg sm:text-xl font-mono font-black text-purple-300 mt-0.5">
              {(troops.find((t) => t.id === 'm5_titan')?.ownedCount || 0).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0b0f19] border border-slate-700/80">
            {[
              { id: 'all', label: '⭐ Todas as Tropas' },
              { id: 'guardsman', label: '🛡️ Guardas (G1-G7)' },
              { id: 'specialist', label: '⚔️ Especialistas' },
              { id: 'monster', label: '🦁 Monstros (M1-M7)' },
              { id: 'mercenary', label: '🦅 Mercenários' },
              { id: 'spy', label: '🗡️ Espias' },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou tier..."
              className="w-full bg-[#0b0f19] border border-slate-700 focus:border-amber-400 pl-9 pr-3 py-1.5 text-xs text-white rounded-xl outline-none font-bold placeholder-slate-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Troops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTroops.map((troop) => {
          return (
            <div
              key={troop.id}
              onClick={() => setSelectedTroopForDetail(troop)}
              className="bg-[#111827] hover:bg-[#162032] border border-slate-700/80 hover:border-amber-400/80 rounded-2xl p-4 transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between gap-3 group cursor-pointer"
            >
              {/* Top row: Avatar, Name, Tier, Type Badge */}
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0b0f19] border border-slate-700 group-hover:border-amber-400/80 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-all">
                  <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-2xs font-black px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-600">
                      Tier {troop.tier}
                    </span>
                    <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#0b0f19] text-sky-300 border border-slate-700">
                      {troop.troopClass}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white truncate mt-1 group-hover:text-amber-300">
                    {troop.name}
                  </h3>

                  <div className="flex items-center gap-3 text-2xs text-slate-300 font-semibold mt-1">
                    <span className="flex items-center gap-1 text-rose-300">
                      <Swords className="w-3 h-3 text-rose-400" />
                      {(troop.customAttack || troop.baseAttack).toLocaleString('pt-BR')} Atq
                    </span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Heart className="w-3 h-3 text-emerald-400" />
                      {(troop.customHealth || troop.baseHealth).toLocaleString('pt-BR')} Vida
                    </span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Users className="w-3 h-3 text-sky-400" />
                      {troop.leadershipCost} Lid
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom row: Stock Counter Controls */}
              <div
                className="bg-[#0b0f19] border border-slate-700/80 p-2.5 rounded-xl flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col">
                  <span className="text-2xs font-semibold text-slate-400">Estoque:</span>
                  <span className="text-base font-mono font-black text-amber-300">
                    {troop.ownedCount.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, -1000, e)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-lg text-2xs font-bold"
                    title="-1000"
                  >
                    -1k
                  </button>
                  <button
                    onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, -100, e)}
                    className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-lg text-2xs font-bold"
                    title="-100"
                  >
                    -100
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={troop.ownedCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateOwnedCount(troop.id, isNaN(val) ? 0 : val);
                    }}
                    className="w-20 bg-[#111827] border border-amber-500/50 text-amber-300 text-center font-mono text-xs font-black py-1 px-1 rounded-lg outline-none focus:border-amber-400"
                  />

                  <button
                    onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, +100, e)}
                    className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-lg text-2xs font-bold"
                    title="+100"
                  >
                    +100
                  </button>
                  <button
                    onClick={(e) => handleAdjustCount(troop.id, troop.ownedCount, +1000, e)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-lg text-2xs font-bold"
                    title="+1000"
                  >
                    +1k
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTroops.length === 0 && (
        <div className="bg-[#111827] border border-dashed border-slate-700 rounded-2xl p-10 text-center space-y-3">
          <Shield className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-base font-bold text-slate-300">Nenhuma tropa encontrada com os filtros atuais.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="text-xs text-amber-400 font-black underline hover:text-amber-300"
          >
            Limpar filtros e mostrar todas
          </button>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && onAddTroop && (
        <AddTroopModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTroop={onAddTroop}
        />
      )}

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
