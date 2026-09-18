import React, { useState } from 'react';
import { TroopUnit, TroopCategory, TroopClass } from '../types';
import { DEFAULT_TROOPS } from '../data/troops';
import { TroopAvatar } from './TroopAvatar';
import { X, Plus, Shield, Swords, Heart, Users, Sparkles, Search, BookOpen, Check } from 'lucide-react';

interface AddTroopModalProps {
  isOpen: boolean;
  currentTroops?: TroopUnit[];
  onClose: () => void;
  onAddTroop: (troop: TroopUnit) => void;
}

const AVAILABLE_AVATARS = [
  { id: 'epic_monter_hunter_V', label: 'Epic Monster Hunter V' },
  { id: 'water_elemental', label: 'Water Elemental' },
  { id: 'berserker', label: 'Berserker' },
  { id: 'archer_I', label: 'Arqueiro I' },
  { id: 'archer_II', label: 'Arqueiro II' },
  { id: 'archer_III', label: 'Arqueiro III' },
  { id: 'archer_IV', label: 'Arqueiro IV' },
  { id: 'archer_V', label: 'Arqueiro V' },
  { id: 'deadshot_V', label: 'Deadshot V' },
  { id: 'deadshot_VI', label: 'Deadshot VI' },
  { id: 'deadshot_VII', label: 'Deadshot VII' },
  { id: 'legitimist_I', label: 'Legitimist I' },
  { id: 'legitimist_II', label: 'Legitimist II' },
  { id: 'swordman_I', label: 'Espadachim I' },
  { id: 'swordman_II', label: 'Espadachim II' },
  { id: 'swordman_III', label: 'Espadachim III' },
  { id: 'swordman_IV', label: 'Espadachim IV' },
  { id: 'swordman_V', label: 'Espadachim V' },
  { id: 'heavy_knight_VI', label: 'Heavy Knight VI' },
  { id: 'duelist_I', label: 'Duelist I' },
  { id: 'duelist_II', label: 'Duelist II' },
  { id: 'rider_I', label: 'Cavaleiro I' },
  { id: 'rider_II', label: 'Cavaleiro II' },
  { id: 'rider_III', label: 'Cavaleiro III' },
  { id: 'rider_IV', label: 'Cavaleiro IV' },
  { id: 'rider_V', label: 'Cavaleiro V' },
  { id: 'lion_rider_V', label: 'Lion Rider V' },
  { id: 'lion_rider_VI', label: 'Lion Rider VI' },
  { id: 'lion_rider_VII', label: 'Lion Rider VII' },
  { id: 'whitemane_I', label: 'Whitemane I' },
  { id: 'whitemane_II', label: 'Whitemane II' },
  { id: 'vulture_V', label: 'Vulture V' },
  { id: 'vulture_VI', label: 'Vulture VI' },
  { id: 'vulture_VII', label: 'Vulture VII' },
  { id: 'royal_lion_I', label: 'Royal Lion I' },
  { id: 'royal_lion_II', label: 'Royal Lion II' },
  { id: 'spies_I', label: 'Batedor / Espia I' },
  { id: 'swift_jaeger_VI', label: 'Swift Jaeger VI' },
  { id: 'swift_jaeger_VII', label: 'Swift Jaeger VII' },
  { id: 'panoptic_I', label: 'Panoptic I' },
];

export const AddTroopModal: React.FC<AddTroopModalProps> = ({
  isOpen,
  currentTroops = [],
  onClose,
  onAddTroop,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [catalogCategory, setCatalogCategory] = useState<'all' | TroopCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogStockInputs, setCatalogStockInputs] = useState<Record<string, number>>({});

  // Custom Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TroopCategory>('guardsman');
  const [troopClass, setTroopClass] = useState<TroopClass>('ranged');
  const [tier, setTier] = useState<number>(1);
  const [baseAttack, setBaseAttack] = useState<number>(150);
  const [baseHealth, setBaseHealth] = useState<number>(450);
  const [ownedCount, setOwnedCount] = useState<number>(100);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('archer_I');

  if (!isOpen) return null;

  // Active troop ID set
  const activeTroopIds = new Set(
    currentTroops.filter((t) => t.isUnlocked).map((t) => t.id)
  );

  const filteredCatalog = DEFAULT_TROOPS.filter((troop) => {
    if (catalogCategory !== 'all' && troop.category !== catalogCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return troop.name.toLowerCase().includes(q) || troop.troopClass.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAddFromCatalog = (troop: TroopUnit) => {
    const stock = catalogStockInputs[troop.id] !== undefined ? catalogStockInputs[troop.id] : (troop.ownedCount || 100);
    onAddTroop({
      ...troop,
      isUnlocked: true,
      ownedCount: Math.max(0, stock),
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `custom_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newTroop: TroopUnit = {
      id: newId,
      name: name.trim(),
      category,
      troopClass,
      tier,
      baseAttack: Number(baseAttack) || 100,
      baseHealth: Number(baseHealth) || 300,
      ownedCount: Number(ownedCount) || 0,
      revivalSilverCost: Math.round(baseHealth * 0.1),
      leadershipCost: category === 'monster' ? 2 : 1,
      isUnlocked: true,
      avatarIcon: selectedAvatarId,
    };

    onAddTroop(newTroop);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn font-serif text-[#f4ebd9]">
      <div className="bg-[#241912] border-2 border-[#caa568] rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#caa568] hover:text-white bg-[#180f0a] border border-[#5a3e22] rounded-full p-1.5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#5a3e22] pb-3 mb-3">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Plus className="w-6 h-6 text-[#fef08a]" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-[#fef08a] font-fantasy tracking-wider">
              Adicionar Tropa ao Quartel
            </h2>
            <p className="text-xs text-[#caa568]/80">
              Escolha do catálogo oficial do Total Battle ou crie uma unidade personalizada
            </p>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-[#140c07] p-1 rounded-xl border border-[#5a3e22]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-[#fef08a] border border-[#f59e0b] shadow-md'
                : 'text-[#caa568]/70 hover:text-[#fef08a]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Catálogo Oficial ({DEFAULT_TROOPS.length} tropas)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-[#fef08a] border border-[#f59e0b] shadow-md'
                : 'text-[#caa568]/70 hover:text-[#fef08a]'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Criar Tropa Personalizada
          </button>
        </div>

        {/* TAB 1: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#caa568] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar tropa por nome (ex: Tiro Mortal, Leão, Grifo)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#fef08a] focus:outline-none focus:border-[#caa568]"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'guardsman', label: 'Guardas' },
                  { id: 'specialist', label: 'Especialistas' },
                  { id: 'monster', label: 'Monstros' },
                  { id: 'mercenary', label: 'Mercenários' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCatalogCategory(c.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap transition-all border ${
                      catalogCategory === c.id
                        ? 'bg-[#4a2e15] border-[#caa568] text-[#fef08a]'
                        : 'bg-[#140e0a] border-[#5a3e22] text-[#caa568]/70 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog List Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[48vh]">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#caa568]/70">
                  Nenhuma tropa encontrada com os filtros atuais.
                </div>
              ) : (
                filteredCatalog.map((troop) => {
                  const isInQuartel = activeTroopIds.has(troop.id);
                  const currentStockInput = catalogStockInputs[troop.id] ?? (troop.ownedCount || 100);

                  return (
                    <div
                      key={troop.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isInQuartel
                          ? 'bg-[#18110a]/90 border-[#5a3e22]'
                          : 'bg-[#120a06] border-[#3d2917] hover:border-[#caa568]/60'
                      }`}
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <TroopAvatar id={troop.avatarIcon || troop.id} tier={troop.tier} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#fef08a] truncate">{troop.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#2d1b0f] border border-[#caa568]/40 rounded text-[#caa568]">
                              Tier {troop.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#caa568]/80 mt-0.5">
                            <span className="text-amber-300 flex items-center gap-0.5">
                              <Swords className="w-2.5 h-2.5" /> {troop.baseAttack.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span className="text-red-300 flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5" /> {troop.baseHealth.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>Liderança: {troop.leadershipCost}</span>
                            <span>•</span>
                            <span>Vel: {troop.speed || 50}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Add/In Quartel Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 bg-[#100a06] px-2 py-1 rounded border border-[#5a3e22]">
                          <span className="text-[10px] text-[#caa568] hidden sm:inline">Qtd:</span>
                          <input
                            type="number"
                            min="0"
                            value={currentStockInput}
                            onChange={(e) =>
                              setCatalogStockInputs((prev) => ({
                                ...prev,
                                [troop.id]: Math.max(0, Number(e.target.value)),
                              }))
                            }
                            className="w-16 sm:w-20 bg-[#1c120c] border border-[#5a3e22] rounded px-1.5 py-0.5 text-xs text-[#fef08a] font-bold text-right"
                          />
                        </div>

                        {isInQuartel ? (
                          <button
                            onClick={() => handleAddFromCatalog(troop)}
                            title="Atualizar quantidade no Quartel"
                            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Atualizar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFromCatalog(troop)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#8b5a2b] to-[#5a3a1b] hover:from-[#a66d35] hover:to-[#6d4621] border border-[#caa568] text-[#fef08a] text-xs font-bold flex items-center gap-1 shadow transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM TROOP */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#caa568]">Nome do Soldado / Tropa:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Guerreiro de Lava VI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#caa568]">Categoria:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TroopCategory)}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded-lg px-3 py-2 text-xs text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568]"
                >
                  <option value="guardsman">Guardas (Soldados Básicos)</option>
                  <option value="specialist">Especialistas (Espias/Assassinos/Duelistas)</option>
                  <option value="monster">Monstros / Elementais</option>
                  <option value="mercenary">Mercenários</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#caa568]">Classe de Combate:</label>
                <select
                  value={troopClass}
                  onChange={(e) => setTroopClass(e.target.value as TroopClass)}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded-lg px-3 py-2 text-xs text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568]"
                >
                  <option value="ranged">Longo Alcance (Ranged / Arqueiro)</option>
                  <option value="melee">Corpo a Corpo (Melee / Guerreiro)</option>
                  <option value="mounted">Cavalaria (Mounted / Cavaleiro)</option>
                  <option value="flying">Voador (Flying / Grifo / Dragão)</option>
                  <option value="siege">Cerco (Siege / Catapulta)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#caa568]">Tier da Tropa (I a IX):</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded border ${
                        tier === t
                          ? 'bg-gradient-to-b from-[#8b5a2b] to-[#5a3a1b] text-[#fef08a] border-[#fef08a] shadow'
                          : 'bg-[#140e0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
                      }`}
                    >
                      {t === 1 ? 'I' : t === 2 ? 'II' : t === 3 ? 'III' : t === 4 ? 'IV' : t === 5 ? 'V' : t === 6 ? 'VI' : t === 7 ? 'VII' : t === 8 ? 'VIII' : 'IX'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22]">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#caa568] flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" /> Força / Ataque:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={baseAttack}
                  onChange={(e) => setBaseAttack(Number(e.target.value))}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-xs text-[#fef08a] font-bold text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#caa568] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> Saúde / Vida:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={baseHealth}
                  onChange={(e) => setBaseHealth(Number(e.target.value))}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-xs text-[#fef08a] font-bold text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#caa568] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Estoque Inicial:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ownedCount}
                  onChange={(e) => setOwnedCount(Number(e.target.value))}
                  className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-xs text-[#fef08a] font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#caa568] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Escolha o Retrato / Imagem da Tropa:
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-32 overflow-y-auto bg-[#140e0a] p-2 rounded-xl border border-[#5a3e22]">
                {AVAILABLE_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(av.id)}
                    title={av.label}
                    className={`p-1 rounded-lg border flex flex-col items-center gap-0.5 transition-all ${
                      selectedAvatarId === av.id
                        ? 'bg-gradient-to-b from-[#4a3018] to-[#29170a] border-[#caa568] ring-2 ring-[#fef08a]'
                        : 'bg-[#1a100a] border-[#5a3e22]/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <TroopAvatar id={av.id} tier={tier} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#5a3e22]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#180f0a] border border-[#5a3e22] text-[#caa568] hover:text-white rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-b from-[#8b5a2b] to-[#5a3a1b] hover:from-[#a66d35] hover:to-[#6d4621] border border-[#caa568] text-[#fef08a] font-bold rounded-lg text-xs tracking-wider flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Salvar Nova Tropa
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

