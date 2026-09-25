import React, { useState } from 'react';
import { EnemySquadUnit, TroopClass } from '../types';
import { MONSTER_UNITS_CATALOG } from '../data/monsters';
import { X, Plus, Trash2, RotateCcw, Save, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { SearchableMonsterSelect } from './SearchableMonsterSelect';
import { TroopAvatar } from './TroopAvatar';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0b0f19] border-b border-slate-700/80 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 border border-rose-400 text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                Ajustar Composição do Exército Inimigo (Monstros do Mapa)
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Alvo: <strong className="text-amber-300">{monsterName} (Nv {monsterLevel})</strong> — Edite os esquadrões inimigos para bater 100% com o seu jogo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Squads List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-300 font-semibold">
                Esquadrões: <strong className="text-white font-mono">{squads.length}</strong>
              </span>
              <span className="text-slate-300 font-semibold">
                Saúde Total Inimiga: <strong className="text-rose-400 font-mono font-black">{totalCalculatedHp.toLocaleString('pt-BR')}</strong>
              </span>
              <span className="text-slate-300 font-semibold">
                Força Total Inimiga: <strong className="text-amber-300 font-mono font-black">{totalCalculatedAtk.toLocaleString('pt-BR')}</strong>
              </span>
            </div>

            {onResetToTemplate && (
              <button
                type="button"
                onClick={() => {
                  onResetToTemplate();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão do Nível</span>
              </button>
            )}
          </div>

          {squads.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-700">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-200 font-bold">
                  Nenhum esquadrão cadastrado para este alvo.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no botão abaixo para adicionar os monstros e quantidades reais que aparecem no seu jogo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSquad}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Adicionar Primeiro Esquadrão</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {squads.map((sq, idx) => {
              return (
                <div
                  key={sq.id || idx}
                  className="bg-[#0b0f19] border border-slate-700/80 rounded-xl p-3.5 sm:p-4 space-y-3 relative group hover:border-amber-400/60 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-3">
                      <TroopAvatar
                        id={sq.id || sq.name}
                        size="md"
                        className="border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-black text-white text-sm">
                            {sq.name || `Esquadrão Inimigo #${idx + 1}`}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-3xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Tier {sq.tier}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-400 mt-0.5">
                          {sq.subType || 'Monstro do Mapa'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSquad(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Remover este esquadrão"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remover</span>
                    </button>
                  </div>

                  {/* Preset Quick Select from Monster Catalog */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-slate-400">
                        Carregar Monstro do Catálogo:
                      </label>
                      <SearchableMonsterSelect
                        onSelect={(unitId) => handleSelectCatalogUnit(idx, unitId)}
                        selectedMonsterName={sq.name}
                        placeholder={sq.name ? `Monstro: ${sq.name} (Trocar)` : '-- Selecionar Monstro por Classe / Nome --'}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-slate-400">Nome do Monstro:</label>
                      <input
                        type="text"
                        value={sq.name}
                        onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Squad Stats: Tier, Class, Count, Attack, Health */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-2xs text-slate-400 font-bold">Tier:</label>
                      <select
                        value={sq.tier}
                        onChange={(e) => handleUpdateField(idx, 'tier', Number(e.target.value))}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold"
                      >
                        <option value={1}>Tier I</option>
                        <option value={2}>Tier II</option>
                        <option value={3}>Tier III</option>
                        <option value={4}>Tier IV</option>
                        <option value={5}>Tier V</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs text-slate-400 font-bold">Classe:</label>
                      <select
                        value={sq.troopClass}
                        onChange={(e) => handleUpdateField(idx, 'troopClass', e.target.value as TroopClass)}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold"
                      >
                        <option value="ranged">🏹 Longo Alcance</option>
                        <option value="melee">⚔️ Corpo a Corpo</option>
                        <option value="mounted">🐎 Montadas</option>
                        <option value="flying">🦅 Voadores</option>
                        <option value="siege">🛡️ Cerco</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-rose-300">Quantidade (un.):</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.count}
                        onChange={(e) => handleUpdateField(idx, 'count', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#111827] border border-rose-500/40 rounded-lg px-2 py-1 text-xs text-rose-300 font-mono font-black text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs text-amber-300 font-bold">Força Unitária:</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.unitAttack}
                        onChange={(e) => handleUpdateField(idx, 'unitAttack', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs text-emerald-400 font-bold">Saúde Unitária:</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.unitHealth}
                        onChange={(e) => handleUpdateField(idx, 'unitHealth', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-400 font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* SubType & Aspect Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                    <div className="space-y-1">
                      <label className="text-2xs text-slate-400">Subtipo / Descrição (ex: Amaldiçoado, Voador):</label>
                      <input
                        type="text"
                        value={sq.subType || ''}
                        onChange={(e) => handleUpdateField(idx, 'subType', e.target.value)}
                        placeholder="Ex: Fera, Amaldiçoado, Unidade voadora"
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs text-amber-400 font-bold">Aspecto de Bônus / Habilidade:</label>
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
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-200"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Add Squad Button */}
          <button
            type="button"
            onClick={handleAddSquad}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400/80 bg-[#0b0f19] text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Adicionar Novo Esquadrão Inimigo</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0b0f19] border-t border-slate-700/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-2xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>As tropas recomendadas e baixas serão recalculadas imediatamente ao salvar.</span>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
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
