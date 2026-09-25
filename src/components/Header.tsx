import React, { useState, useRef, useEffect } from 'react';
import { Swords, Shield, Award, Database, UserPlus, ChevronDown, Trash2, Check, User, Sparkles, X, RefreshCw } from 'lucide-react';
import { PlayerProfile, ProfileSummary } from '../types';

interface HeaderProps {
  profile: PlayerProfile;
  activeProfileId?: string;
  availableProfiles?: ProfileSummary[];
  onSwitchProfile?: (profileId: string) => void;
  onCreateProfile?: (name: string, kingdom?: string, clanTag?: string) => void;
  onDeleteProfile?: (profileId: string) => void;
  dbStatus?: 'connected' | 'offline' | 'checking';
  onReconnectDb?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeProfileId = 'main_profile',
  availableProfiles = [],
  onSwitchProfile,
  onCreateProfile,
  onDeleteProfile,
  dbStatus = 'checking',
  onReconnectDb,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerKingdom, setNewPlayerKingdom] = useState('K:310');
  const [newPlayerClan, setNewPlayerClan] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (onCreateProfile) {
      onCreateProfile(newPlayerName.trim(), newPlayerKingdom.trim() || 'K:310', newPlayerClan.trim());
    }
    setNewPlayerName('');
    setNewPlayerClan('');
    setShowNewPlayerModal(false);
    setDropdownOpen(false);
  };

  const displayName = profile.playerName || profile.heroName || 'Comandante';
  const displayClan = profile.clanTag ? `[${profile.clanTag.replace(/^\[|\]$/g, '')}] ` : '';
  const displayKingdom = profile.kingdom || 'K:310';
  const displayCapitol = profile.capitolLevel || 16;

  return (
    <>
      <header className="border-b border-slate-800/80 bg-[#0d1322]/95 backdrop-blur-md shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Game Title & Player Selector */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 ring-2 ring-black/40 flex-shrink-0">
              <Swords className="w-6 h-6 text-slate-950 drop-shadow" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  TOTAL BATTLE <span className="text-amber-400 font-extrabold text-xs sm:text-sm">COMMAND HUB</span>
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-400 hidden sm:block">
                Otimização de Marcha 2n+1 • Caça a Monstros & Épicos • Criptas 1-Hit KO
              </p>
            </div>

            {/* Profile Dropdown Selector Button */}
            <div className="relative ml-0 sm:ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#162035] hover:bg-[#1e2c47] border border-amber-400/40 hover:border-amber-400 text-white text-xs font-black shadow-lg transition-all"
                title="Alternar perfil do jogador"
              >
                <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="text-left">
                  <span className="text-amber-300 font-black">{displayClan}{displayName}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#0d1322] border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-2.5 py-1.5 text-2xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Perfis de Jogadores</span>
                    <span className="text-amber-400">{availableProfiles.length} cadastrado(s)</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 py-1 custom-scrollbar">
                    {availableProfiles.map((p) => {
                      const isActive = p.id === activeProfileId;
                      const pClan = p.clanTag ? `[${p.clanTag.replace(/^\[|\]$/g, '')}] ` : '';
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-500/20 to-slate-800 border border-amber-400/50 text-white font-black shadow'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer'
                          }`}
                        >
                          <div
                            className="flex-1 flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              if (onSwitchProfile) onSwitchProfile(p.id);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isActive ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {p.playerName?.charAt(0).toUpperCase() || 'J'}
                            </div>
                            <div className="truncate">
                              <p className="truncate font-bold">{pClan}{p.playerName}</p>
                              <p className="text-2xs text-slate-400 font-normal">
                                {p.kingdom || 'K:310'} • Capitólio Nv {p.capitolLevel || 16}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                            {availableProfiles.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Deseja realmente excluir o perfil do jogador '${p.playerName}'?`)) {
                                    if (onDeleteProfile) onDeleteProfile(p.id);
                                  }
                                }}
                                title="Excluir este perfil"
                                className="p-1 hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 pt-1.5">
                    <button
                      onClick={() => setShowNewPlayerModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Cadastrar Novo Jogador
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Stats & Database Status Badges */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* PostgreSQL Badge */}
            <button
              type="button"
              onClick={dbStatus === 'offline' && onReconnectDb ? onReconnectDb : undefined}
              disabled={dbStatus === 'checking'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs shadow-inner font-bold transition-all ${
                dbStatus === 'connected'
                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 shadow-emerald-950/50 cursor-default'
                  : dbStatus === 'checking'
                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-300 shadow-amber-950/50 cursor-wait'
                  : 'bg-rose-950/80 border-rose-600/60 text-rose-300 shadow-rose-950/50 hover:bg-rose-900/90 hover:border-rose-500 cursor-pointer active:scale-95'
              }`}
              title={
                dbStatus === 'connected'
                  ? 'Conectado e sincronizado com o PostgreSQL'
                  : dbStatus === 'checking'
                  ? 'Verificando conexão com o PostgreSQL...'
                  : 'Modo LocalStorage (Offline). Clique para tentar reconectar ao PostgreSQL'
              }
            >
              {dbStatus === 'checking' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>
                {dbStatus === 'connected'
                  ? 'PostgreSQL ● Online'
                  : dbStatus === 'checking'
                  ? 'Conectando...'
                  : 'LocalStorage (Offline)'}
              </span>
              {dbStatus === 'offline' && (
                <RefreshCw className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
              )}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 shadow-inner font-bold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Reino {displayKingdom}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 shadow-inner font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Capitólio Nv {displayCapitol}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modal: Cadastrar Novo Jogador */}
      {showNewPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Adicionar Novo Jogador</h3>
                  <p className="text-xs text-slate-400">Cria um painel isolado com tropas zeradas</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewPlayerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPlayer} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Nome / Nickname do Jogador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GuerreiroK310, LordVader, etc."
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-semibold outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-200 font-bold block">Reino (ex: K:310)</label>
                  <input
                    type="text"
                    placeholder="K:310"
                    value={newPlayerKingdom}
                    onChange={(e) => setNewPlayerKingdom(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-semibold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-200 font-bold block">Tag do Clã (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: WAR, IMP, etc."
                    value={newPlayerClan}
                    onChange={(e) => setNewPlayerClan(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  O perfil iniciará com tropas zeradas. Você poderá preencher o quartel na aba <strong>Tropas</strong> ou carregar o exército demo quando quiser.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlayerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all"
                >
                  Criar Jogador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

