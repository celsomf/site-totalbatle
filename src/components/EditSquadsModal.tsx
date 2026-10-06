import React, { useEffect, useState } from 'react';
import { EnemySquadUnit } from '../types';
import { X, Plus, Trash2, RotateCcw, Save, ShieldAlert, Sparkles, AlertCircle, ClipboardPaste, ChevronDown } from 'lucide-react';
import { SearchableMonsterSelect } from './SearchableMonsterSelect';
import { TroopAvatar } from './TroopAvatar';
import { useGameCatalog } from '../context/GameCatalogContext';

const BULK_INPUT_TEMPLATE = '[Nome ou ID do monstro]; [quantidade]\n[Nome ou ID do monstro]; [quantidade]';

interface EditSquadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSquads: EnemySquadUnit[];
  monsterName: string;
  monsterLevel: number;
  onSaveSquads: (updatedSquads: EnemySquadUnit[]) => void | Promise<void>;
  onResetToTemplate?: () => void | Promise<void>;
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
  const { monsters } = useGameCatalog();
  const [squads, setSquads] = useState<EnemySquadUnit[]>(() => JSON.parse(JSON.stringify(initialSquads)));
  const [bulkInput, setBulkInput] = useState(BULK_INPUT_TEMPLATE);
  const [isBulkImportExpanded, setIsBulkImportExpanded] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSquads(JSON.parse(JSON.stringify(initialSquads)));
      setBulkInput(BULK_INPUT_TEMPLATE);
      setBulkError(null);
      setSaveError(null);
    }
  }, [initialSquads, isOpen]);

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
    const catalogUnit = monsters.find((u) => u.id === unitId);
    if (!catalogUnit) return;

    if (squads.some((squad, squadIndex) => squadIndex !== index && squad.id === catalogUnit.id)) {
      setBulkError(`${catalogUnit.name} já está nesta formação. Ajuste a quantidade na linha existente.`);
      return;
    }

    setSquads((prev) => {
      const next = [...prev];
      const currentCount = next[index]?.count || 100;
      next[index] = {
        id: catalogUnit.id,
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
        avatarUrl: catalogUnit.avatarPath,
      };
      return next;
    });
    setBulkError(null);
  };

  const handleAddSquad = () => {
    const defaultCatalog = monsters.find((monster) => !squads.some((squad) => squad.id === monster.id));
    if (!defaultCatalog) {
      setBulkError('Todos os monstros do catálogo já estão nesta formação. Remova um esquadrão para adicionar outro.');
      return;
    }
    const newSquad: EnemySquadUnit = {
      id: defaultCatalog.id,
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
      avatarUrl: defaultCatalog.avatarPath,
    };
    setSquads((prev) => [...prev, newSquad]);
    setBulkError(null);
  };

  const handleRemoveSquad = (index: number) => {
    setSquads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkImport = () => {
    const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const lines = bulkInput.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      setBulkError('Preencha ao menos uma linha do modelo com o nome ou ID e a quantidade.');
      return;
    }

    const additions = new Map<string, number>();
    const errors: string[] = [];
    let completedLines = 0;
    lines.forEach((line, index) => {
      const parts = line.split(/[;,\t]/).map((part) => part.trim());
      if (parts.length >= 2 && normalized(parts[0]) === '[nome ou id do monstro]' && normalized(parts[1]) === '[quantidade]') {
        return;
      }
      completedLines += 1;
      if (parts.length < 2) {
        errors.push(`Linha ${index + 1}: use Nome ou ID; quantidade.`);
        return;
      }
      const search = normalized(parts[0]);
      const quantity = Number(parts[1].replace(/\s/g, '').replace(/\./g, ''));
      const matches = monsters.filter((monster) => [monster.id, monster.name, ...(monster.aliases || [])]
        .some((value) => normalized(value) === search));
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        errors.push(`Linha ${index + 1}: a quantidade deve ser um inteiro maior que zero.`);
      } else if (matches.length !== 1) {
        errors.push(`Linha ${index + 1}: “${parts[0]}” não corresponde a um único monstro do catálogo.`);
      } else {
        additions.set(matches[0].id, (additions.get(matches[0].id) || 0) + quantity);
      }
    });

    if (completedLines === 0) {
      setBulkError('Preencha ao menos uma linha do modelo com o nome ou ID e a quantidade.');
      return;
    }

    if (errors.length > 0) {
      setBulkError(errors.slice(0, 4).join(' '));
      return;
    }

    setSquads((previous) => {
      const next = [...previous];
      for (const [monsterId, quantity] of additions) {
        const index = next.findIndex((squad) => squad.id === monsterId);
        if (index >= 0) {
          next[index] = { ...next[index], count: next[index].count + quantity };
          continue;
        }
        const monster = monsters.find((unit) => unit.id === monsterId)!;
        next.push({
          id: monster.id,
          name: monster.name,
          tier: monster.tier,
          troopClass: monster.troopClass,
          family: monster.family,
          subType: monster.subType,
          unitAttack: monster.unitAttack,
          unitHealth: monster.unitHealth,
          leadership: monster.leadership,
          initiative: monster.initiative,
          count: quantity,
          aspects: monster.aspects,
          avatarUrl: monster.avatarPath,
        });
      }
      return next;
    });
    setBulkInput(BULK_INPUT_TEMPLATE);
    setBulkError(null);
  };

  const handleSave = async () => {
    if (squads.length === 0) {
      const confirmed = window.confirm('Salvar uma formação vazia para este nível?');
      if (!confirmed) return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveSquads(squads);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar no banco.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onResetToTemplate) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onResetToTemplate();
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível remover a formação do banco.');
    } finally {
      setIsSaving(false);
    }
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
                onClick={() => void handleReset()}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Remover formação salva</span>
              </button>
            )}
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
            <button
              type="button"
              aria-expanded={isBulkImportExpanded}
              aria-controls="bulk-import-panel"
              onClick={() => setIsBulkImportExpanded((expanded) => !expanded)}
              className="w-full flex items-center justify-between gap-3 text-left text-xs font-bold text-blue-200"
            >
              <span className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Adicionar vários monstros de uma vez
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isBulkImportExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div id="bulk-import-panel" hidden={!isBulkImportExpanded} className="mt-2 space-y-2">
              <p className="text-2xs text-slate-400">Preencha uma linha por monstro. Use <code>nome ou ID; quantidade</code> e mantenha o ponto e vírgula.</p>
              <textarea
                aria-label="Monstros e quantidades para adicionar"
                value={bulkInput}
                onChange={(event) => setBulkInput(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleBulkImport}
                className="rounded-lg border border-blue-400/40 bg-blue-500/15 px-3 py-1.5 text-xs font-bold text-blue-100 hover:bg-blue-500/25"
              >
                Adicionar linhas à formação
              </button>
            </div>
            {bulkError && <p role="alert" className="mt-2 text-2xs text-rose-300">{bulkError}</p>}
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
                        avatarPath={sq.avatarUrl}
                        databaseOnly
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
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_160px] gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-slate-400">Monstro do catálogo:</label>
                      <SearchableMonsterSelect
                        onSelect={(unitId) => handleSelectCatalogUnit(idx, unitId)}
                        selectedMonsterName={sq.name}
                        placeholder={`Monstro: ${sq.name} (trocar)`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-rose-300">Quantidade:</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.count}
                        onChange={(e) => handleUpdateField(idx, 'count', Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#111827] border border-rose-500/40 rounded-lg px-2 py-2 text-sm text-rose-300 font-mono font-black text-center"
                      />
                    </div>
                  </div>
                  <p className="text-2xs text-slate-400">
                    T{sq.tier} · {sq.troopClass} · Força {sq.unitAttack.toLocaleString('pt-BR')} · Saúde {sq.unitHealth.toLocaleString('pt-BR')} por unidade
                    {sq.aspects?.description ? ` · ${sq.aspects.description}` : ''}
                  </p>
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
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando no banco…' : 'Salvar & Recalcular'}</span>
            </button>
          </div>
          {saveError && <p role="alert" className="text-xs text-rose-300">{saveError}</p>}
        </div>
      </div>
    </div>
  );
};
