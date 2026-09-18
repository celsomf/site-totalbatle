import React, { useState } from 'react';
import { TroopUnit, TroopCategory, TroopClass } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { X, Plus, Shield, Swords, Heart, Users, Sparkles } from 'lucide-react';

interface AddTroopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTroop: (troop: TroopUnit) => void;
}

const AVAILABLE_AVATARS = [
  { id: 'epic_monster_hunter_v', label: 'Epic Monster Hunter V' },
  { id: 'water_elemental', label: 'Water Elemental' },
  { id: 'berserker', label: 'Berserker' },
  { id: 'g5_flying', label: 'Grifo de Batalha (Voador)' },
  { id: 'g6_ranged', label: 'Besteiro Pesado' },
  { id: 'g6_melee', label: 'Alabardeiro Pesado' },
  { id: 'g6_mounted', label: 'Cavaleiro Montado' },
  { id: 'g7_ranged', label: 'Purificador' },
  { id: 'g7_melee', label: 'Justiceiro' },
  { id: 'g7_mounted', label: 'Triturador' },
  { id: 'g7_flying', label: 'Corvo de Batalha' },
  { id: 'm3_golem', label: 'Golem de Rocha' },
  { id: 'm3_specter', label: 'Espectro de Gelo' },
  { id: 'm3_beast', label: 'Besta Blindada' },
  { id: 'm5_titan', label: 'Titã de Fogo' },
  { id: 'archer_I', label: 'Arqueiro I' },
  { id: 'archer_II', label: 'Arqueiro II' },
  { id: 'archer_III', label: 'Arqueiro III' },
  { id: 'archer_IV', label: 'Arqueiro IV' },
  { id: 'archer_V', label: 'Arqueiro V' },
  { id: 'swordman_I', label: 'Espadachim I' },
  { id: 'swordman_II', label: 'Espadachim II' },
  { id: 'swordman_III', label: 'Espadachim III' },
  { id: 'swordman_IV', label: 'Espadachim IV' },
  { id: 'swordman_V', label: 'Espadachim V' },
  { id: 'rider_I', label: 'Cavaleiro I' },
  { id: 'rider_II', label: 'Cavaleiro II' },
  { id: 'rider_III', label: 'Cavaleiro III' },
  { id: 'rider_IV', label: 'Cavaleiro IV' },
  { id: 'rider_V', label: 'Cavaleiro V' },
  { id: 'spies_I', label: 'Assassino / Espia I' },
  { id: 'spies_II', label: 'Assassino / Espia II' },
  { id: 'spies_III', label: 'Assassino / Espia III' },
  { id: 'spies_IV', label: 'Assassino / Espia IV' },
  { id: 'spies_V', label: 'Assassino / Espia V' },
];

export const AddTroopModal: React.FC<AddTroopModalProps> = ({ isOpen, onClose, onAddTroop }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TroopCategory>('guardsman');
  const [troopClass, setTroopClass] = useState<TroopClass>('ranged');
  const [tier, setTier] = useState<number>(1);
  const [baseAttack, setBaseAttack] = useState<number>(150);
  const [baseHealth, setBaseHealth] = useState<number>(450);
  const [ownedCount, setOwnedCount] = useState<number>(100);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('g1_ranged');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#241912] border-2 border-[#caa568] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative font-serif text-[#f4ebd9] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#caa568] hover:text-white bg-[#180f0a] border border-[#5a3e22] rounded-full p-1.5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#5a3e22] pb-3 mb-4">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Plus className="w-6 h-6 text-[#fef08a]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#fef08a] font-fantasy tracking-wider">
              Recrutar Nova Tropa para o Exército
            </h2>
            <p className="text-xs text-[#caa568]/80 font-serif">
              Cadastre novos soldados, monstros ou mercenários com seus atributos reais
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#caa568]">Nome do Soldado / Tropa:</label>
              <input
                type="text"
                required
                placeholder="Ex: Guerreiro de Lava VI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#100a06] border border-[#5a3e22] rounded-lg px-3 py-2 text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568]"
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
                <option value="specialist">Especialistas (Espias/Assassinos)</option>
                <option value="monster">Monstros / Elementais</option>
                <option value="mercenary">Mercenários</option>
              </select>
            </div>
          </div>

          {/* Second Row: Class & Tier */}
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
              <label className="text-xs font-bold text-[#caa568]">Tier da Tropa (I a VII):</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded border ${
                      tier === t
                        ? 'bg-gradient-to-b from-[#8b5a2b] to-[#5a3a1b] text-[#fef08a] border-[#fef08a] shadow'
                        : 'bg-[#140e0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
                    }`}
                  >
                    {t === 1 ? 'I' : t === 2 ? 'II' : t === 3 ? 'III' : t === 4 ? 'IV' : t === 5 ? 'V' : t === 6 ? 'VI' : 'VII'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Third Row: Stats (Strength, Health, Owned Count) */}
          <div className="grid grid-cols-3 gap-3 bg-[#180f0a] p-3 rounded-xl border border-[#5a3e22]">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#caa568] flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-red-400" /> Força / Ataque:
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
                <Heart className="w-3.5 h-3.5 text-emerald-400" /> Saúde / Vida:
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
                <Users className="w-3.5 h-3.5 text-blue-400" /> Em Estoque:
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

          {/* Avatar Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#caa568] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Escolha o Retrato / Imagem da Tropa:
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-40 overflow-y-auto bg-[#140e0a] p-2 rounded-xl border border-[#5a3e22]">
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

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#5a3e22]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#caa568] hover:bg-[#180f0a] border border-transparent hover:border-[#5a3e22]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="tb-btn-gold px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Cadastrar Soldado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
