import React, { useState } from 'react';
import { EnemySquadUnit, TroopClass } from '../types';
import { MONSTER_UNITS_CATALOG } from '../data/monsters';
import { X, Plus, Trash2, RotateCcw, Save, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface EditSquadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSquads: EnemySquadUnit[];
  monsterName: string;
  monsterLevel: number;
  onSaveSquads: (updatedSquads: EnemySquadUnit[]) => void;
  onResetToTemplate?: () => void;
}

export const EditSquadsModal: React.FC<EditSquadsModalProps> = ({
  isOpen,
  onClose,
  initialSquads,
  monsterName,
  monsterLevel,
  onSaveSquads,
  onResetToTemplate,
}) => {
  const [squads, setSquads] = useState<EnemySquadUnit[]>(() => JSON.parse(JSON.stringify(initialSquads)));

  if (!isOpen) return null;

  const handleUpdateField = (index: number, field: keyof EnemySquadUnit, value: any) => {
    setSquads((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleSelectCatalogUnit = (index: number, unitId: string) => {
    const catalogUnit = MONSTER_UNITS_CATALOG.find((u) => u.id === unitId);
    if (!catalogUnit) return;

    setSquads((prev) => {
      const next = [...prev];
      const currentCount = next[index]?.count || 100;
      next[index] = {
        id: `${catalogUnit.id}_${Date.now()}_${index}`,
        name: catalogUnit.name,
        tier: catalogUnit.tier,
        troopClass: catalogUnit.troopClass,
        family: catalogUnit.family,
        subType: catalogUnit.subType,
        unitAttack: catalogUnit.unitAttack,
        unitHealth: catalogUnit.unitHealth,
        leadership: catalogUnit.leadership,
        initiative: catalogUnit.initiative,
        count: currentCount,
        aspects: catalogUnit.aspects,
      };
      return next;
    });
  };

  const handleAddSquad = () => {
    const defaultCatalog = MONSTER_UNITS_CATALOG[0];
    const newSquad: EnemySquadUnit = {
      id: `custom_squad_${Date.now()}`,
      name: defaultCatalog.name,
      tier: defaultCatalog.tier,
      troopClass: defaultCatalog.troopClass,
      family: defaultCatalog.family,
      subType: defaultCatalog.subType,
      unitAttack: defaultCatalog.unitAttack,
      unitHealth: defaultCatalog.unitHealth,
      leadership: defaultCatalog.leadership,
      initiative: defaultCatalog.initiative,
      count: 100,
      aspects: defaultCatalog.aspects,
    };
    setSquads((prev) => [...prev, newSquad]);
  };

  const handleRemoveSquad = (index: number) => {
    if (squads.length <= 1) {
      alert('O alvo precisa ter no mínimo 1 esquadrão inimigo.');
      return;
    }
    setSquads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (squads.length === 0) {
      alert('Adicione pelo menos 1 esquadrão inimigo.');
      return;
    }
    onSaveSquads(squads);
    onClose();
  };

  const totalCalculatedHp = squads.reduce((sum, s) => sum + (s.unitHealth * s.count), 0);
  const totalCalculatedAtk = squads.reduce((sum, s) => sum + (s.unitAttack * s.count), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1e140d] border-2 border-[#caa568] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-serif">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2e1d12] via-[#24160d] to-[#1a0f08] border-b-2 border-[#caa568]/60 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3d2917] border border-[#caa568] text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wide">
                Ajustar Composição das Tropas Inimigas
              </h3>
              <p className="text-xs text-[#caa568]">
                Alvo: <strong className="text-white">{monsterName} (Nv {monsterLevel})</strong> — Edite os esquadrões para bater 100% com o seu jogo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#caa568] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Squads List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 font-sans text-xs">
          <div className="bg-[#140d08] p-3 rounded-xl border border-[#5a3e22] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs font-serif">
              <span>
                Esquadrões: <strong className="text-[#fef08a]">{squads.length}</strong>
              </span>
              <span>
                Saúde Total Inimiga: <strong className="text-red-400">{totalCalculatedHp.toLocaleString('pt-BR')}</strong>
              </span>
              <span>
                Força Total Inimiga: <strong className="text-amber-300">{totalCalculatedAtk.toLocaleString('pt-BR')}</strong>
              </span>
            </div>

            {onResetToTemplate && (
              <button
                type="button"
                onClick={() => {
                  onResetToTemplate();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2a1a10] text-[#caa568] hover:text-[#fef08a] border border-[#5a3e22] text-xs font-serif transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão do Nível</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {squads.map((sq, idx) => {
              return (
                <div
                  key={sq.id || idx}
                  className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-3.5 sm:p-4 space-y-3 relative group hover:border-[#caa568]/80 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-[#5a3e22]/80 pb-2">
                    <span className="font-bold text-[#fef08a] flex items-center gap-2 font-serif text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-500 flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      Esquadrão Inimigo #{idx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveSquad(idx)}
                      className="text-red-400/80 hover:text-red-300 p-1 rounded hover:bg-red-950/50 transition-colors flex items-center gap-1 text-xs"
                      title="Remover este esquadrão"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remover</span>
                    </button>
                  </div>

                  {/* Preset Quick Select from Monster Catalog */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#caa568]">
                        Carregar Monstro do Catálogo:
                      </label>
                      <select
                        onChange={(e) => handleSelectCatalogUnit(idx, e.target.value)}
                        defaultValue=""
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded-lg px-2.5 py-1.5 text-xs text-[#fef08a] focus:outline-none focus:border-[#caa568]"
                      >
                        <option value="" disabled>
                          -- Selecionar Monstro Conhecido --
                        </option>
                        {MONSTER_UNITS_CATALOG.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            Tier {cat.tier} - {cat.name} ({cat.subType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#caa568]">Nome do Monstro:</label>
                      <input
                        type="text"
                        value={sq.name}
                        onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#caa568]"
                      />
                    </div>
                  </div>

                  {/* Squad Stats: Tier, Class, Count, Attack, Health */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Tier:</label>
                      <select
                        value={sq.tier}
                        onChange={(e) => handleUpdateField(idx, 'tier', Number(e.target.value))}
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-xs text-amber-200 font-bold"
                      >
                        <option value={1}>Tier I</option>
                        <option value={2}>Tier II</option>
                        <option value={3}>Tier III</option>
                        <option value={4}>Tier IV</option>
                        <option value={5}>Tier V</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Classe:</label>
                      <select
                        value={sq.troopClass}
                        onChange={(e) => handleUpdateField(idx, 'troopClass', e.target.value as TroopClass)}
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-xs text-slate-200"
                      >
                        <option value="ranged">🏹 Longo Alcance</option>
                        <option value="melee">⚔️ Corpo a Corpo</option>
                        <option value="mounted">🐎 Montadas</option>
                        <option value="flying">🦅 Voadores</option>
                        <option value="siege">🛡️ Cerco</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-red-300">Quantidade (un.):</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.count}
                        onChange={(e) => handleUpdateField(idx, 'count', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#100a06] border border-red-900/60 rounded px-2 py-1 text-xs text-red-300 font-black text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-amber-300">Força Unitária:</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.unitAttack}
                        onChange={(e) => handleUpdateField(idx, 'unitAttack', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-xs text-amber-300 font-bold text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-red-400">Saúde Unitária:</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.unitHealth}
                        onChange={(e) => handleUpdateField(idx, 'unitHealth', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-xs text-red-400 font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* SubType & Aspect Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Subtipo / Descrição (ex: Amaldiçoado, Voador):</label>
                      <input
                        type="text"
                        value={sq.subType || ''}
                        onChange={(e) => handleUpdateField(idx, 'subType', e.target.value)}
                        placeholder="Ex: Fera, Amaldiçoado, Unidade voadora"
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-amber-400">Aspecto de Bônus / Habilidade:</label>
                      <input
                        type="text"
                        value={sq.aspects?.description || ''}
                        onChange={(e) => {
                          const desc = e.target.value;
                          setSquads((prev) => {
                            const next = [...prev];
                            next[idx] = {
                              ...next[idx],
                              aspects: {
                                ...next[idx].aspects,
                                description: desc,
                              },
                            };
                            return next;
                          });
                        }}
                        placeholder="Ex: Força contra unidades corpo a corpo: +30%"
                        className="w-full bg-[#140d08] border border-[#5a3e22] rounded px-2 py-1 text-[11px] text-amber-200"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Squad Button */}
          <button
            type="button"
            onClick={handleAddSquad}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#caa568]/50 hover:border-[#caa568] bg-[#140d08] text-[#caa568] hover:text-[#fef08a] font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-[#241912]"
          >
            <Plus className="w-4 h-4 text-[#fef08a]" />
            <span>Adicionar Novo Esquadrão Inimigo</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#140d08] border-t-2 border-[#5a3e22] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#caa568]/80 font-serif flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fef08a]" />
            <span>As tropas recomendadas e baixas serão recalculadas imediatamente ao salvar.</span>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#241912] text-[#caa568] hover:text-white border border-[#5a3e22] text-xs font-serif font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-emerald-100 border border-emerald-400 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar & Recalcular</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
