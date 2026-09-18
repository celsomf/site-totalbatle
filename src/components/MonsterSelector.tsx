import React, { useState } from 'react';
import { MonsterTarget, TroopClass } from '../types';
import { MONSTER_ARCHETYPES, createMonsterInstance } from '../data/monsters';
import { Skull, Crosshair, Flame } from 'lucide-react';

interface MonsterSelectorProps {
  selectedMonster: MonsterTarget;
  onSelectMonster: (monster: MonsterTarget) => void;
}

export const MonsterSelector: React.FC<MonsterSelectorProps> = ({
  selectedMonster,
  onSelectMonster,
}) => {
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(() => {
    return selectedMonster.id.split('_lvl_')[0] || 'inferno_squad';
  });

  const [monsterLevel, setMonsterLevel] = useState<number>(selectedMonster.level || 10);

  const currentArchetype = MONSTER_ARCHETYPES.find((a) => a.id === selectedArchetypeId) || MONSTER_ARCHETYPES[0];

  const handleArchetypeChange = (archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    const arch = MONSTER_ARCHETYPES.find((a) => a.id === archetypeId) || MONSTER_ARCHETYPES[0];
    const newMonster = createMonsterInstance(arch, monsterLevel);
    onSelectMonster(newMonster);
  };

  const handleLevelChange = (level: number) => {
    const validLevel = Math.max(1, Math.min(45, level));
    setMonsterLevel(validLevel);
    const newMonster = createMonsterInstance(currentArchetype, validLevel);
    onSelectMonster(newMonster);
  };

  const getTroopClassBadge = (tc: TroopClass) => {
    switch (tc) {
      case 'ranged':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-[#1e3a8a] text-blue-100 border border-[#60a5fa] shadow-sm">🏹 Arqueiros / Ranged</span>;
      case 'melee':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-[#991b1b] text-red-100 border border-[#f87171] shadow-sm">⚔️ Infantaria / Melee</span>;
      case 'mounted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-[#78350f] text-amber-100 border border-[#f59e0b] shadow-sm">🐎 Cavalaria / Mounted</span>;
      case 'flying':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-[#581c87] text-purple-100 border border-[#c084fc] shadow-sm">🦅 Voadores / Flying</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">{tc}</span>;
    }
  };

  const commonArchetypes = MONSTER_ARCHETYPES.filter((a) => a.type === 'common_monster');
  const epicArchetypes = MONSTER_ARCHETYPES.filter((a) => a.type === 'epic_monster');

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Skull className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wide">
              Monstro Alvo do Mapa Mundi
            </h2>
            <p className="text-xs text-[#caa568]/80 font-serif">Escolha o monstro e ajuste o nível (1 a 45)</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded font-bold font-serif border ${
          currentArchetype.type === 'epic_monster'
            ? 'bg-[#581c87] text-purple-200 border-[#c084fc]'
            : 'bg-[#991b1b] text-red-200 border-[#f87171]'
        }`}>
          {currentArchetype.type === 'epic_monster' ? '👑 Épico (2n+1)' : '⚔️ Comum'}
        </span>
      </div>

      {/* Select Monster Family & Level Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-serif">
        {/* Monster Family Dropdown (2 cols) */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-[#caa568]">Tipo / Espécie de Monstro:</label>
          <select
            value={selectedArchetypeId}
            onChange={(e) => handleArchetypeChange(e.target.value)}
            className="w-full bg-[#180f0a] border border-[#5a3e22] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] transition-colors"
          >
            <optgroup label="⚔️ Monstros Comuns (Inferno, Mortos-Vivos, Bárbaros)">
              {commonArchetypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="👑 Monstros Épicos (Clã & Eventos)">
              {epicArchetypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Level Number Input (1 col) */}
        <div className="space-y-1.5 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#caa568]">Nível:</span>
            <span className="font-black text-[#fef08a] text-sm">Nv {monsterLevel}</span>
          </div>
          <input
            type="number"
            min="1"
            max="45"
            value={monsterLevel}
            onChange={(e) => handleLevelChange(Number(e.target.value))}
            className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2.5 py-1 text-[#fef08a] font-black text-center text-base focus:outline-none focus:border-[#caa568]"
          />
        </div>
      </div>

      {/* Target Info & Rewards Summary Card */}
      <div className="bg-[#180f0a] border border-[#5a3e22] rounded-lg p-3.5 space-y-3 font-serif">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#fef08a] flex items-center gap-1.5 font-fantasy">
              <Flame className="w-4 h-4 text-red-500" />
              {selectedMonster.name}
            </h3>
            <p className="text-xs text-[#caa568]/80 mt-0.5">{selectedMonster.description}</p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded bg-[#100a06] text-[#caa568] border border-[#5a3e22]">
            Nível {selectedMonster.level}
          </span>
        </div>

        {/* Dynamic Rewards & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="bg-[#100a06] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[11px]">Vida (HP):</span>
            <span className="font-extrabold text-red-400">{selectedMonster.totalHealth.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#100a06] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[11px]">Poder de Ataque:</span>
            <span className="font-extrabold text-[#fef08a]">{selectedMonster.baseAttack.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#100a06] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[11px]">Bravura (VP):</span>
            <span className="font-extrabold text-blue-400">+{selectedMonster.estimatedValorPoints.toLocaleString('pt-BR')}</span>
          </div>
          <div className="bg-[#100a06] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[11px]">XP de Capitão:</span>
            <span className="font-extrabold text-emerald-400">+{selectedMonster.estimatedCaptainXP.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Weakness Badges */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-[#caa568] flex items-center gap-1 font-bold">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            Fraqueza de Combate (+50% Dano):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedMonster.weaknessClasses.map((w) => (
              <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
