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
    <div className="bg-[#1c120a] border-2 border-[#5a3e22] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5a3e22] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#3d2917] border border-[#caa568] shadow">
            <Crown className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-yellow-300 tracking-wide">
              Cidade & Escolha do Herói ({profile.heroName || 'Araning'})
            </h2>
            <p className="text-xs font-bold text-amber-200/90">Escolha seu Herói inicial (Garvel ou Julia) e níveis da cidade</p>
          </div>
        </div>
        <button
          onClick={onResetDefaults}
          title="Restaurar exército padrão da imagem"
          className="tb-btn-gold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow font-black"
        >
          <RotateCcw className="w-4 h-4" /> Restaurar Estoque
        </button>
      </div>

      {/* Hero Selection (Garvel vs Julia) */}
      <div className="bg-[#120a06] p-3.5 rounded-xl border-2 border-[#5a3e22] space-y-2.5 shadow">
        <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
          ♦ Escolha do Herói Principal ♦
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Garvel */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'garvel' })}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
              (profile.heroId || 'garvel') === 'garvel'
                ? 'bg-gradient-to-r from-[#4a1818] to-[#290a0a] border-yellow-400 shadow-lg ring-2 ring-yellow-400/80'
                : 'bg-[#180f0a] border-[#5a3e22] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-13 h-13 rounded-lg border-2 border-[#caa568] bg-[#3a2214] overflow-hidden flex-shrink-0 shadow">
              <img src="/assets/troops/garvel.png" alt="Garvel" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-yellow-200">Garvel</span>
                {(profile.heroId || 'garvel') === 'garvel' && (
                  <span className="text-xs bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded shadow">Ativo</span>
                )}
              </div>
              <p className="text-xs font-bold text-amber-200/90">Herói Guerreiro (Padrão Araning)</p>
            </div>
          </div>

          {/* Julia */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'julia' })}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
              profile.heroId === 'julia'
                ? 'bg-gradient-to-r from-[#4a1818] to-[#290a0a] border-yellow-400 shadow-lg ring-2 ring-yellow-400/80'
                : 'bg-[#180f0a] border-[#5a3e22] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-13 h-13 rounded-lg border-2 border-[#caa568] bg-[#3a2214] overflow-hidden flex-shrink-0 shadow">
              <img src="/assets/troops/julia.png" alt="Julia" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-yellow-200">Julia</span>
                {profile.heroId === 'julia' && (
                  <span className="text-xs bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded shadow">Ativa</span>
                )}
              </div>
              <p className="text-xs font-bold text-amber-200/90">Heroína Comandante Imperial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="space-y-1 bg-[#120a06] p-3 rounded-xl border border-[#5a3e22] shadow">
          <label className="text-amber-300 font-extrabold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" /> Herói Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.heroLevel || 16}
            onChange={(e) => onUpdateProfile({ heroLevel: Number(e.target.value) })}
            className="w-full bg-[#080402] border-2 border-[#caa568] rounded-lg px-2 py-1.5 text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="space-y-1 bg-[#120a06] p-3 rounded-xl border border-[#5a3e22] shadow">
          <label className="text-amber-300 font-extrabold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-400" /> Dragão Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.dragonLevel || 15}
            onChange={(e) => onUpdateProfile({ dragonLevel: Number(e.target.value) })}
            className="w-full bg-[#080402] border-2 border-[#caa568] rounded-lg px-2 py-1.5 text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="space-y-1 bg-[#120a06] p-3 rounded-xl border border-[#5a3e22] shadow">
          <label className="text-amber-300 font-extrabold flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-yellow-400" /> Capitólio Nv:
          </label>
          <input
            type="number"
            min="1"
            max="40"
            value={profile.capitolLevel || 16}
            onChange={(e) => onUpdateProfile({ capitolLevel: Number(e.target.value) })}
            className="w-full bg-[#080402] border-2 border-[#caa568] rounded-lg px-2 py-1.5 text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="space-y-1 bg-[#120a06] p-3 rounded-xl border border-[#5a3e22] shadow">
          <label className="text-amber-300 font-extrabold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" /> Limite Marcha:
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={profile.maxMarchCapacity || 3125}
            onChange={(e) => onUpdateProfile({ maxMarchCapacity: Number(e.target.value) })}
            className="w-full bg-[#080402] border-2 border-[#caa568] rounded-lg px-2 py-1.5 text-yellow-300 font-black text-center text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Academy Accordion */}
      <div className="border border-[#5a3e22] rounded-xl overflow-hidden bg-[#120a06]">
        <button
          onClick={() => setShowAcademy(!showAcademy)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-black text-amber-200 hover:text-yellow-300 hover:bg-[#1a100a] transition-colors"
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-yellow-400" />
            Bônus de Academia / Pesquisas Militares
          </span>
          {showAcademy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAcademy && (
          <div className="p-4 border-t border-[#5a3e22] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1 bg-[#1c120a] p-2.5 rounded-lg border border-[#5a3e22]">
              <label className="text-amber-300 font-bold block">Ataque Guardas (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.guardsmenAttack || 25}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, guardsmenAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#080402] border border-[#caa568] rounded px-2 py-1 text-yellow-300 font-black text-center"
              />
            </div>

            <div className="space-y-1 bg-[#1c120a] p-2.5 rounded-lg border border-[#5a3e22]">
              <label className="text-amber-300 font-bold block">Saúde Guardas (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.guardsmenHealth || 25}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, guardsmenHealth: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#080402] border border-[#caa568] rounded px-2 py-1 text-yellow-300 font-black text-center"
              />
            </div>

            <div className="space-y-1 bg-[#1c120a] p-2.5 rounded-lg border border-[#5a3e22]">
              <label className="text-amber-300 font-bold block">Ataque Monstros (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.monstersAttack || 20}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, monstersAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#080402] border border-[#caa568] rounded px-2 py-1 text-yellow-300 font-black text-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
