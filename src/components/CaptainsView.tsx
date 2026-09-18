import React, { useState } from 'react';
import { DEFAULT_CAPTAINS } from '../data/captains';
import { PlayerProfile, Captain } from '../types';
import { Crown, Sparkles, UserCheck, Check, Shield, Search, Star } from 'lucide-react';

interface CaptainsViewProps {
  profile: PlayerProfile;
  captainLevels: Record<string, number>;
  onToggleHero: () => void;
  onUpdateHeroLevel: (level: number) => void;
  onUpdateHeroId: (id: 'garvel' | 'julia') => void;
  onToggleSelectCaptain: (captainId: string) => void;
  onSelectActiveCaptain: (captainId: string) => void;
  onUpdateCaptainLevel: (captainId: string, level: number) => void;
}

export const CaptainsView: React.FC<CaptainsViewProps> = ({
  profile,
  captainLevels,
  onToggleHero,
  onUpdateHeroLevel,
  onUpdateHeroId,
  onToggleSelectCaptain,
  onSelectActiveCaptain,
  onUpdateCaptainLevel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bonusFilter, setBonusFilter] = useState<'all' | 'monster' | 'crypt' | 'speed' | 'pvp'>('all');

  const selectedCaptainIds = profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad'];
  const heroId = profile.heroId || 'garvel';
  const heroLevel = profile.heroLevel || 16;
  const includeHero = profile.includeHero ?? true;

  const filteredCaptains = DEFAULT_CAPTAINS.filter((captain) => {
    const matchesSearch =
      captain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      captain.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (captain.description && captain.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBonus =
      bonusFilter === 'all' ||
      (bonusFilter === 'monster' && (captain.specialty === 'monsters' || captain.id === 'brunhild' || captain.id === 'farhad')) ||
      (bonusFilter === 'crypt' && (captain.specialty === 'crypts' || captain.id === 'carter')) ||
      (bonusFilter === 'speed' && (captain.specialty === 'speed' || captain.id === 'aydae')) ||
      (bonusFilter === 'pvp' && (captain.specialty === 'pvp' || (!['monsters', 'crypts', 'speed'].includes(captain.specialty))));

    return matchesSearch && matchesBonus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Hero & Selected March Squad */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 flex-shrink-0">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Herói & Galeria de Capitães
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Selecione até 3 capitães para sua esquadra de ataque e gerencie seus níveis e estrelas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold bg-[#0b0f19] text-amber-300 border border-amber-500/40 shadow-inner">
              {selectedCaptainIds.length}/3 Capitães Escalados
            </span>
          </div>
        </div>

        {/* Hero Card & Active 3 Captain Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Hero Card */}
          <div
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              includeHero
                ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                : 'bg-[#0b0f19] border-slate-700/80 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/50">
                Herói Supremo
              </span>
              <button
                onClick={onToggleHero}
                className={`text-2xs font-black px-2 py-1 rounded-lg transition-colors ${
                  includeHero
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 border border-slate-600'
                }`}
              >
                {includeHero ? '✓ Na Marcha' : '+ Ativar'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png'}
                alt="Herói"
                className="w-16 h-16 rounded-xl object-cover border border-amber-400 shadow bg-slate-950"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <select
                    value={heroId}
                    onChange={(e) => onUpdateHeroId(e.target.value as 'garvel' | 'julia')}
                    className="bg-[#0b0f19] border border-amber-500/50 text-white text-xs font-bold rounded-lg px-2 py-0.5 outline-none"
                  >
                    <option value="garvel">Garvel</option>
                    <option value="julia">Julia</option>
                  </select>
                  <span className="text-xs font-mono font-bold text-amber-300">Nv {heroLevel}</span>
                </div>
                <p className="text-2xs font-semibold text-slate-400 mt-1">
                  +15.000 Liderança Base
                </p>
                <p className="text-2xs font-bold text-emerald-300">
                  +{(heroLevel * 2.5).toFixed(1)}% Ataque Geral
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-2xs">
              <span className="text-slate-400 font-semibold">Nível do Herói:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateHeroLevel(Math.max(1, heroLevel - 1))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-amber-300 px-1">{heroLevel}</span>
                <button
                  onClick={() => onUpdateHeroLevel(Math.min(50, heroLevel + 1))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Active 3 Captain Slots */}
          {selectedCaptainIds.map((cId, idx) => {
            const captain = DEFAULT_CAPTAINS.find((c) => c.id === cId);
            const level = captainLevels[cId] || captain?.level || 10;
            const isPrimary = idx === 0;

            if (!captain) return null;

            return (
              <div
                key={cId}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isPrimary
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                    : 'bg-[#0b0f19] border-slate-700/80 shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-2xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                      isPrimary
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                        : 'bg-slate-800 text-slate-300 border-slate-600'
                    }`}
                  >
                    {isPrimary ? '👑 Líder' : `Capitão #${idx + 1}`}
                  </span>

                  <button
                    onClick={() => onToggleSelectCaptain(cId)}
                    className="text-2xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                    title="Remover da Marcha"
                  >
                    Remover
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={`/assets/troops/${captain.id}.png`}
                    alt={captain.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow bg-slate-950"
                    onError={(e) => {
                      (e.target as any).src = '/assets/troops/alexander.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{captain.name}</h4>
                    <p className="text-2xs font-semibold text-slate-400 truncate">{captain.description}</p>
                    <p className="text-2xs font-bold text-emerald-300 mt-1">
                      +{((captain.monsterAttackBonusPercent || 20) + (level - 1) * 1.2).toFixed(1)}% Bônus de Ataque
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-2xs">
                  <span className="text-slate-400 font-semibold">Nível {level}:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateCaptainLevel(cId, Math.max(1, level - 5))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => onUpdateCaptainLevel(cId, Math.max(1, level - 1))}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                    >
                      -1
                    </button>
                    <span className="font-mono font-bold text-amber-300 px-1">{level}</span>
                    <button
                      onClick={() => onUpdateCaptainLevel(cId, Math.min(500, level + 1))}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onUpdateCaptainLevel(cId, Math.min(500, level + 5))}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-bold"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty Captain Slots (if fewer than 3) */}
          {Array.from({ length: Math.max(0, 3 - selectedCaptainIds.length) }).map((_, idx) => (
            <div
              key={`empty-slot-${idx}`}
              className="p-5 rounded-2xl border-2 border-dashed border-slate-700/70 bg-[#0b0f19]/60 flex flex-col items-center justify-center text-center gap-2 min-h-[180px]"
            >
              <UserCheck className="w-8 h-8 text-slate-500" />
              <span className="text-xs font-bold text-slate-300">
                Vaga #{selectedCaptainIds.length + idx + 1} Disponível
              </span>
              <span className="text-2xs text-slate-400">
                Selecione um capitão na lista abaixo para ocupar este slot
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Roster of all 29 Captains */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">
              Galeria Completa de Todos os 29 Capitães
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#0b0f19] border border-slate-700 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'monster', label: '🦁 Monstros' },
                { id: 'crypt', label: '🗺️ Criptas' },
                { id: 'speed', label: '⚡ Velocidade' },
                { id: 'pvp', label: '⚔️ PvP/Guerra' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setBonusFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    bonusFilter === pill.id
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar capitão..."
                className="w-full bg-[#0b0f19] border border-slate-700 focus:border-amber-400 pl-9 pr-3 py-1.5 text-xs text-white rounded-xl outline-none font-bold placeholder-slate-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Captain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCaptains.map((captain) => {
            const isSelected = selectedCaptainIds.includes(captain.id);
            const isLeader = selectedCaptainIds[0] === captain.id;
            const level = captainLevels[captain.id] || captain.level || 10;

            return (
              <div
                key={captain.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xl ${
                  isLeader
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-400 ring-2 ring-amber-400/40'
                    : isSelected
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-[#0b0f19] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={`/assets/troops/${captain.id}.png`}
                      alt={captain.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow bg-slate-950"
                      onError={(e) => {
                        (e.target as any).src = '/assets/troops/alexander.png';
                      }}
                    />
                    {isLeader && (
                      <span className="absolute -top-1.5 -left-1.5 bg-amber-400 text-slate-950 text-2xs font-black px-1.5 py-0.5 rounded-full shadow">
                        👑
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{captain.name}</h4>
                    <p className="text-2xs font-semibold text-slate-400 truncate">{captain.description}</p>

                    <div className="flex items-center gap-1 mt-1 text-2xs font-bold text-slate-300">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{captain.stars || 3}★</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-300 font-mono font-bold">Nv {level}</span>
                    </div>
                  </div>
                </div>

                {captain.description && (
                  <p className="text-2xs font-semibold text-slate-300 bg-[#0b0f19] border border-slate-800 p-2 rounded-xl">
                    {captain.description}
                  </p>
                )}

                {/* Level Controls & March Select Button */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-slate-400 font-semibold">Ajustar Nível:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateCaptainLevel(captain.id, Math.max(1, level - 1))}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded font-bold"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={level}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateCaptainLevel(captain.id, isNaN(val) ? 1 : val);
                        }}
                        className="w-12 bg-[#0b0f19] border border-slate-700 text-amber-300 text-center font-mono font-bold rounded-lg text-xs py-0.5 outline-none"
                      />
                      <button
                        onClick={() => onUpdateCaptainLevel(captain.id, Math.min(500, level + 1))}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded font-bold"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onSelectActiveCaptain(captain.id)}
                      className={`py-1.5 px-2 rounded-xl text-2xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isLeader
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white'
                      }`}
                    >
                      {isLeader ? '👑 Líder' : 'Tornar Líder'}
                    </button>

                    <button
                      onClick={() => onToggleSelectCaptain(captain.id)}
                      className={`py-1.5 px-2 rounded-xl text-2xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-[#0b0f19] hover:bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ Na Equipe' : '+ Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
