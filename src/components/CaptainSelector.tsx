import React, { useState } from 'react';
import { DEFAULT_CAPTAINS } from '../data/captains';
import { TroopAvatar } from './TroopAvatar';
import { Crown, Sparkles, UserCheck, Check, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface CaptainSelectorProps {
  heroId?: 'garvel' | 'julia';
  heroName?: string;
  selectedCaptainIds: string[];
  captainLevels: Record<string, number>;
  heroLevel: number;
  includeHero: boolean;
  onToggleHero: () => void;
  onToggleSelectCaptain: (captainId: string) => void;
  onUpdateCaptainLevel: (captainId: string, level: number) => void;
}

export const CaptainSelector: React.FC<CaptainSelectorProps> = ({
  heroId = 'garvel',
  heroName = 'Araning',
  selectedCaptainIds = ['brunhild', 'aydae', 'farhad'],
  captainLevels,
  heroLevel = 16,
  includeHero = true,
  onToggleHero,
  onToggleSelectCaptain,
  onUpdateCaptainLevel,
}) => {
  const [activeEditingId, setActiveEditingId] = useState<string>(
    selectedCaptainIds[0] || 'brunhild'
  );
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(true);

  const activeCaptains = selectedCaptainIds
    .map((id) => DEFAULT_CAPTAINS.find((c) => c.id === id))
    .filter(Boolean);

  const currentEditingCaptain =
    DEFAULT_CAPTAINS.find((c) => c.id === activeEditingId) ||
    activeCaptains[0] ||
    DEFAULT_CAPTAINS[0];

  const currentLevel =
    captainLevels[currentEditingCaptain.id] || currentEditingCaptain.level;

  const heroImage = heroId === 'julia' ? '/assets/troops/julia.png' : '/assets/troops/garvel.png';

  return (
    <div className="bg-[#1c120a] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568] shadow">
            <Crown className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-yellow-300 tracking-wide">
              Liderança da Marcha (1 Herói + 3 Capitães)
            </h2>
            <p className="text-xs font-bold text-amber-200/90">
              Selecione até 3 capitães para somar bônus de ataque e liderança
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg font-black bg-[#120a06] text-yellow-300 border border-[#caa568] shadow-inner">
            {selectedCaptainIds.length}/3 Capitães
          </span>
          <button
            onClick={() => setIsRosterOpen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#3d2917] hover:bg-[#4d3420] border border-[#caa568] text-yellow-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={isRosterOpen ? 'Ocultar catálogo de capitães' : 'Expandir catálogo de capitães'}
          >
            {isRosterOpen ? (
              <>
                <ChevronUp className="w-4 h-4 text-yellow-300" />
                <span className="hidden sm:inline">Recolher</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-yellow-300" />
                <span className="hidden sm:inline">Expandir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1 Hero + 3 Captain Slots */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Slot 0: Herói */}
        <div
          onClick={onToggleHero}
          className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
            includeHero
              ? 'bg-gradient-to-b from-[#4a1818] to-[#290a0a] border-yellow-400 shadow-lg ring-2 ring-yellow-400/70'
              : 'bg-[#120a06] border-[#5a3e22] opacity-60 hover:opacity-100'
          }`}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-lg border-2 border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden shadow">
              <img
                src={heroImage}
                alt={heroId === 'julia' ? 'Herói Julia' : 'Herói Garvel'}
                className="w-full h-full object-cover"
              />
            </div>
            {includeHero && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border border-emerald-300 shadow">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          <span className="font-extrabold text-xs text-yellow-200 block truncate w-full">
            {heroName || 'Araning'} ({heroId === 'julia' ? 'Julia' : 'Garvel'})
          </span>
          <span className="text-xs font-bold text-amber-300">Nv {heroLevel}</span>
        </div>

        {/* 3 Captain Slots */}
        {[0, 1, 2].map((slotIndex) => {
          const capId = selectedCaptainIds[slotIndex];
          const cap = capId ? DEFAULT_CAPTAINS.find((c) => c.id === capId) : null;
          const lvl = cap ? captainLevels[cap.id] || cap.level : null;
          const isEditing = cap && cap.id === activeEditingId;

          if (!cap) {
            return (
              <div
                key={`empty-slot-${slotIndex}`}
                className="p-2.5 rounded-xl border-2 border-dashed border-[#5a3e22] bg-[#120a06]/60 text-center flex flex-col items-center justify-center gap-1 text-slate-400"
              >
                <div className="w-12 h-12 rounded-lg border border-[#5a3e22] flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-xs font-bold text-slate-400">Slot {slotIndex + 1}</span>
                <span className="text-xs font-medium text-slate-500">Vazio</span>
              </div>
            );
          }

          return (
            <div
              key={cap.id}
              onClick={() => {
                setActiveEditingId(cap.id);
              }}
              className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                isEditing
                  ? 'bg-gradient-to-b from-[#4a3018] to-[#29170a] border-yellow-400 shadow-lg ring-2 ring-yellow-400/80'
                  : 'bg-[#120a06] border-[#5a3e22] hover:border-[#caa568]'
              }`}
            >
              <div className="relative">
                <TroopAvatar id={cap.id} tier={lvl || cap.level} size="md" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelectCaptain(cap.id);
                  }}
                  className="absolute -top-1 -right-1 bg-emerald-600 hover:bg-red-700 text-white rounded-full p-0.5 border border-emerald-300 transition-colors shadow"
                  title="Clique para remover"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
              <span className="font-extrabold text-xs text-yellow-200 block truncate w-full">
                {cap.name}
              </span>
              <span className="text-xs font-bold text-amber-300">Nv {lvl}</span>
            </div>
          );
        })}
      </div>

      {/* Level Slider & Description for Current Selected Captain */}
      {currentEditingCaptain && (
        <div className="bg-[#120a06] p-4 rounded-xl border-2 border-[#5a3e22] space-y-2.5 shadow">
          <div className="flex justify-between text-xs sm:text-sm font-bold">
            <span className="text-amber-200">Ajustar Nível de {currentEditingCaptain.name}:</span>
            <span className="text-yellow-300 font-black">
              Nível {currentLevel} (+{Math.round(currentLevel * 1.2)}% Bônus)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={currentLevel}
            onChange={(e) => onUpdateCaptainLevel(currentEditingCaptain.id, Number(e.target.value))}
            className="w-full h-2.5 bg-[#080402] rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-amber-100">
            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span>{currentEditingCaptain.description}</span>
          </div>
        </div>
      )}

      {/* Collapsible Full Roster of 29 Official Captains (Acordeom) */}
      <div className="space-y-2.5">
        <button
          onClick={() => setIsRosterOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs sm:text-sm text-amber-200 border-b border-[#5a3e22] pb-1.5 hover:text-yellow-300 transition-colors font-bold"
        >
          <span className="flex items-center gap-2 font-black">
            {isRosterOpen ? <ChevronUp className="w-4 h-4 text-yellow-300" /> : <ChevronDown className="w-4 h-4 text-amber-300" />}
            {isRosterOpen ? 'Ocultar Elenco de Capitães' : 'Ver Todos os Capitães para Selecionar'}
          </span>
          <span className="text-xs font-bold text-slate-400">Total: {DEFAULT_CAPTAINS.length} capitães</span>
        </button>

        {isRosterOpen && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto pr-1 animate-fadeIn">
            {DEFAULT_CAPTAINS.map((c) => {
              const isSelected = selectedCaptainIds.includes(c.id);
              const lvl = captainLevels[c.id] || c.level;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onToggleSelectCaptain(c.id);
                    setActiveEditingId(c.id);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 shadow ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#4a3018] to-[#29170a] border-yellow-400 ring-2 ring-yellow-400'
                      : 'bg-[#120a06] border-[#5a3e22] hover:border-[#caa568] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="relative">
                    <TroopAvatar id={c.id} tier={lvl} size="sm" />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-xs text-yellow-200 block truncate w-full">
                    {c.name}
                  </span>
                  <span className="text-xs font-bold text-amber-300">Nv {lvl}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
