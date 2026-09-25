import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MONSTER_UNITS_CATALOG, MonsterUnitDefinition } from '../data/monsters';
import { Search, X, ChevronDown, Check, Shield } from 'lucide-react';
import { TroopClass } from '../types';
import { TroopAvatar } from './TroopAvatar';

interface SearchableMonsterSelectProps {
  onSelect: (unitId: string) => void;
  selectedMonsterName?: string;
  placeholder?: string;
}

export const SearchableMonsterSelect: React.FC<SearchableMonsterSelectProps> = ({
  onSelect,
  selectedMonsterName,
  placeholder = '-- Selecionar Monstro por Classe / Nome --',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | TroopClass>('all');

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
    openUpwards: boolean;
  }>({
    left: 0,
    width: 380,
    maxHeight: 360,
    openUpwards: false,
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Comfortable width: matches trigger or at least 380px (up to 520px) without overflowing screen
    const desiredWidth = Math.min(520, Math.max(rect.width, Math.min(420, viewportWidth - 32)));

    let left = rect.left;
    if (left + desiredWidth > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - desiredWidth - 16);
    }
    if (left < 16) left = 16;

    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUpwards = spaceBelow < 300 && spaceAbove > spaceBelow;

    if (openUpwards) {
      setCoords({
        bottom: viewportHeight - rect.top + 6,
        left,
        width: desiredWidth,
        maxHeight: Math.min(380, Math.max(200, spaceAbove)),
        openUpwards: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width: desiredWidth,
        maxHeight: Math.min(380, Math.max(200, spaceBelow)),
        openUpwards: false,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    // Focus input shortly after opening
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Filter monsters based on search query and class filter
  const filteredMonsters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return MONSTER_UNITS_CATALOG.filter((monster) => {
      if (classFilter !== 'all' && monster.troopClass !== classFilter) {
        return false;
      }

      if (!query) return true;

      const nameMatch = monster.name.toLowerCase().includes(query);
      const subTypeMatch = monster.subType.toLowerCase().includes(query);
      const tierMatch =
        `tier ${monster.tier}`.includes(query) ||
        `t${monster.tier}`.includes(query) ||
        monster.tier.toString() === query;
      const classMatch =
        monster.troopClass.toLowerCase().includes(query) ||
        (monster.troopClass === 'ranged' && 'longo alcance'.includes(query)) ||
        (monster.troopClass === 'melee' && 'corpo a corpo'.includes(query)) ||
        (monster.troopClass === 'mounted' && 'montadas'.includes(query)) ||
        (monster.troopClass === 'flying' && 'voadores'.includes(query));

      return nameMatch || subTypeMatch || tierMatch || classMatch;
    });
  }, [searchTerm, classFilter]);

  const handleSelectMonster = (monster: MonsterUnitDefinition) => {
    onSelect(monster.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getClassIcon = (tc: TroopClass) => {
    switch (tc) {
      case 'ranged':
        return '🏹';
      case 'melee':
        return '⚔️';
      case 'mounted':
        return '🐎';
      case 'flying':
        return '🦅';
      default:
        return '🛡️';
    }
  };

  const getClassLabel = (tc: TroopClass) => {
    switch (tc) {
      case 'ranged':
        return 'Longo Alcance';
      case 'melee':
        return 'Corpo a Corpo';
      case 'mounted':
        return 'Montadas';
      case 'flying':
        return 'Voadores';
      default:
        return tc;
    }
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#111827] border ${
          isOpen ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-700 hover:border-slate-500'
        } rounded-lg px-2.5 py-1.5 text-xs text-left font-bold flex items-center justify-between gap-2 transition-all shadow-sm`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate text-slate-200">{placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Portal Dropdown Popover (Rendered on document.body so it NEVER gets clipped) */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 99999,
            }}
            className="bg-[#0f172a] border border-amber-500/40 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-3 space-y-2.5 animate-fadeIn flex flex-col backdrop-blur-md ring-1 ring-white/10"
          >
            {/* Header info / Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-amber-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do monstro (ex: Banshee, Magogue)..."
                className="w-full bg-[#1e293b] border border-slate-600 focus:border-amber-400 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 font-medium focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-700"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Class Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-3xs shrink-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setClassFilter('all')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap ${
                  classFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Todos ({MONSTER_UNITS_CATALOG.length})
              </button>
              <button
                type="button"
                onClick={() => setClassFilter('ranged')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  classFilter === 'ranged'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-blue-300 hover:bg-slate-700'
                }`}
              >
                <span>🏹</span> Longo Alcance
              </button>
              <button
                type="button"
                onClick={() => setClassFilter('melee')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  classFilter === 'melee'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                <span>⚔️</span> Corpo a Corpo
              </button>
              <button
                type="button"
                onClick={() => setClassFilter('mounted')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  classFilter === 'mounted'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <span>🐎</span> Montadas
              </button>
              <button
                type="button"
                onClick={() => setClassFilter('flying')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  classFilter === 'flying'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                }`}
              >
                <span>🦅</span> Voadores
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 custom-scrollbar">
              {filteredMonsters.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-slate-500 opacity-60" />
                  <p>Nenhum monstro encontrado para "{searchTerm}"</p>
                </div>
              ) : (
                filteredMonsters.map((monster) => {
                  const isSelected = selectedMonsterName?.toLowerCase() === monster.name.toLowerCase();

                  return (
                    <button
                      key={monster.id}
                      type="button"
                      onClick={() => handleSelectMonster(monster)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 group ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 hover:border-amber-400/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <TroopAvatar id={monster.id} size="sm" className="shrink-0 border-amber-500/30" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs">{getClassIcon(monster.troopClass)}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 text-3xs font-black border border-amber-500/40">
                              T{monster.tier}
                            </span>
                            <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                              {monster.name}
                            </span>
                            <span className="text-3xs text-slate-400 truncate">
                              ({monster.subType})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-3xs font-semibold text-slate-400 mt-1">
                            <span>
                              ⚔️ Atk: <strong className="text-amber-300 font-mono">{monster.unitAttack}</strong>
                            </span>
                            <span>
                              🩸 HP: <strong className="text-rose-400 font-mono">{monster.unitHealth}</strong>
                            </span>
                            <span className="text-slate-500">• {getClassLabel(monster.troopClass)}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="p-1 rounded-full bg-amber-500 text-slate-950 shrink-0 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
