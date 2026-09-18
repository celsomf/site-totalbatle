import { useState } from 'react';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { Header } from './components/Header';
import { ProfileConfig } from './components/ProfileConfig';
import { CaptainSelector } from './components/CaptainSelector';
import { TroopCustomizer } from './components/TroopCustomizer';
import { MonsterSelector } from './components/MonsterSelector';
import { MarchBookView } from './components/MarchBookView';
import { MarchResultCard } from './components/MarchResultCard';
import { CryptOptimizer } from './components/CryptOptimizer';
import { TroopEncyclopedia } from './components/TroopEncyclopedia';
import { DEFAULT_MONSTERS } from './data/monsters';
import { DEFAULT_CAPTAINS } from './data/captains';
import { allocateMarchSquads } from './engine/stacking';
import { MonsterTarget, Captain } from './types';
import { Swords, Compass, Sparkles, BookOpen, Shield, Library } from 'lucide-react';

export function App() {
  const {
    profile,
    dbStatus,
    updateProfile,
    updateCaptainLevel,
    toggleSelectCaptain,
    selectActiveCaptain,
    toggleTroopUnlocked,
    updateTroopOwnedCount,
    updateTroopCustomStat,
    getHydratedTroops,
    addCustomTroop,
    removeCustomTroop,
    resetToDefaults,
  } = usePlayerProfile();

  const [activeTab, setActiveTab] = useState<'march_book' | 'monsters' | 'crypts' | 'encyclopedia'>('march_book');
  const [selectedMonster, setSelectedMonster] = useState<MonsterTarget>(DEFAULT_MONSTERS[0]);

  const hydratedTroops = getHydratedTroops();
  const selectedCaptains = (profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad'])
    .map((id) => DEFAULT_CAPTAINS.find((c) => c.id === id))
    .filter(Boolean) as Captain[];
  const selectedCaptain = selectedCaptains[0] || DEFAULT_CAPTAINS[0];

  // Real-time calculation of recommended march taking troops from player's stock
  const marchRecommendation = allocateMarchSquads(
    profile,
    hydratedTroops,
    selectedCaptain,
    selectedMonster
  );

  return (
    <div className="min-h-screen text-[#f4ebd9] flex flex-col font-sans">
      <Header dbStatus={dbStatus} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs Styled like In-Game Ribbons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1d130c] p-2 rounded-xl border-2 border-[#5a3e22] shadow-2xl">
          <div className="flex flex-wrap w-full sm:w-auto gap-2">
            <button
              onClick={() => setActiveTab('march_book')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold font-serif transition-all ${
                activeTab === 'march_book'
                  ? 'bg-gradient-to-r from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] text-[#fef08a] border-2 border-[#f59e0b] shadow-lg shadow-red-950/60'
                  : 'text-[#caa568]/80 hover:text-[#fef08a] hover:bg-[#2a1a10] border border-[#5a3e22]/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#fef08a]" />
              <span>Livro de Marcha (Oficial)</span>
            </button>

            <button
              onClick={() => setActiveTab('monsters')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold font-serif transition-all ${
                activeTab === 'monsters'
                  ? 'bg-gradient-to-r from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] text-[#fef08a] border-2 border-[#f59e0b] shadow-lg shadow-red-950/60'
                  : 'text-[#caa568]/80 hover:text-[#fef08a] hover:bg-[#2a1a10] border border-[#5a3e22]/60'
              }`}
            >
              <Swords className="w-4 h-4 text-[#fef08a]" />
              <span>Calculadora de Combate</span>
            </button>

            <button
              onClick={() => setActiveTab('crypts')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold font-serif transition-all ${
                activeTab === 'crypts'
                  ? 'bg-gradient-to-r from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] text-[#fef08a] border-2 border-[#f59e0b] shadow-lg shadow-red-950/60'
                  : 'text-[#caa568]/80 hover:text-[#fef08a] hover:bg-[#2a1a10] border border-[#5a3e22]/60'
              }`}
            >
              <Compass className="w-4 h-4 text-[#fef08a]" />
              <span>Explorador de Criptas</span>
            </button>

            <button
              onClick={() => setActiveTab('encyclopedia')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold font-serif transition-all ${
                activeTab === 'encyclopedia'
                  ? 'bg-gradient-to-r from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] text-[#fef08a] border-2 border-[#f59e0b] shadow-lg shadow-red-950/60'
                  : 'text-[#caa568]/80 hover:text-[#fef08a] hover:bg-[#2a1a10] border border-[#5a3e22]/60'
              }`}
            >
              <Library className="w-4 h-4 text-[#fef08a]" />
              <span>Enciclopédia & Otimizador</span>
            </button>
          </div>

          <div className="text-xs text-[#caa568] flex items-center gap-1.5 px-3 py-1 bg-[#100a06] rounded-lg border border-[#5a3e22] font-serif hidden md:flex">
            <Sparkles className="w-3.5 h-3.5 text-[#fef08a]" />
            <span>Exército de Araning Carregado</span>
          </div>
        </div>

        {/* View Mode: Encyclopedia (Full Width) or Dashboard Grid */}
        {activeTab === 'encyclopedia' ? (
          <TroopEncyclopedia
            troops={hydratedTroops}
            profile={profile}
            onUpdateOwnedCount={updateTroopOwnedCount}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Player Army Configuration (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <ProfileConfig
                profile={profile}
                onUpdateProfile={updateProfile}
                onResetDefaults={resetToDefaults}
              />

              <CaptainSelector
                heroId={profile.heroId || 'garvel'}
                heroName={profile.heroName || 'Araning'}
                selectedCaptainIds={profile.selectedCaptainIds || ['brunhild', 'aydae', 'farhad']}
                captainLevels={profile.captainLevels}
                heroLevel={profile.heroLevel || 16}
                includeHero={profile.includeHero ?? true}
                onToggleHero={() => updateProfile({ includeHero: !profile.includeHero })}
                onToggleSelectCaptain={toggleSelectCaptain}
                onUpdateCaptainLevel={updateCaptainLevel}
              />

              <TroopCustomizer
                troops={hydratedTroops}
                profile={profile}
                onToggleUnlocked={toggleTroopUnlocked}
                onUpdateOwnedCount={updateTroopOwnedCount}
                onUpdateCustomStat={updateTroopCustomStat}
                onAddTroop={addCustomTroop}
                onRemoveCustomTroop={removeCustomTroop}
              />
            </div>

            {/* Right Column: Battle Target & Recommendation (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {activeTab === 'march_book' && (
                <>
                  <MonsterSelector
                    selectedMonster={selectedMonster}
                    onSelectMonster={setSelectedMonster}
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
                  />
                </>
              )}

              {activeTab === 'monsters' && (
                <>
                  <MonsterSelector
                    selectedMonster={selectedMonster}
                    onSelectMonster={setSelectedMonster}
                  />

                  <MarchResultCard recommendation={marchRecommendation} />
                </>
              )}

              {activeTab === 'crypts' && (
                <CryptOptimizer
                  profile={profile}
                  troops={hydratedTroops}
                  captain={selectedCaptain}
                />
              )}

              {/* Quick Progression Tips Box in Gold Frame */}
              <div className="bg-gradient-to-r from-[#241912] to-[#180f0a] border-2 border-[#5a3e22] rounded-xl p-4 text-xs space-y-2 font-serif shadow-xl">
                <div className="flex items-center gap-2 text-[#fef08a] font-bold font-fantasy">
                  <BookOpen className="w-4 h-4 text-[#caa568]" />
                  <span>Estratégia Tática Total Battle para Araning:</span>
                </div>
                <p className="text-[#caa568]/90 leading-relaxed">
                  Com seus <strong className="text-[#fef08a]">1.369 Lanceiros G1</strong> e bucha de absorção, seus <strong className="text-blue-300">81 Titãs M5</strong> e <strong className="text-emerald-300">1.797 Arqueiros G2</strong> ficam 100% blindados contra o golpe de maior HP do Monstro Épico, gerando vitórias com <strong className="text-emerald-400">zero baixas nas suas tropas pesadas</strong>!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#5a3e22] bg-[#140c07] py-4 text-center text-xs text-[#caa568]/70 font-serif">
        Total Battle Combat Advisor • Otimizado para Conta Araning • 100% Client-side
      </footer>
    </div>
  );
}

export default App;
