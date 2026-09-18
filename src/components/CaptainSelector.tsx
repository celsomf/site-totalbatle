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
    <div className="bg-[#241912] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#3d2917] border border-[#caa568]">
            <Crown className="w-5 h-5 text-[#fef08a]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wide">
              Liderança da Marcha (1 Herói + 3 Capitães)
            </h2>
            <p className="text-xs text-[#caa568]/80 font-serif">
              Selecione até 3 capitães para somar bônus de ataque e liderança
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded font-bold font-serif bg-[#180f0a] text-[#fef08a] border border-[#caa568] shadow-inner">
            {selectedCaptainIds.length}/3 Capitães
          </span>
          <button
            onClick={() => setIsRosterOpen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#3d2917] hover:bg-[#4d3420] border border-[#caa568] text-[#fef08a] transition-colors flex items-center gap-1 text-xs font-serif"
            title={isRosterOpen ? 'Ocultar catálogo de capitães' : 'Expandir catálogo de capitães'}
          >
            {isRosterOpen ? (
              <>
                <ChevronUp className="w-4 h-4 text-[#fef08a]" />
                <span className="hidden sm:inline">Recolher</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-[#fef08a]" />
                <span className="hidden sm:inline">Expandir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1 Hero + 3 Captains Active Slots (Exact Total Battle Layout) */}
      <div className="grid grid-cols-4 gap-2 font-serif">
        {/* Slot 0: Herói */}
        <div
          onClick={onToggleHero}
          className={`p-2 rounded-lg border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
            includeHero
              ? 'bg-gradient-to-b from-[#4a1818] to-[#290a0a] border-[#eab308] shadow-lg ring-2 ring-[#eab308]/60'
              : 'bg-[#180f0a] border-[#5a3e22] opacity-60 hover:opacity-100'
          }`}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-lg border border-[#caa568] bg-[#3a2214] flex items-center justify-center overflow-hidden">
              <img
                src={heroImage}
                alt={heroId === 'julia' ? 'Herói Julia' : 'Herói Garvel'}
                className="w-full h-full object-cover"
              />
            </div>
            {includeHero && (
              <span className="absolute -top-1 -right-1 bg-emerald-700 text-white rounded-full p-0.5 border border-emerald-300">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <span className="font-bold text-[11px] text-[#fef08a] block truncate w-full">
            {heroName || 'Araning'} ({heroId === 'julia' ? 'Julia' : 'Garvel'})
          </span>
          <span className="text-[10px] text-[#caa568]">Nv {heroLevel}</span>
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
                className="p-2 rounded-lg border-2 border-dashed border-[#5a3e22] bg-[#140e0a]/60 text-center flex flex-col items-center justify-center gap-1 text-[#caa568]/50"
              >
                <div className="w-11 h-11 rounded-lg border border-[#5a3e22]/50 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[#caa568]/40" />
                </div>
                <span className="text-[10px] font-bold">Slot {slotIndex + 1}</span>
                <span className="text-[9px]">Vazio</span>
              </div>
            );
          }

          return (
            <div
              key={cap.id}
              onClick={() => {
                setActiveEditingId(cap.id);
              }}
              className={`p-2 rounded-lg border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 relative ${
                isEditing
                  ? 'bg-gradient-to-b from-[#4a3018] to-[#29170a] border-[#caa568] shadow-lg ring-2 ring-[#fef08a]/80'
                  : 'bg-[#180f0a] border-[#5a3e22] hover:border-[#caa568]'
              }`}
            >
              <div className="relative">
                <TroopAvatar id={cap.id} tier={lvl || cap.level} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelectCaptain(cap.id);
                  }}
                  className="absolute -top-1 -right-1 bg-emerald-700 hover:bg-red-700 text-white rounded-full p-0.5 border border-emerald-300 transition-colors"
                  title="Clique para remover"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
              <span className="font-bold text-[11px] text-[#fef08a] block truncate w-full">
                {cap.name}
              </span>
              <span className="text-[10px] text-[#caa568]">Nv {lvl}</span>
            </div>
          );
        })}
      </div>

      {/* Level Slider & Description for Current Selected Captain */}
      {currentEditingCaptain && (
        <div className="bg-[#180f0a] p-3.5 rounded-lg border border-[#5a3e22] space-y-2 font-serif">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#caa568]">Ajustar Nível de {currentEditingCaptain.name}:</span>
            <span className="text-[#fef08a] font-black">
              Nível {currentLevel} (+{Math.round(currentLevel * 1.2)}% Bônus)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={currentLevel}
            onChange={(e) => onUpdateCaptainLevel(currentEditingCaptain.id, Number(e.target.value))}
            className="w-full h-2 bg-[#100a06] rounded-lg appearance-none cursor-pointer accent-[#caa568]"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-[#caa568]/90">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{currentEditingCaptain.description}</span>
          </div>
        </div>
      )}

      {/* Collapsible Full Roster of 29 Official Captains (Acordeom) */}
      <div className="space-y-2">
        <button
          onClick={() => setIsRosterOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs text-[#caa568] font-serif border-b border-[#5a3e22]/60 pb-1 hover:text-[#fef08a] transition-colors"
        >
          <span className="flex items-center gap-1.5 font-bold">
            {isRosterOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#fef08a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#caa568]" />}
            {isRosterOpen ? 'Ocultar Elenco de Capitães' : 'Ver Todos os Capitães para Selecionar'}
          </span>
          <span className="text-[10px] text-[#caa568]/70">Total: {DEFAULT_CAPTAINS.length} capitães</span>
        </button>

        {isRosterOpen && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 font-serif max-h-56 overflow-y-auto pr-1 animate-fadeIn">
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
                  className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#4a3018] to-[#29170a] border-[#caa568] ring-1 ring-[#fef08a]'
                      : 'bg-[#180f0a] border-[#5a3e22] hover:border-[#caa568]/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="relative">
                    <TroopAvatar id={c.id} tier={lvl} size="sm" />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 text-[8px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[10px] text-[#fef08a] block truncate w-full">
                    {c.name}
                  </span>
                  <span className="text-[9px] text-[#caa568] font-sans">Nv {lvl}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

