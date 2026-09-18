import React, { useState } from 'react';
import { TroopUnit, PlayerProfile, TroopCategory, TroopClass } from '../types';
import { TroopAvatar } from './TroopAvatar';
import { TroopDetailModal } from './TroopDetailModal';
import { MONSTER_UNITS_CATALOG, MONSTER_PRESET_TEMPLATES, MonsterUnitDefinition } from '../data/monsters';
import {
  BookOpen,
  Filter,
  Sparkles,
  Swords,
  Heart,
  Crosshair,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Scale,
  ArrowRight,
  Skull,
  Shield,
  Crown,
} from 'lucide-react';

interface TroopEncyclopediaProps {
  troops: TroopUnit[];
  profile: PlayerProfile;
  onUpdateOwnedCount: (troopId: string, count: number) => void;
}

export const TroopEncyclopedia: React.FC<TroopEncyclopediaProps> = ({
  troops,
  profile,
  onUpdateOwnedCount,
}) => {
  const [mainView, setMainView] = useState<'troops' | 'monsters'>('troops');
  const [selectedCategory, setSelectedCategory] = useState<TroopCategory | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<TroopClass | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedTroopForDetail, setSelectedTroopForDetail] = useState<TroopUnit | null>(null);

  // Monster filters
  const [monsterFamily, setMonsterFamily] = useState<string>('all');

  // Target simulation state
  const [targetType, setTargetType] = useState<'mounted' | 'flying' | 'melee' | 'beasts' | 'fortifications' | 'monsters'>('beasts');

  // Filter troops
  const filteredTroops = troops.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedClass !== 'all' && t.troopClass !== selectedClass) return false;
    if (selectedTier !== 'all' && t.tier !== selectedTier) return false;
    return true;
  });

  // Filter monsters
  const filteredMonsters = MONSTER_UNITS_CATALOG.filter((m) => {
    if (monsterFamily !== 'all' && m.family !== monsterFamily) return false;
    return true;
  });

  // Calculate efficiency & score for the chosen target
  const getTacticalScore = (troop: TroopUnit) => {
    let score = troop.baseAttack;
    const aspects = troop.aspects || {};

    switch (targetType) {
      case 'mounted':
        if (aspects.bonusVsMountedPercent) score *= (1 + aspects.bonusVsMountedPercent / 100);
        break;
      case 'flying':
        if (aspects.bonusVsFlyingPercent) score *= (1 + aspects.bonusVsFlyingPercent / 100);
        break;
      case 'melee':
        if (aspects.bonusVsMeleePercent) score *= (1 + aspects.bonusVsMeleePercent / 100);
        break;
      case 'beasts':
        if (aspects.bonusVsBeastsPercent) score *= (1 + aspects.bonusVsBeastsPercent / 100);
        break;
      case 'fortifications':
        if (aspects.bonusVsFortificationsPercent) score *= (1 + aspects.bonusVsFortificationsPercent / 100);
        break;
      case 'monsters':
        if (troop.category === 'mercenary' || aspects.bonusVsBeastsPercent) {
          score *= 1.5;
        }
        break;
    }

    if (troop.category === 'guardsman') {
      score *= (1 + (profile.academyBonus?.guardsmenAttack || 111.5) / 100);
    }

    return Math.round(score / troop.leadershipCost);
  };

  const sortedByTacticalPower = [...troops]
    .filter((t) => t.category === 'guardsman')
    .sort((a, b) => getTacticalScore(b) - getTacticalScore(a))
    .slice(0, 5);

  return (
    <div className="space-y-6 font-serif animate-fadeIn">
      {/* Top View Switcher: Suas Tropas vs Bestiário de Monstros */}
      <div className="flex items-center gap-2 bg-[#1b110a] p-1.5 rounded-xl border-2 border-[#5a3e22] shadow-lg">
        <button
          onClick={() => setMainView('troops')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mainView === 'troops'
              ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-[#fef08a] border border-[#fef08a] shadow'
              : 'text-[#caa568]/80 hover:text-[#fef08a]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#fef08a]" />
          <span>Suas Tropas & Otimizador Tático</span>
        </button>

        <button
          onClick={() => setMainView('monsters')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mainView === 'monsters'
              ? 'bg-gradient-to-r from-red-800 to-red-950 text-[#fef08a] border border-red-400 shadow'
              : 'text-[#caa568]/80 hover:text-[#fef08a]'
          }`}
        >
          <Skull className="w-4 h-4 text-red-400" />
          <span>Bestiário Oficial de Monstros & Facções</span>
        </button>
      </div>

      {mainView === 'troops' ? (
        <>
          {/* Tactical Optimizer Card */}
          <div className="bg-[#241912] border-2 border-[#caa568] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#5a3e22] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-[#fef08a] shadow-md">
                  <Zap className="w-6 h-6 text-[#fef08a]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#fef08a] font-fantasy tracking-wider">
                    Otimizador de Combinações de Tropas
                  </h2>
                  <p className="text-xs text-[#caa568]">
                    Calcula a melhor unidade por ponto de liderança considerando os bônus ativos da sua conta
                  </p>
                </div>
              </div>

              {/* Target Selector */}
              <div className="flex items-center gap-2 bg-[#120a06] p-1.5 rounded-lg border border-[#5a3e22]">
                <span className="text-xs text-[#caa568] font-bold px-2">Alvo da Batalha:</span>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="bg-[#241912] text-xs font-bold text-[#fef08a] border border-[#caa568] rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="beasts">Feras (Beasts / Criptas)</option>
                  <option value="flying">Voadores (Dragões / Esquadrões)</option>
                  <option value="mounted">Unidades Montadas (Cavalaria)</option>
                  <option value="melee">Corpo a Corpo (Infantaria)</option>
                  <option value="fortifications">Fortificações (Muralhas)</option>
                  <option value="monsters">Monstros de Mapa</option>
                </select>
              </div>
            </div>

            {/* Top 5 Recommended Squads Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {sortedByTacticalPower.map((unit, index) => {
                const scorePerSlot = getTacticalScore(unit);
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedTroopForDetail(unit)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                      index === 0
                        ? 'bg-gradient-to-b from-[#4a2e15] to-[#201208] border-[#fef08a] shadow-lg ring-2 ring-[#fef08a]/50'
                        : 'bg-[#180f0a] border-[#5a3e22] hover:border-[#caa568]'
                    }`}
                  >
                    {index === 0 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Top 1 Recomendado
                      </span>
                    )}
                    <div className="flex justify-center mb-1 mt-1">
                      <TroopAvatar id={unit.avatarIcon || unit.id} tier={unit.tier} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-[#fef08a] truncate">{unit.name}</h4>
                    <div className="text-[10px] text-[#caa568] mt-1 space-y-0.5">
                      <div className="flex justify-between px-1">
                        <span>Efetividade/Slot:</span>
                        <strong className="text-emerald-400 font-bold">{scorePerSlot.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between px-1">
                        <span>Liderança:</span>
                        <strong className="text-[#fef08a]">{unit.leadershipCost}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Encyclopedia Catalog */}
          <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-2xl p-5 shadow-2xl space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#5a3e22] pb-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#fef08a]" />
                <h3 className="text-base font-black text-[#fef08a] font-fantasy tracking-wide">
                  Enciclopédia Completa de Tropas ({filteredTroops.length} Unidades)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-[#120a06] text-[#caa568] border border-[#5a3e22] rounded px-2.5 py-1 font-serif focus:outline-none"
                >
                  <option value="all">Todas Categorias</option>
                  <option value="guardsman">Guardas</option>
                  <option value="specialist">Especialistas</option>
                  <option value="monster">Monstros</option>
                  <option value="mercenary">Mercenários</option>
                </select>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as any)}
                  className="bg-[#120a06] text-[#caa568] border border-[#5a3e22] rounded px-2.5 py-1 font-serif focus:outline-none"
                >
                  <option value="all">Todas as Classes</option>
                  <option value="ranged">Longo Alcance</option>
                  <option value="melee">Corpo a Corpo</option>
                  <option value="mounted">Montadas</option>
                  <option value="flying">Voadores</option>
                  <option value="siege">Cerco</option>
                </select>

                <select
                  value={selectedTier === 'all' ? 'all' : String(selectedTier)}
                  onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-[#120a06] text-[#caa568] border border-[#5a3e22] rounded px-2.5 py-1 font-serif focus:outline-none"
                >
                  <option value="all">Todos os Tiers (I ao IX)</option>
                  <option value="1">Tier I</option>
                  <option value="2">Tier II</option>
                  <option value="3">Tier III</option>
                  <option value="4">Tier IV</option>
                  <option value="5">Tier V</option>
                  <option value="6">Tier VI</option>
                  <option value="7">Tier VII</option>
                  <option value="8">Tier VIII (P1)</option>
                  <option value="9">Tier IX (P2)</option>
                </select>
              </div>
            </div>

            {/* Grid of All Units in Encyclopedia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredTroops.map((unit) => {
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedTroopForDetail(unit)}
                    className="bg-[#180f0a] border-2 border-[#5a3e22] hover:border-[#caa568] rounded-xl p-3.5 transition-all cursor-pointer space-y-2.5 group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <TroopAvatar id={unit.avatarIcon || unit.id} tier={unit.tier} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#fef08a] truncate">{unit.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2c1a0e] text-[#caa568] border border-[#5a3e22]">
                            Tier {unit.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#caa568] mt-1">
                          <span className="text-amber-300 flex items-center gap-0.5">
                            <Swords className="w-3 h-3" /> {unit.baseAttack.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="text-red-300 flex items-center gap-0.5">
                            <Heart className="w-3 h-3" /> {unit.baseHealth.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {unit.aspects && (
                      <div className="bg-[#100a06] p-2 rounded-lg border border-[#3d2917] text-[10px] space-y-1 text-[#caa568]">
                        {unit.aspects.bonusVsFlyingPercent && (
                          <div className="flex justify-between">
                            <span>vs Voadores:</span>
                            <span className="text-emerald-400 font-bold">+{unit.aspects.bonusVsFlyingPercent}%</span>
                          </div>
                        )}
                        {unit.aspects.bonusVsMeleePercent && (
                          <div className="flex justify-between">
                            <span>vs Corpo a Corpo:</span>
                            <span className="text-emerald-400 font-bold">+{unit.aspects.bonusVsMeleePercent}%</span>
                          </div>
                        )}
                        {unit.aspects.bonusVsMountedPercent && (
                          <div className="flex justify-between">
                            <span>vs Montadas:</span>
                            <span className="text-emerald-400 font-bold">+{unit.aspects.bonusVsMountedPercent}%</span>
                          </div>
                        )}
                        {unit.aspects.bonusVsBeastsPercent && (
                          <div className="flex justify-between">
                            <span>vs Feras:</span>
                            <span className="text-emerald-400 font-bold">+{unit.aspects.bonusVsBeastsPercent}%</span>
                          </div>
                        )}
                        {unit.aspects.bonusVsFortificationsPercent && (
                          <div className="flex justify-between">
                            <span>vs Fortificações:</span>
                            <span className="text-emerald-400 font-bold">+{unit.aspects.bonusVsFortificationsPercent}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#caa568]/80 pt-1 border-t border-[#3d2917]">
                      <span>Estoque no quartel: <strong className="text-[#fef08a]">{unit.ownedCount}</strong></span>
                      <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Ficha Técnica <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Bestiário Oficial de Monstros */
        <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#5a3e22] pb-3">
            <div className="flex items-center gap-2.5">
              <Skull className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-base font-black text-[#fef08a] font-fantasy tracking-wide">
                  Bestiário & Unidades de Monstros ({filteredMonsters.length} Criaturas Catalogadas)
                </h3>
                <p className="text-xs text-[#caa568]/80">
                  Consulte atributos reais, liderança, iniciativa e aspectos táticos de cada monstro do mapa
                </p>
              </div>
            </div>

            {/* Faction Filter */}
            <select
              value={monsterFamily}
              onChange={(e) => setMonsterFamily(e.target.value)}
              className="bg-[#120a06] text-[#fef08a] border border-[#5a3e22] rounded px-3 py-1.5 font-serif text-xs font-bold focus:outline-none"
            >
              <option value="all">Todas as Facções</option>
              <option value="inferno">🔥 Demônios / Tropa do Inferno</option>
              <option value="cursed">🦇 Amaldiçoados / Feras</option>
              <option value="undead">💀 Mortos-Vivos</option>
              <option value="barbarian">🪓 Bárbaros & Salteadores</option>
              <option value="epic">👑 Monstros Épicos (Clã & Torneio)</option>
            </select>
          </div>

          {/* Grid of Monsters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1 font-sans">
            {filteredMonsters.map((m) => {
              const tierRoman = ['I', 'II', 'III', 'IV', 'V'][m.tier - 1] || `${m.tier}`;
              return (
                <div
                  key={m.id}
                  className="bg-[#180f0a] border-2 border-[#5a3e22] hover:border-red-500 rounded-xl p-3.5 transition-all space-y-2 shadow-md relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-900 text-amber-100 border border-amber-500 font-serif font-bold">
                        Tier {tierRoman}
                      </span>
                      <h4 className="text-xs font-black text-[#fef08a] font-serif">{m.name}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize bg-[#100a06] px-2 py-0.5 rounded border border-[#3d2917]">
                      {m.family}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic font-serif">{m.subType}</p>

                  <div className="grid grid-cols-2 gap-1.5 text-xs bg-[#100a06] p-2 rounded-lg border border-[#3d2917]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Força:</span>
                      <span className="font-extrabold text-amber-300">{m.unitAttack.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Saúde:</span>
                      <span className="font-extrabold text-red-400">{m.unitHealth.toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Liderança:</span>
                      <span className="font-bold text-[#fef08a]">{m.leadership}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Iniciativa:</span>
                      <span className="font-bold text-blue-300">{m.initiative}</span>
                    </div>
                  </div>

                  {m.aspects?.description && (
                    <div className="text-[10px] text-amber-200 bg-amber-950/40 p-1.5 rounded border border-amber-800/40">
                      ⚡ {m.aspects.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Detailed View */}
      {selectedTroopForDetail && (
        <TroopDetailModal
          troop={selectedTroopForDetail}
          profile={profile}
          onClose={() => setSelectedTroopForDetail(null)}
        />
      )}
    </div>
  );
};
