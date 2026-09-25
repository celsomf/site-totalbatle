import { useState } from 'react';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { Header } from './components/Header';
import { BarracksView } from './components/BarracksView';
import { CaptainsView } from './components/CaptainsView';
import { MonsterSelector } from './components/MonsterSelector';
import { MarchBookView } from './components/MarchBookView';
import { CryptOptimizer } from './components/CryptOptimizer';
import { TroopEncyclopedia } from './components/TroopEncyclopedia';
import { DEFAULT_MONSTERS } from './data/monsters';
import { DEFAULT_CAPTAINS } from './data/captains';
import { MonsterTarget, Captain } from './types';
import { BookOpen, Shield, Crown, Compass, Library, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ProfileConfig } from './components/ProfileConfig';

export function App() {
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
  const [selectedMonster, setSelectedMonster] = useState<MonsterTarget>(DEFAULT_MONSTERS[0]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hydratedTroops = getHydratedTroops();
  const selectedCaptains = (profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad'])
    .map((id) => DEFAULT_CAPTAINS.find((c) => c.id === id))
    .filter(Boolean) as Captain[];
  const selectedCaptain = selectedCaptains[0] || DEFAULT_CAPTAINS[0];

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
            <MonsterSelector
              selectedMonster={selectedMonster}
              onSelectMonster={setSelectedMonster}
              troops={hydratedTroops}
              profile={profile}
              captain={DEFAULT_CAPTAINS.find((c) => c.id === (profile.selectedCaptainId || profile.selectedCaptainIds?.[0] || 'farhad')) || DEFAULT_CAPTAINS[0]}
            />

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
