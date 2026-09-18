import React, { useState } from 'react';
import { MonsterTarget, TroopClass, AttackMode, EnemySquadUnit } from '../types';
import { MONSTER_PRESET_TEMPLATES, buildMonsterTargetFromTemplate, updateMonsterSquads } from '../data/monsters';
import { EditSquadsModal } from './EditSquadsModal';
import { Skull, Crosshair, Flame, Swords, Crown, ShieldAlert, Sparkles, Edit3 } from 'lucide-react';

interface MonsterSelectorProps {
  selectedMonster: MonsterTarget;
  onSelectMonster: (monster: MonsterTarget) => void;
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#1e3a8a] text-blue-100 border border-[#60a5fa]">🏹 Longo Alcance / Ranged</span>;
      case 'melee':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#991b1b] text-red-100 border border-[#f87171]">⚔️ Corpo a Corpo / Melee</span>;
      case 'mounted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#78350f] text-amber-100 border border-[#f59e0b]">🐎 Montadas / Mounted</span>;
      case 'flying':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#581c87] text-purple-100 border border-[#c084fc]">🦅 Voadores / Flying</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">{tc}</span>;
    }
  };

  return (
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5a3e22] pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Skull className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wide">
              Seletor de Monstros & Tropas do Mapa
            </h2>
            <p className="text-xs text-[#caa568]/80 font-serif">
              Escolha o Tipo de Ataque, a Tropa e o Nível ou ajuste os esquadrões manualmente
            </p>
          </div>
        </div>

        {selectedMonster.coordinates && (
          <span className="text-xs px-3 py-1 rounded font-bold font-sans bg-[#100a06] text-[#caa568] border border-[#5a3e22] self-start sm:self-auto">
            📍 {selectedMonster.coordinates}
          </span>
        )}
      </div>

      {/* Attack Mode Tabs: Comum vs Raro vs Épico */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleModeChange('common')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            activeAttackMode === 'common'
              ? 'bg-gradient-to-r from-red-900 to-amber-900 text-[#fef08a] border-[#eab308] shadow-md ring-1 ring-[#eab308]/60'
              : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Ataque Comum (Capitão)</span>
        </button>

        <button
          onClick={() => handleModeChange('rare')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            activeAttackMode === 'rare'
              ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-[#fef08a] border-[#c084fc] shadow-md ring-1 ring-[#c084fc]/60'
              : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>Ataque Raro (Herói)</span>
        </button>

        <button
          onClick={() => handleModeChange('epic')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            activeAttackMode === 'epic'
              ? 'bg-gradient-to-r from-amber-900 to-yellow-900 text-[#fef08a] border-[#f59e0b] shadow-md ring-1 ring-[#f59e0b]/60'
              : 'bg-[#180f0a] text-[#caa568]/70 border-[#5a3e22] hover:text-[#fef08a]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Monstro Épico</span>
        </button>
      </div>

      {/* Select Monster Troop & Level Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Monster Faction / Troop Dropdown (2 cols) */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-[#caa568]">Tropa / Espécie Alvo:</label>
          <select
            value={currentTemplate.id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full bg-[#180f0a] border border-[#5a3e22] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] transition-colors"
          >
            {filteredTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Selector (1 col) */}
        <div className="space-y-1.5 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#caa568]">Nível da Tropa:</span>
            <span className="font-black text-[#fef08a] text-sm">Nv {monsterLevel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="45"
              value={monsterLevel}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-black text-center text-sm focus:outline-none focus:border-[#caa568]"
            />
          </div>
          {/* Quick Level Pills */}
          <div className="flex flex-wrap gap-1 pt-1">
            {currentTemplate.availableLevels.slice(0, 5).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold transition-all ${
                  monsterLevel === lvl
                    ? 'bg-[#caa568] text-[#1a110a]'
                    : 'bg-[#100a06] text-[#caa568]/70 hover:text-[#fef08a] border border-[#5a3e22]'
                }`}
              >
                Nv {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enemy Squads Inside Target (Exact Total Battle squad cards) */}
      {selectedMonster.enemySquads && selectedMonster.enemySquads.length > 0 && (
        <div className="space-y-2 bg-[#180f0a] p-3.5 rounded-lg border border-[#5a3e22]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5a3e22]/70 pb-2 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-[#fef08a]">
                Composição Inimiga ({selectedMonster.enemySquads.length} esquadrões):
              </span>
              <span className="text-[11px] text-[#caa568] ml-2">
                HP Total: <strong className="text-red-400 font-sans">{selectedMonster.totalHealth.toLocaleString('pt-BR')}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingSquads(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/80 to-yellow-900/80 hover:from-amber-800 hover:to-yellow-800 text-amber-200 border border-amber-500/60 font-serif text-xs font-bold shadow-md transition-all self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>✏️ Ajustar Esquadrões Inimigos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-sans">
            {selectedMonster.enemySquads.map((sq) => {
              const tierRoman = ['I', 'II', 'III', 'IV', 'V'][sq.tier - 1] || `${sq.tier}`;
              return (
                <div
                  key={sq.id}
                  onClick={() => setIsEditingSquads(true)}
                  className="bg-[#241912] p-2.5 rounded-lg border border-[#caa568]/40 hover:border-[#caa568] cursor-pointer flex flex-col justify-between space-y-1.5 relative overflow-hidden transition-all group"
                  title="Clique para editar este esquadrão"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#fef08a] flex items-center gap-1 truncate">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-900/80 text-amber-200 border border-amber-500 font-serif">
                        {tierRoman}
                      </span>
                      {sq.name}
                    </span>
                    <span className="text-xs font-black text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                      {sq.count.toLocaleString('pt-BR')} un.
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 italic truncate">{sq.subType}</p>

                  <div className="grid grid-cols-2 gap-1 text-[10px] bg-[#140d08] p-1.5 rounded border border-[#5a3e22]/50">
                    <div>
                      <span className="text-slate-400 block">Força Unitária:</span>
                      <span className="font-bold text-amber-300">{sq.unitAttack.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Saúde Unitária:</span>
                      <span className="font-bold text-red-400">{sq.unitHealth.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {sq.aspects?.description && (
                    <div className="text-[10px] text-amber-200/90 bg-amber-950/40 px-1.5 py-1 rounded border border-amber-800/40">
                      ⚡ {sq.aspects.description}
                    </div>
                  )}

                  <div className="text-[10px] text-amber-300/0 group-hover:text-amber-300 text-right transition-colors font-serif">
                    ✏️ Clique para editar
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Rewards & Tactical Weaknesses */}
      <div className="bg-[#140d08] border border-[#5a3e22] rounded-lg p-3 space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#1c120a] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[10px]">XP Estimado:</span>
            <span className="font-extrabold text-emerald-400 font-sans">
              +{(selectedMonster.xpReward || selectedMonster.estimatedCaptainXP).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="bg-[#1c120a] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[10px]">Bravura (VP):</span>
            <span className="font-extrabold text-blue-400 font-sans">
              +{(selectedMonster.valorReward || selectedMonster.estimatedValorPoints).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="bg-[#1c120a] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[10px]">Pontos de Tar:</span>
            <span className="font-extrabold text-purple-400 font-sans">
              +{(selectedMonster.tarReward || Math.round(selectedMonster.level * 14000)).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="bg-[#1c120a] p-2 rounded border border-[#5a3e22]">
            <span className="text-slate-400 block text-[10px]">Pontos de Baú:</span>
            <span className="font-extrabold text-amber-400 font-sans">
              +{selectedMonster.estimatedChestPoints}
            </span>
          </div>
        </div>

        {/* Weakness Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#5a3e22]/50 text-xs">
          <span className="text-xs text-[#caa568] flex items-center gap-1 font-bold">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            Vulnerabilidades Táticas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedMonster.weaknessClasses.map((w) => (
              <React.Fragment key={w}>{getTroopClassBadge(w)}</React.Fragment>
            ))}
          </div>
        </div>
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
