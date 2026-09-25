import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { Building2, Users, GraduationCap, ChevronDown, ChevronUp, RotateCcw, Shield, Flame, Crown } from 'lucide-react';

interface ProfileConfigProps {
  profile: PlayerProfile;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onResetDefaults: () => void;
  onLoadDemoTroops?: () => void;
  onClearTroops?: () => void;
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
  onResetDefaults,
  onLoadDemoTroops,
  onClearTroops,
}) => {
  const [showAcademy, setShowAcademy] = useState(false);

  const displayName = profile.playerName || profile.heroName || 'Comandante';

  return (
    <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300 shadow-md">
            <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              Configurações do Jogador ({displayName})
            </h2>
            <p className="text-xs font-semibold text-slate-400">Identificação, Herói principal e níveis da Cidade</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onLoadDemoTroops && (
            <button
              onClick={onLoadDemoTroops}
              title="Carregar preset de exército para testes rápidos"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Exército Demo
            </button>
          )}
          {onClearTroops && (
            <button
              onClick={() => {
                if (confirm('Deseja zerar a contagem de todas as tropas deste perfil?')) {
                  onClearTroops();
                }
              }}
              title="Zerar todas as tropas deste jogador"
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-rose-100 text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              Zerar Tropas
            </button>
          )}
        </div>
      </div>

      {/* Identificação do Jogador (Nickname, Reino, Clã) */}
      <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-700 space-y-3 shadow-inner">
        <span className="text-2xs font-black text-amber-300 uppercase tracking-wider block">
          ♦ Identificação do Jogador & Reino ♦
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Nome / Nickname do Jogador:</label>
            <input
              type="text"
              value={profile.playerName || profile.heroName || ''}
              onChange={(e) => onUpdateProfile({ playerName: e.target.value, heroName: e.target.value })}
              placeholder="Ex: Comandante"
              className="w-full bg-[#111827] border border-slate-600 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-semibold outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Reino (ex: K:310):</label>
            <input
              type="text"
              value={profile.kingdom || 'K:310'}
              onChange={(e) => onUpdateProfile({ kingdom: e.target.value })}
              placeholder="K:310"
              className="w-full bg-[#111827] border border-slate-600 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-semibold outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Tag do Clã (Opcional):</label>
            <input
              type="text"
              value={profile.clanTag || ''}
              onChange={(e) => onUpdateProfile({ clanTag: e.target.value })}
              placeholder="Ex: WAR"
              className="w-full bg-[#111827] border border-slate-600 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-semibold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hero Selection (Garvel vs Julia) */}
      <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-700 space-y-3 shadow-inner">
        <span className="text-2xs font-black text-amber-300 uppercase tracking-wider block">
          ♦ Escolha do Herói Principal ♦
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Garvel */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'garvel' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              (profile.heroId || 'garvel') === 'garvel'
                ? 'bg-gradient-to-r from-red-950/60 to-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#111827] border-slate-700 opacity-75 hover:opacity-100 hover:border-slate-500'
            }`}
          >
            <div className="w-14 h-14 rounded-xl border border-amber-400/80 bg-slate-950 overflow-hidden flex-shrink-0 shadow-md">
              <img src="/assets/troops/garvel.png" alt="Garvel" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Garvel</span>
                {(profile.heroId || 'garvel') === 'garvel' && (
                  <span className="text-2xs bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md shadow">Ativo</span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Herói Guerreiro (Corpo a Corpo)</p>
            </div>
          </div>

          {/* Julia */}
          <div
            onClick={() => onUpdateProfile({ heroId: 'julia' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              profile.heroId === 'julia'
                ? 'bg-gradient-to-r from-red-950/60 to-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#111827] border-slate-700 opacity-75 hover:opacity-100 hover:border-slate-500'
            }`}
          >
            <div className="w-14 h-14 rounded-xl border border-amber-400/80 bg-slate-950 overflow-hidden flex-shrink-0 shadow-md">
              <img src="/assets/troops/julia.png" alt="Julia" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Julia</span>
                {profile.heroId === 'julia' && (
                  <span className="text-2xs bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md shadow">Ativa</span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Heroína Comandante Imperial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="space-y-1.5 bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700 shadow-inner">
          <label className="text-amber-300 font-black flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" /> Herói Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.heroLevel || 16}
            onChange={(e) => onUpdateProfile({ heroLevel: Number(e.target.value) })}
            className="w-full bg-[#111827] border border-amber-500/50 rounded-lg px-2 py-1.5 text-amber-300 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5 bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700 shadow-inner">
          <label className="text-amber-300 font-black flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" /> Dragão Nível:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={profile.dragonLevel || 15}
            onChange={(e) => onUpdateProfile({ dragonLevel: Number(e.target.value) })}
            className="w-full bg-[#111827] border border-amber-500/50 rounded-lg px-2 py-1.5 text-amber-300 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5 bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700 shadow-inner">
          <label className="text-amber-300 font-black flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-sky-400" /> Capitólio Nv:
          </label>
          <input
            type="number"
            min="1"
            max="40"
            value={profile.capitolLevel || 16}
            onChange={(e) => onUpdateProfile({ capitolLevel: Number(e.target.value) })}
            className="w-full bg-[#111827] border border-amber-500/50 rounded-lg px-2 py-1.5 text-amber-300 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1.5 bg-[#0b0f19] p-3.5 rounded-xl border border-slate-700 shadow-inner">
          <label className="text-amber-300 font-black flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" /> Limite Marcha:
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={profile.maxMarchCapacity || 3125}
            onChange={(e) => onUpdateProfile({ maxMarchCapacity: Number(e.target.value) })}
            className="w-full bg-[#111827] border border-amber-500/50 rounded-lg px-2 py-1.5 text-amber-300 font-mono font-black text-center text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Academy Accordion */}
      <div className="border border-slate-700 rounded-xl overflow-hidden bg-[#0b0f19] shadow-inner">
        <button
          onClick={() => setShowAcademy(!showAcademy)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-black text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Bônus de Academia / Pesquisas Militares
          </span>
          {showAcademy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAcademy && (
          <div className="p-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1 bg-[#111827] p-3 rounded-xl border border-slate-700">
              <label className="text-slate-300 font-bold block">Ataque Guardas (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.guardsmenAttack || 25}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, guardsmenAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#0b0f19] border border-amber-500/50 rounded-lg px-2 py-1 text-amber-300 font-mono font-black text-center"
              />
            </div>

            <div className="space-y-1 bg-[#111827] p-3 rounded-xl border border-slate-700">
              <label className="text-slate-300 font-bold block">Saúde Guardas (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.guardsmenHealth || 25}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, guardsmenHealth: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#0b0f19] border border-amber-500/50 rounded-lg px-2 py-1 text-amber-300 font-mono font-black text-center"
              />
            </div>

            <div className="space-y-1 bg-[#111827] p-3 rounded-xl border border-slate-700">
              <label className="text-slate-300 font-bold block">Ataque Monstros (%):</label>
              <input
                type="number"
                value={profile.academyBonus?.monstersAttack || 20}
                onChange={(e) =>
                  onUpdateProfile({
                    academyBonus: { ...profile.academyBonus, monstersAttack: Number(e.target.value) },
                  })
                }
                className="w-full bg-[#0b0f19] border border-amber-500/50 rounded-lg px-2 py-1 text-amber-300 font-mono font-black text-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
