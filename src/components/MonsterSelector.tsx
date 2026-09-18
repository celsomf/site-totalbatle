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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-black bg-[#1e3a8a] text-blue-100 border border-[#60a5fa]">🏹 Longo Alcance</span>;
      case 'melee':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-black bg-[#991b1b] text-red-100 border border-[#f87171]">⚔️ Corpo a Corpo</span>;
      case 'mounted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-black bg-[#78350f] text-amber-100 border border-[#f59e0b]">🐎 Montadas</span>;
      case 'flying':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-black bg-[#581c87] text-purple-100 border border-[#c084fc]">🦅 Voadores</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 text-slate-200">{tc}</span>;
    }
  };

  return (
    <div className="bg-[#1c120a] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* 1. Attack Mode Tabs: Comum vs Raro vs Épico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5a3e22] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568] shadow">
            <Skull className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-base font-black text-yellow-300 tracking-wide">
            Seletor de Alvo do Mapa:
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange('common')}
            className={`py-2 px-3.5 rounded-lg text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'common'
                ? 'bg-gradient-to-r from-red-800 to-amber-800 text-yellow-200 border-yellow-400 ring-2 ring-yellow-400/80'
                : 'bg-[#120a06] text-amber-200/80 border-[#5a3e22] hover:text-white hover:border-[#caa568]'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>Comum (Capitão)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('rare')}
            className={`py-2 px-3.5 rounded-lg text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'rare'
                ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-yellow-200 border-purple-400 ring-2 ring-purple-400/80'
                : 'bg-[#120a06] text-amber-200/80 border-[#5a3e22] hover:text-white hover:border-[#caa568]'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Raro (Herói)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('epic')}
            className={`py-2 px-3.5 rounded-lg text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'epic'
                ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-yellow-200 border-yellow-400 ring-2 ring-yellow-400/80'
                : 'bg-[#120a06] text-amber-200/80 border-[#5a3e22] hover:text-white hover:border-[#caa568]'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Épico</span>
          </button>
        </div>
      </div>

      {/* 2. Select Monster & Level Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
        {/* Monster Dropdown (7 cols) */}
        <div className="sm:col-span-7 space-y-1.5">
          <label className="text-xs font-bold text-amber-300 block">Tropa Inimiga:</label>
          <select
            value={currentTemplate.id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-[#120a06] border-2 border-[#5a3e22] rounded-lg px-3.5 py-2.5 text-sm sm:text-base text-yellow-200 font-extrabold focus:outline-none focus:border-yellow-400 transition-colors shadow"
          >
            {filteredTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Input & Quick Pills (5 cols) */}
        <div className="sm:col-span-5 space-y-1.5 bg-[#120a06] p-3 rounded-lg border-2 border-[#5a3e22] shadow">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-300">Nível do Monstro:</span>
            <span className="font-black text-yellow-300 text-sm">Nv {monsterLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="45"
              value={monsterLevel}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="w-16 bg-[#080402] border-2 border-[#caa568] rounded px-2 py-1 text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400"
            />
            {/* Quick Level Pills */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {currentTemplate.availableLevels.slice(0, 5).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`text-xs px-2 py-1 rounded font-black transition-all ${
                    monsterLevel === lvl
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-[#1c120a] text-amber-200 hover:text-white border border-[#5a3e22]'
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-[#5a3e22]">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-300 font-bold">Vulnerável a:</span>
          <div className="flex gap-1.5 flex-wrap">
            {selectedMonster.weaknessClasses.map((w) => (
              <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingSquads(true)}
          className="text-xs text-yellow-300 hover:text-white font-extrabold flex items-center gap-1.5 transition-colors bg-[#241912] px-3 py-1 rounded-md border border-[#5a3e22]"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
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
