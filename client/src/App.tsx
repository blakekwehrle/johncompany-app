import { useState } from 'react';
import { useGameStore } from './store';
import type { ScenarioPreset } from './data/initialState';
import MapView from './components/map/MapView';
import EventPhase from './components/phases/EventPhase';
import CompanyPhase from './components/phases/CompanyPhase';
import StormDie from './components/events/StormDie';
import GanjifaDeck from './components/events/GanjifaDeck';
import AnalysisPhase from './components/phases/AnalysisPhase';
import AlphaDisclaimer from './components/ui/AlphaDisclaimer';

function App() {
  const { gameState, resetGame, currentScenario, setScenario } = useGameStore();
  const currentPhase = gameState.phase;

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'event':
        return <EventPhase />;
      case 'company':
        return <CompanyPhase selectedRegion={selectedRegion} />;
      case 'analysis':
        return <AnalysisPhase />;
      default:
        return <EventPhase />;
    }
  };

  const handleScenarioChange = (value: string) => {
    setScenario(value as ScenarioPreset);
  };

  return (
    <>
      <AlphaDisclaimer />

      <div className="h-screen bg-gradient-to-br from-blue-50 to-rose-50 flex flex-col">
        <header className="bg-rose-800 text-white p-2 shadow-lg relative">
          <div className="hidden sm:flex justify-between items-center">
            <h1 className="text-xl font-bold mb-2">John Company: Events in India Companion</h1>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span>
                  Turn {gameState.turn} • {gameState.year} • Scenario {currentScenario}
                </span>
              </div>

              <button
                onClick={() => setShowSettings((prev) => !prev)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Scenario
              </button>

              <button
                onClick={() => resetGame()}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Reset Game
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="absolute right-2 top-14 z-50 w-72 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 p-4">
              <h2 className="text-base font-bold text-rose-800 mb-3">Game Settings</h2>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Scenario</label>
                <select
                  value={currentScenario}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="1710">1710</option>
                  <option value="1758">1758</option>
                  <option value="1813">1813</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    resetGame(currentScenario);
                    setShowSettings(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Load Scenario
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <nav className="flex justify-center space-x-4 mt-2">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                gameState.phase === 'event'
                  ? 'bg-white text-rose-800 shadow-md'
                  : 'bg-rose-700 text-rose-100 opacity-70'
              }`}
            >
              Event Phase
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                gameState.phase === 'company'
                  ? 'bg-white text-rose-800 shadow-md'
                  : 'bg-rose-700 text-rose-100 opacity-70'
              }`}
            >
              Company Phase
            </div>
          </nav>
        </header>

        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 md:overflow-hidden overflow-auto">
          <div className="flex-1 bg-white rounded-xl overflow-hidden min-h-[300px]">
            <MapView
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              currentPhase={currentPhase}
            />
          </div>

          <div className="w-full md:w-96 flex flex-col gap-2">
            {currentPhase === 'event' && (
              <div
                className={`bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 transition-all ${
                  currentPhase === 'event' ? 'flex-1' : 'h-32'
                }`}
              >
                {currentPhase === 'event' ? (
                  <div className="h-full flex flex-col">
                    <h2 className="text-lg font-bold text-blue-800 mb-3">Event Phase</h2>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <StormDie />
                      <GanjifaDeck />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <span>Switch to Event Phase to roll storm die</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4">
              {renderPhaseContent()}
            </div>
          </div>
        </main>

        <footer className="bg-rose-900 text-amber-100 p-2 text-sm">
          <div className="flex justify-between items-center">
            <span>
              Deck: {gameState.eventDeck.length} • Discard: {gameState.discardedEvents.length}
            </span>
            <span>Events Remaining: {gameState.eventsRemaining}</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;