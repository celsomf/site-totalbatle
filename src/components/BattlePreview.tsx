import React, { useState } from 'react';
import { CombatSimulationResult, Captain, MonsterTarget, PlayerProfile } from '../types';
import { TroopAvatar } from './TroopAvatar';
import {
  Swords,
  Skull,
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BattlePreviewProps {
  simResult: CombatSimulationResult;
  profile: PlayerProfile;
  captain: Captain;
  sendDragon: boolean;
  targetMonster: MonsterTarget;
  defaultOpen?: boolean;
}

export const BattlePreview: React.FC<BattlePreviewProps> = ({
  simResult,
  profile,
  captain,
  sendDragon,
  targetMonster,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [viewMode, setViewMode] = useState<'arena' | 'log'>('arena');

  const isDefeat = simResult.outcome === 'DEFEAT';
  const totalSteps = simResult.rounds.length;

  return (
    <div id="battle-preview-section" className="bg-[#0b0f19] border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header Banner - Clickable as Accordion */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] p-4 rounded-xl border border-slate-700/80">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
        >
          <div className={`p-2.5 rounded-xl border flex items-center justify-center shadow-lg shrink-0 ${
            isDefeat
              ? 'bg-rose-950/80 border-rose-500 text-rose-400'
              : 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
          }`}>
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                Prévia da Batalha (Simulação de Relatório)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              {isOpen
                ? 'Confronto direto: resumo da arena e log turno a turno de combate'
                : 'Clique para expandir a prévia e conferir a arena visual e o log de turnos'}
            </p>
          </div>
        </div>

        {/* Right: Verdict & Accordion Toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {(!targetMonster.enemySquads || targetMonster.enemySquads.length === 0) ? (
            <div className="px-3.5 py-1.5 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg bg-slate-900 text-slate-400 border-slate-700">
              <span>AGUARDANDO MONSTROS</span>
            </div>
          ) : (
            <div className={`px-3.5 py-1.5 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg ${
              isDefeat
                ? 'bg-rose-950 text-rose-200 border-rose-500'
                : 'bg-emerald-950 text-emerald-200 border-emerald-500'
            }`}>
              {isDefeat ? <Skull className="w-3.5 h-3.5 text-rose-400" /> : <Crown className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isDefeat ? 'DERROTA PREVISTA' : 'VITÓRIA PREVISTA'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 text-xs font-bold transition-all shadow flex items-center gap-1.5"
            title={isOpen ? 'Ocultar detalhes da prévia' : 'Ver arena e detalhes da batalha'}
          >
            <span>{isOpen ? 'Ocultar' : 'Ver Prévia'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="space-y-4 animate-fadeIn">
          {(!targetMonster.enemySquads || targetMonster.enemySquads.length === 0) ? (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 text-center space-y-2.5 shadow-inner">
              <span className="text-3xl">🛡️</span>
              <h4 className="text-sm font-black text-amber-300">
                Nenhum monstro cadastrado para este alvo ({targetMonster.name})
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                As combinações fictícias foram removidas. Adicione os monstros e quantidades reais no seletor de alvos acima para visualizar a arena de combate e o relatório turno a turno.
              </p>
            </div>
          ) : (
            <>
              {/* Sub-bar with View Mode Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#111827] px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Confronto resolvido em <strong className="text-amber-300 font-mono">{totalSteps} rodadas</strong> de combate
            </span>

            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('arena')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'arena' ? 'bg-amber-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Arena Visual
              </button>
              <button
                type="button"
                onClick={() => setViewMode('log')}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'log' ? 'bg-amber-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Log Turno a Turno ({totalSteps})
              </button>
            </div>
          </div>

          {viewMode === 'arena' ? (
            /* Main Visual Arena Grid: ATACANTE vs DEFENSOR */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* LEFT SIDE: ATACANTE - 5 Cols */}
              <div className={`lg:col-span-5 bg-[#111827] rounded-2xl p-4 sm:p-5 border-2 flex flex-col justify-between space-y-4 shadow-xl ${
                isDefeat ? 'border-rose-900/60' : 'border-emerald-900/60'
              }`}>
                {/* Army Header */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center font-black text-amber-300 text-xs">
                      ⚔️
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Atacante: {profile.playerName || profile.heroName || 'Comandante'}
                      </h4>
                      <span className="text-2xs text-slate-400 font-semibold">
                        Reino {profile.kingdom || 'K:310'} • Capitão {captain.name}
                      </span>
                    </div>
                  </div>

                  <span className="text-2xs font-black px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono">
                    Dano: {simResult.totalPlayerDamage.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Leaders & Dragon Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Captain */}
                  <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-lg border border-amber-400/60 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      <img
                        src={`/assets/troops/${captain.id}.png`}
                        alt={captain.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = '/assets/troops/alexander.png';
                        }}
                      />
                      {isDefeat && (
                        <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center font-black text-red-300 text-lg">
                          ✕
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block truncate">{captain.name}</span>
                      <span className="text-2xs font-bold text-emerald-400">Nv {captain.level || 15}</span>
                    </div>
                  </div>

                  {/* Dragon */}
                  <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg border border-red-500/60 bg-slate-950 flex items-center justify-center text-xl shrink-0">
                      🐉
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block truncate">
                        {sendDragon ? 'Dragão Ativo' : 'Sem Dragão'}
                      </span>
                      <span className="text-2xs font-bold text-amber-400">
                        {sendDragon ? '+15% Dano' : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Squads Sent & Casualties Display */}
                <div className="space-y-2">
                  <span className="text-2xs font-black text-slate-400 uppercase tracking-wider block">
                    Esquadrões Enviados & Baixas Previstas:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {simResult.playerCasualties.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          c.lostCount >= c.initialCount
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                            : c.lostCount > 0
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <TroopAvatar id={c.id} tier={c.tier} size="sm" />
                          <span className="font-bold truncate text-xs">{c.name}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-xs block">
                            {c.initialCount.toLocaleString('pt-BR')} un.
                          </span>
                          <span className={`text-2xs font-bold ${
                            c.lostCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {c.lostCount > 0 ? `-${c.lostCount.toLocaleString('pt-BR')} mortos` : '0 baixas ✓'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER: VS CLASH BADGE (2 Cols) */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-2xl border-2 border-amber-300 ring-4 ring-black/50">
                  VS
                </div>
                <div className="text-center">
                  <span className="text-2xs font-black text-slate-400 uppercase tracking-widest block">
                    Resultado
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {totalSteps} rodadas
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE: DEFENSOR (Tropa Inimiga) - 5 Cols */}
              <div className={`lg:col-span-5 bg-[#111827] rounded-2xl p-4 sm:p-5 border-2 flex flex-col justify-between space-y-4 shadow-xl overflow-hidden ${
                isDefeat ? 'border-emerald-900/60' : 'border-rose-900/60'
              }`}>
                {/* Defender Header */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center font-black text-rose-400 text-xs shrink-0">
                      🛡️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider truncate" title={targetMonster.name}>
                        {targetMonster.name}
                      </h4>
                      <span className="text-2xs text-slate-400 font-semibold block truncate">
                        {targetMonster.enemySquads?.length || 0} esquadrões inimigos
                      </span>
                    </div>
                  </div>

                  <span className="text-2xs font-black px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-rose-400 font-mono shrink-0 whitespace-nowrap">
                    HP: {simResult.initialEnemyHp.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Enemy Squads & Remaining Survivors */}
                <div className="space-y-2 flex-1">
                  <span className="text-2xs font-black text-slate-400 uppercase tracking-wider block">
                    Esquadrões Inimigos & Sobrevivência:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {simResult.enemyCasualties.map((e) => {
                      const percentLeft = Math.round((e.survivingCount / (e.initialCount || 1)) * 100);
                      return (
                        <div
                          key={e.id}
                          className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800 space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-2xs font-mono font-bold">
                                T{e.tier}
                              </span>
                              {e.name}
                            </span>
                            <span className="font-mono text-2xs text-slate-300 font-bold shrink-0">
                              {e.survivingCount.toLocaleString('pt-BR')} / {e.initialCount.toLocaleString('pt-BR')}
                            </span>
                          </div>

                          {/* Survival Bar */}
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                percentLeft > 50
                                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                                  : percentLeft > 0
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${percentLeft}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-2xs text-slate-400 font-semibold">
                            <span>Baixas: <strong className="text-rose-400">-{e.lostCount.toLocaleString('pt-BR')} mortos</strong></span>
                            <span>Sobreviventes: <strong className="text-white">{percentLeft}%</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Full Step-by-Step Log Table */
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {simResult.rounds.map((r) => (
                <div
                  key={r.step}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    r.isEnemyAttacking
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                      : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-2xs text-white shrink-0">
                      {r.step}
                    </span>
                    <div className="min-w-0">
                      <span className="font-black block truncate">
                        {r.attackerName} ({r.attackerCount.toLocaleString('pt-BR')} un.) ➔ {r.defenderName}
                      </span>
                      <span className="text-2xs text-slate-400 block">
                        Causou <strong className="text-white font-mono">{r.damageDealt.toLocaleString('pt-BR')}</strong> de dano
                        {r.bonusText ? ` (${r.bonusText})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-rose-300 block">
                      -{r.casualties.toLocaleString('pt-BR')} baixas
                    </span>
                    <span className="text-2xs text-slate-400">
                      Sobram: {r.defenderRemainingCount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
        </div>
      )}
    </div>
  );
};
