import React, { useState } from 'react';
import { MonsterTarget, TroopClass, AttackMode, EnemySquadUnit, TroopUnit, PlayerProfile, Captain } from '../types';
import { MONSTER_PRESET_TEMPLATES, buildMonsterTargetFromTemplate, updateMonsterSquads } from '../data/monsters';
import { findOptimalFarmLevel } from '../utils/combatSimulator';
import { DEFAULT_CAPTAINS } from '../data/captains';
import { EditSquadsModal } from './EditSquadsModal';
import { Skull, Swords, Crown, Flame, Edit3, Zap } from 'lucide-react';

interface MonsterSelectorProps {
  selectedMonster: MonsterTarget;
  onSelectMonster: (monster: MonsterTarget) => void;
  compact?: boolean;
  troops?: TroopUnit[];
  profile?: PlayerProfile;
  captain?: Captain;
  sendDragon?: boolean;
}

export const MonsterSelector: React.FC<MonsterSelectorProps> = ({
  selectedMonster,
  onSelectMonster,
  troops,
  profile,
  captain,
  sendDragon,
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

  const fallbackCaptain: Captain = captain || DEFAULT_CAPTAINS[0];

  const optimalFarm =
    troops && profile
      ? findOptimalFarmLevel(currentTemplate, troops, profile, fallbackCaptain, sendDragon ?? true)
      : null;

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-950/80 text-blue-300 border border-blue-500/40">🏹 Longo Alcance</span>;
      case 'melee':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-950/80 text-rose-300 border border-rose-500/40">⚔️ Corpo a Corpo</span>;
      case 'mounted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-950/80 text-amber-300 border border-amber-500/40">🐎 Montadas</span>;
      case 'flying':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-950/80 text-purple-300 border border-purple-500/40">🦅 Voadores</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200">{tc}</span>;
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
      {/* 1. Attack Mode Tabs: Comum vs Raro vs Épico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 shadow-md border border-rose-400">
            <Skull className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-wide block">
              Seletor de Alvo Inimigo
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Escolha a tropa inimiga ou monstro para calcular a marcha sem perdas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange('common')}
            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'common'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>Comum (Capitão)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('rare')}
            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'rare'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 ring-2 ring-purple-400/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Raro (Herói)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('epic')}
            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow ${
              activeAttackMode === 'epic'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black border-amber-200 ring-2 ring-amber-300/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Chefe Épico</span>
          </button>
        </div>
      </div>

      {/* 2. Select Monster & Level Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
        {/* Monster Dropdown (7 cols) */}
        <div className="sm:col-span-7 space-y-1.5">
          <label className="text-xs font-bold text-amber-300 block">Tropa / Monstro Inimigo:</label>
          <select
            value={currentTemplate.id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-700 hover:border-amber-500 rounded-xl px-4 py-3 text-sm sm:text-base text-white font-extrabold focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
          >
            {filteredTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Input & Quick Pills (5 cols) */}
        <div className="sm:col-span-5 space-y-2 bg-[#0b0f19] p-3 rounded-xl border border-slate-700 shadow-inner">
          {/* OPÇÃO LOGO ACIMA DO NÍVEL INDICADO: SUBIR DE NÍVEL RÁPIDO */}
          {optimalFarm && (
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5 min-w-0">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
                <span className="text-2xs sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">
                  Subir de Nível Rápido (XP Farm):
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleLevelChange(optimalFarm.optimalLevel)}
                className={`text-2xs font-black px-2.5 py-0.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 shadow ${
                  monsterLevel === optimalFarm.optimalLevel
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-1 ring-emerald-400 font-black'
                    : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/60 hover:from-amber-500 hover:to-yellow-500 hover:text-slate-950'
                }`}
                title="Clique para selecionar o maior nível que seu exército vence sem perdas nobres"
              >
                <span>🎯 Nv {optimalFarm.optimalLevel}</span>
                {monsterLevel !== optimalFarm.optimalLevel ? (
                  <span className="bg-amber-500 text-slate-950 text-3xs px-1 rounded font-black">
                    Aplicar
                  </span>
                ) : (
                  <span className="text-3xs text-slate-950 font-black">✓ Ativo</span>
                )}
              </button>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">Nível do Monstro:</span>
            <span className="font-black text-amber-300 text-sm">Nv {monsterLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="45"
              value={monsterLevel}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="w-16 bg-[#111827] border border-amber-500/60 rounded-lg px-2 py-1 text-amber-300 font-black text-center text-sm focus:outline-none focus:border-amber-400"
            />
            {/* Quick Level Pills */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {currentTemplate.availableLevels.slice(0, 5).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-extrabold transition-all ${
                    monsterLevel === lvl
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Dica contextual de Nível Seguro para XP */}
          {optimalFarm && monsterLevel > optimalFarm.optimalLevel && (
            <div className="text-2xs font-bold text-rose-300 bg-rose-950/70 border border-rose-800/80 p-1.5 rounded-lg flex items-center gap-1.5">
              <span>⚠️ Nv {monsterLevel} é derrota! Use Nv {optimalFarm.optimalLevel} para farmar sem perder tropas.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Sleek Target Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs border-t border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 font-semibold">Vulnerável a:</span>
          <div className="flex gap-1.5 flex-wrap">
            {selectedMonster.weaknessClasses.map((w) => (
              <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingSquads(true)}
          className="text-xs text-amber-300 hover:text-white font-extrabold flex items-center gap-1.5 transition-colors bg-slate-800/90 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-600"
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
