import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { Building2, Users, GraduationCap, ChevronDown, ChevronUp, RotateCcw, Shield, Flame, Crown } from 'lucide-react';

interface ProfileConfigProps {
  profile: PlayerProfile;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onResetDefaults: () => void;
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
  onResetDefaults,
}) => {
  const [showAcademy, setShowAcademy] = useState(false);

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
              Cidade & Escolha do Herói ({profile.heroName || 'Araning'})
            </h2>
            <p className="text-xs text-[#caa568]/80 font-serif">Escolha seu Herói inicial (Garvel ou Julia) e níveis</p>
          </div>
        </div>
        <button
          onClick={onResetDefaults}
          title="Restaurar exército padrão da imagem"
          className="tb-btn-gold text-[11px] px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restaurar Estoque
        </button>
      </div>

      {/* Hero Selection (Garvel vs Julia) */}
      <div className="bg-[#180f0a] p-3 rounded-lg border border-[#5a3e22] space-y-2">
        <span className="text-xs font-bold text-[#caa568] uppercase tracking-wider block font-serif">
          ♦ Escolha do Herói Principal ♦
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Garvel */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'garvel' })}
            className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
              (profile.heroId || 'garvel') === 'garvel'
                ? 'bg-gradient-to-r from-[#4a1818] to-[#290a0a] border-[#eab308] shadow-lg ring-1 ring-[#eab308]'
                : 'bg-[#100a06] border-[#5a3e22] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-lg border border-[#caa568] bg-[#3a2214] overflow-hidden flex-shrink-0">
              <img src="/assets/troops/garvel.png" alt="Garvel" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#fef08a]">Garvel</span>
                {(profile.heroId || 'garvel') === 'garvel' && (
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded">Ativo</span>
                )}
              </div>
              <p className="text-[11px] text-[#caa568]/80 font-serif">Herói Guerreiro (Padrão Araning)</p>
            </div>
          </div>

          {/* Julia */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'julia' })}
            className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
              profile.heroId === 'julia'
                ? 'bg-gradient-to-r from-[#4a1818] to-[#290a0a] border-[#eab308] shadow-lg ring-1 ring-[#eab308]'
                : 'bg-[#100a06] border-[#5a3e22] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-lg border border-[#caa568] bg-[#3a2214] overflow-hidden flex-shrink-0">
              <img src="/assets/troops/julia.png" alt="Julia" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#fef08a]">Julia</span>
                {profile.heroId === 'julia' && (
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded">Ativa</span>
                )}
              </div>
              <p className="text-[11px] text-[#caa568]/80 font-serif">Heroína Comandante Imperial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-serif">
        <div className="space-y-1 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <label className="text-[#caa568] font-bold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Herói Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.heroLevel || 16}
            onChange={(e) => onUpdateProfile({ heroLevel: Number(e.target.value) })}
            className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] text-center"
          />
        </div>

        <div className="space-y-1 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <label className="text-[#caa568] font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" /> Dragão Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.dragonLevel || 15}
            onChange={(e) => onUpdateProfile({ dragonLevel: Number(e.target.value) })}
            className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] text-center"
          />
        </div>

        <div className="space-y-1 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <label className="text-[#caa568] font-bold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-yellow-500" /> Capitólio:
          </label>
          <input
            type="number"
            min="1"
            max="45"
            value={profile.capitolLevel || 16}
            onChange={(e) => onUpdateProfile({ capitolLevel: Number(e.target.value) })}
            className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] text-center"
          />
        </div>

        <div className="space-y-1 bg-[#180f0a] p-2.5 rounded-lg border border-[#5a3e22]">
          <label className="text-[#caa568] font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Limite Exército:
          </label>
          <input
            type="number"
            step="100"
            min="100"
            max="500000"
            value={profile.maxMarchCapacity || 3125}
            onChange={(e) => onUpdateProfile({ maxMarchCapacity: Number(e.target.value) })}
            className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2 py-1 text-[#fef08a] font-bold focus:outline-none focus:border-[#caa568] text-center"
          />
        </div>
      </div>

      {/* Academy Bonuses Accordion */}
      <div className="border border-[#5a3e22] rounded-lg bg-[#180f0a] overflow-hidden">
        <button
          onClick={() => setShowAcademy(!showAcademy)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#caa568] hover:bg-[#20140d] transition-colors font-serif"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#fef08a]" />
            <span>Bônus de Academia / Pesquisa Militar (%)</span>
          </div>
          {showAcademy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAcademy && (
          <div className="p-3.5 border-t border-[#5a3e22] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-serif">
            <div>
              <label className="text-slate-400 block mb-1">Guardas Ataque (%):</label>
              <input
                type="number"
                value={profile.academyBonus.guardsmenAttack}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, guardsmenAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2.5 py-1.5 text-[#fef08a] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Especialistas Ataque (%):</label>
              <input
                type="number"
                value={profile.academyBonus.specialistsAttack}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, specialistsAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2.5 py-1.5 text-[#fef08a] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Monstros Ataque (%):</label>
              <input
                type="number"
                value={profile.academyBonus.monstersAttack}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, monstersAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#100a06] border border-[#5a3e22] rounded px-2.5 py-1.5 text-[#fef08a] font-bold"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
