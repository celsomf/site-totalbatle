import { useEffect, useState } from 'react';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { useGameCatalog } from './context/GameCatalogContext';
import { Header } from './components/Header';
import { BarracksView } from './components/BarracksView';
import { CaptainsView } from './components/CaptainsView';
import { MonsterSelector } from './components/MonsterSelector';
import { MarchBookView } from './components/MarchBookView';
import { CryptOptimizer } from './components/CryptOptimizer';
import { TroopEncyclopedia } from './components/TroopEncyclopedia';
import { DEFAULT_CAPTAINS } from './data/captains';
import { MonsterTarget, Captain } from './types';
import { BookOpen, Shield, Crown, Compass, Library, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ProfileConfig } from './components/ProfileConfig';
import { buildMonsterTargetFromTemplate } from './domain/monsterTargets';

export function App() {
  const { loading: catalogLoading, error: catalogError, templates: monsterTemplates, refresh: refreshCatalog } = useGameCatalog();
  const {
    profile,
    activeProfileId,
    availableProfiles,
    dbStatus,
    switchProfile,
    createNewProfile,
    deleteProfile,
    updateProfile,
    updateCaptainLevel,
    updateCaptainStars,
    toggleSelectCaptain,
    selectActiveCaptain,
    toggleTroopUnlocked,
    updateTroopOwnedCount,
    updateTroopCustomStat,
    getHydratedTroops,
    addCustomTroop,
    removeCustomTroop,
    loadDemoTroops,
    clearAllTroops,
    resetToDefaults,
    reconnectDb,
  } = usePlayerProfile();

  const [activeTab, setActiveTab] = useState<'march_book' | 'barracks' | 'captains' | 'crypts' | 'encyclopedia'>('march_book');
  const [selectedMonster, setSelectedMonster] = useState<MonsterTarget | null>(null);
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!selectedMonster && monsterTemplates.length > 0) {
      const firstTemplate = monsterTemplates[0];
      setSelectedMonster(buildMonsterTargetFromTemplate(firstTemplate, firstTemplate.defaultLevel));
    }
  }, [monsterTemplates, selectedMonster]);

  const hydratedTroops = getHydratedTroops();
  const selectedCaptains = (profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad'])
    .map((id) => DEFAULT_CAPTAINS.find((c) => c.id === id))
    .filter(Boolean) as Captain[];
  const selectedCaptain = selectedCaptains[0] || DEFAULT_CAPTAINS[0];

  if (catalogLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-lg text-center space-y-3">
          <div className="text-3xl">⚔️</div>
          <h1 className="text-xl font-black">Conectando ao catálogo do Total Battle</h1>
          <p className="text-sm text-slate-400">Tropas, monstros e formações são carregados do banco de dados.</p>
        </div>
      </main>
    );
  }

  if (catalogError || monsterTemplates.length === 0 || !selectedMonster) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-xl text-center space-y-4 rounded-2xl border border-rose-500/40 bg-slate-900 p-6">
          <div className="text-3xl">🛡️</div>
          <h1 className="text-xl font-black">O catálogo do banco não está disponível</h1>
          <p className="text-sm text-slate-300">{catalogError || 'O catálogo ainda não foi carregado.'}</p>
          <p className="text-xs text-slate-400">A aplicação não vai usar uma cópia local dos dados. Verifique a API e o banco e tente novamente.</p>
          <button onClick={() => void refreshCatalog()} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const displayName = profile.playerName || profile.heroName || 'Comandante';
  const displayClan = profile.clanTag ? `[${profile.clanTag.replace(/^\[|\]$/g, '')}] ` : '';
  const displayKingdom = profile.kingdom || 'K:310';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Header
        profile={profile}
        activeProfileId={activeProfileId}
        availableProfiles={availableProfiles}
        onSwitchProfile={switchProfile}
        onCreateProfile={createNewProfile}
        onDeleteProfile={deleteProfile}
        dbStatus={dbStatus}
        onReconnectDb={reconnectDb}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#111827]/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('march_book')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'march_book'
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-lg shadow-red-950/60 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Livro de Marcha</span>
            </button>

            <button
              onClick={() => setActiveTab('barracks')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'barracks'
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-lg shadow-red-950/60 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Quartel & Tropas</span>
            </button>

            <button
              onClick={() => setActiveTab('captains')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'captains'
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-lg shadow-red-950/60 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Herói & Capitães</span>
            </button>

            <button
              onClick={() => setActiveTab('crypts')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'crypts'
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-lg shadow-red-950/60 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Criptas</span>
            </button>

            <button
              onClick={() => setActiveTab('encyclopedia')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'encyclopedia'
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-lg shadow-red-950/60 ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <Library className="w-4 h-4 text-amber-300" />
              <span>Enciclopédia</span>
            </button>
          </div>

          {/* Quick Config Button & Account Status */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              title="Configurações de Liderança e Bônus de Academia"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Bônus & Pesquisa</span>
            </button>

            <div className="text-xs text-slate-300 font-bold items-center gap-1.5 px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-700 hidden sm:flex shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{displayClan}{displayName} ({displayKingdom})</span>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Profile & Academy Config Drawer */}
        {showProfileModal && (
          <div className="bg-[#111827] border-2 border-amber-500/70 rounded-2xl p-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                Configurações da Conta & Bônus de Pesquisa
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-300 hover:text-white font-bold text-xs px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-600"
              >
                ✕ Fechar
              </button>
            </div>
            <ProfileConfig
              profile={profile}
              onUpdateProfile={updateProfile}
              onResetDefaults={resetToDefaults}
              onLoadDemoTroops={loadDemoTroops}
              onClearTroops={clearAllTroops}
            />
          </div>
        )}

        {/* Tab 1: Livro de Marcha (Oficial) */}
        {activeTab === 'march_book' && (
          <div className="space-y-6">
            <section className="flex flex-col gap-3 rounded-2xl border border-slate-700/80 bg-[#111827] p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="text-2xs font-black uppercase tracking-wider text-slate-400">Alvo atual</span>
                <h2 className="truncate text-base font-black text-white sm:text-lg">{selectedMonster.name}</h2>
                <p className={`mt-1 text-xs font-bold ${selectedMonster.enemySquads?.some((squad) => squad.count > 0) ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {selectedMonster.enemySquads?.some((squad) => squad.count > 0)
                    ? `${selectedMonster.enemySquads.filter((squad) => squad.count > 0).length} tipos de tropas inimigas cadastrados • Nível ${selectedMonster.level}`
                    : `Tropas inimigas não cadastradas • Nível ${selectedMonster.level}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(profile.activeMarches?.length || 0) > 0 && (
                  <a
                    href="#active-marches"
                    className="rounded-xl border border-sky-500/50 bg-sky-950/70 px-3.5 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-900"
                  >
                    Em ataque: {profile.activeMarches?.length}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowTargetSelector((isOpen) => !isOpen)}
                  aria-expanded={showTargetSelector}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-black shadow transition ${
                    !selectedMonster.enemySquads?.some((squad) => squad.count > 0)
                      ? 'border-amber-300 bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  {showTargetSelector
                    ? 'Fechar seleção'
                    : selectedMonster.enemySquads?.some((squad) => squad.count > 0)
                      ? 'Trocar alvo'
                      : 'Cadastrar tropas do alvo'}
                </button>
              </div>
            </section>

            {showTargetSelector && (
              <div id="target-selector-panel" className="space-y-3">
                <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">Escolha do alvo e tropas inimigas</h3>
                    <p className="text-xs text-slate-400">Ajustes desta área ficam fechados enquanto você monta a marcha.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTargetSelector(false)}
                    className="self-start rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:self-auto"
                  >
                    Concluir
                  </button>
                </div>
                <MonsterSelector
                  selectedMonster={selectedMonster}
                  onSelectMonster={setSelectedMonster}
                  troops={hydratedTroops}
                  profile={profile}
                  captain={DEFAULT_CAPTAINS.find((c) => c.id === (profile.selectedCaptainId || profile.selectedCaptainIds?.[0] || 'farhad')) || DEFAULT_CAPTAINS[0]}
                />
              </div>
            )}

            <MarchBookView
              profile={profile}
              troops={hydratedTroops}
              captains={DEFAULT_CAPTAINS}
              selectedCaptainId={profile.selectedCaptainId || profile.selectedCaptainIds?.[0] || 'farhad'}
              onSelectCaptain={(id) => {
                selectActiveCaptain(id);
              }}
              targetMonster={selectedMonster}
              onUpdateMonsterTarget={setSelectedMonster}
              onUpdateProfile={updateProfile}
            />
          </div>
        )}

        {/* Tab 2: Quartel & Tropas em Estoque */}
        {activeTab === 'barracks' && (
          <BarracksView
            troops={hydratedTroops}
            profile={profile}
            onToggleUnlocked={toggleTroopUnlocked}
            onUpdateOwnedCount={updateTroopOwnedCount}
            onUpdateCustomStat={updateTroopCustomStat}
            onAddTroop={addCustomTroop}
            onRemoveCustomTroop={removeCustomTroop}
            onResetDefaults={resetToDefaults}
          />
        )}

        {/* Tab 3: Herói & Capitães */}
        {activeTab === 'captains' && (
          <CaptainsView
            profile={profile}
            captainLevels={profile.captainLevels}
            captainStars={profile.captainStars}
            onToggleHero={() => updateProfile({ includeHero: !profile.includeHero })}
            onUpdateHeroLevel={(level) => updateProfile({ heroLevel: level })}
            onUpdateHeroId={(id) => updateProfile({ heroId: id })}
            onToggleSelectCaptain={toggleSelectCaptain}
            onSelectActiveCaptain={selectActiveCaptain}
            onUpdateCaptainLevel={updateCaptainLevel}
            onUpdateCaptainStars={updateCaptainStars}
          />
        )}

        {/* Tab 4: Explorador de Criptas */}
        {activeTab === 'crypts' && (
          <CryptOptimizer
            profile={profile}
            troops={hydratedTroops}
            captain={selectedCaptain}
          />
        )}

        {/* Tab 5: Enciclopédia & Fraquezas */}
        {activeTab === 'encyclopedia' && (
          <TroopEncyclopedia
            troops={hydratedTroops}
            profile={profile}
            onUpdateOwnedCount={updateTroopOwnedCount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0a0e17] py-4 text-center text-xs text-slate-500 font-medium">
        Total Battle Combat Advisor • Otimização Tática de Marchas • Sincronizado com PostgreSQL 17
      </footer>
    </div>
  );
}

export default App;
