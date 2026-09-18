import React, { useState } from 'react';
import { MonsterTarget, TroopClass, AttackMode, EnemySquadUnit } from '../types';
import { MONSTER_PRESET_TEMPLATES, buildMonsterTargetFromTemplate, updateMonsterSquads } from '../data/monsters';
import { EditSquadsModal } from './EditSquadsModal';
import { Skull, Crosshair, Flame, Swords, Crown, ShieldAlert, Edit3 } from 'lucide-react';

interface MonsterSelectorProps {
  selectedMonster: MonsterTarget;
  onSelectMonster: (monster: MonsterTarget) => void;
  compact?: boolean;
}

export const MonsterSelector: React.FC<MonsterSelectorProps> = ({
  selectedMonster,
  onSelectMonster,
}) => {
  const [activeAttackMode, setActiveAttackMode] = useState<AttackMode>(
    selectedMonster.attackMode || 'common'
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return selectedMonster.id.split('_lvl_')[0] || 'tropa_inferno_comum';
  });

  const [monsterLevel, setMonsterLevel] = useState<number>(selectedMonster.level || 17);
  const [isEditingSquads, setIsEditingSquads] = useState<boolean>(false);

  const filteredTemplates = MONSTER_PRESET_TEMPLATES.filter((t) => t.attackMode === activeAttackMode);
  const currentTemplate =
    filteredTemplates.find((t) => t.id === selectedTemplateId) ||
    filteredTemplates[0] ||
    MONSTER_PRESET_TEMPLATES[0];

  const handleModeChange = (mode: AttackMode) => {
    setActiveAttackMode(mode);
    const modeTemplates = MONSTER_PRESET_TEMPLATES.filter((t) => t.attackMode === mode);
    const newTemplate = modeTemplates[0] || MONSTER_PRESET_TEMPLATES[0];
    setSelectedTemplateId(newTemplate.id);
    const newLvl = newTemplate.defaultLevel;
    setMonsterLevel(newLvl);
    const newTarget = buildMonsterTargetFromTemplate(newTemplate, newLvl);
    onSelectMonster(newTarget);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = MONSTER_PRESET_TEMPLATES.find((t) => t.id === templateId) || MONSTER_PRESET_TEMPLATES[0];
    const newLvl = template.defaultLevel;
    setMonsterLevel(newLvl);
    const newTarget = buildMonsterTargetFromTemplate(template, newLvl);
    onSelectMonster(newTarget);
  };

  const handleLevelChange = (level: number) => {
    const validLevel = Math.max(1, Math.min(45, level));
    setMonsterLevel(validLevel);
    const newTarget = buildMonsterTargetFromTemplate(currentTemplate, validLevel);
    onSelectMonster(newTarget);
  };

  const handleSaveCustomSquads = (updatedSquads: EnemySquadUnit[]) => {
    const updated = updateMonsterSquads(selectedMonster, updatedSquads);
    onSelectMonster(updated);
  };

  const handleResetToTemplate = () => {
    const fresh = buildMonsterTargetFromTemplate(currentTemplate, monsterLevel);
    onSelectMonster(fresh);
  };

  const getTroopClassBadge = (tc: TroopClass) => {
    switch (tc) {
      case 'ranged':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#1e3a8a] text-blue-100 border border-[#60a5fa]">🏹 Longo Alcance</span>;
      case 'melee':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#991b1b] text-red-100 border border-[#f87171]">⚔️ Corpo a Corpo</span>;
      case 'mounted':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#78350f] text-amber-100 border border-[#f59e0b]">🐎 Montadas</span>;
      case 'flying':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#581c87] text-purple-100 border border-[#c084fc]">🦅 Voadores</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">{tc}</span>;
    }
  };

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 shadow-xl space-y-3 font-serif">
      {/* 1. Attack Mode Tabs: Comum vs Raro vs Épico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5a3e22] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Skull className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-sm font-black text-[#fef08a] font-fantasy tracking-wide">
            Seletor de Alvo do Mapa:
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange('common')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold font-sans border transition-all flex items-center justify-center gap-1.5 ${
              activeAttackMode === 'common'
                ? 'bg-gradient-to-r from-red-900 to-amber-900 text-[#fef08a] border-[#eab308] ring-1 ring-[#eab308]'
                : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Comum (Capitão)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('rare')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold font-sans border transition-all flex items-center justify-center gap-1.5 ${
              activeAttackMode === 'rare'
                ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-[#fef08a] border-[#c084fc] ring-1 ring-[#c084fc]'
                : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Raro (Herói)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('epic')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold font-sans border transition-all flex items-center justify-center gap-1.5 ${
              activeAttackMode === 'epic'
                ? 'bg-gradient-to-r from-amber-900 to-yellow-900 text-[#fef08a] border-[#f59e0b] ring-1 ring-[#f59e0b]'
                : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Épico</span>
          </button>
        </div>
      </div>

      {/* 2. Select Monster & Level Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Monster Dropdown (7 cols) */}
        <div className="sm:col-span-7 space-y-1">
          <label className="text-xs font-bold text-[#caa568] block">Tropa Inimiga:</label>
          <select
            value={currentTemplate.id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-[#180f0a] border border-[#5a3e22] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] transition-colors"
          >
            {filteredTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Input & Quick Pills (5 cols) */}
        <div className="sm:col-span-5 space-y-1 bg-[#180f0a] p-2 rounded-lg border border-[#5a3e22]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#caa568]">Nível do Monstro:</span>
            <span className="font-black text-[#fef08a] text-sm">Nv {monsterLevel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="45"
              value={monsterLevel}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="w-16 bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-black text-center text-xs focus:outline-none focus:border-[#caa568]"
            />
            {/* Quick Level Pills */}
            <div className="flex flex-wrap gap-1 flex-1">
              {currentTemplate.availableLevels.slice(0, 5).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold transition-all ${
                    monsterLevel === lvl
                      ? 'bg-[#caa568] text-[#1a110a]'
                      : 'bg-[#100a06] text-[#caa568]/70 hover:text-[#fef08a] border border-[#5a3e22]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sleek Target Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-[#5a3e22]/50 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Vulnerável a:</span>
          <div className="flex gap-1">
            {selectedMonster.weaknessClasses.map((w) => (
              <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingSquads(true)}
          className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 font-serif transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Ajustar esquadrões deste alvo</span>
        </button>
      </div>

      {/* Edit Squads Modal */}
      {isEditingSquads && (
        <EditSquadsModal
          isOpen={isEditingSquads}
          onClose={() => setIsEditingSquads(false)}
          initialSquads={selectedMonster.enemySquads || []}
          monsterName={selectedMonster.name}
          monsterLevel={selectedMonster.level}
          onSaveSquads={handleSaveCustomSquads}
          onResetToTemplate={handleResetToTemplate}
        />
      )}
    </div>
  );
};
