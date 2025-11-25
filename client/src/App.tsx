import { useState } from 'react';
import { useGameStore } from './store';

import MapView from './components/map/MapView';
import EventPhase from './components/phases/EventPhase';
import CompanyPhase from './components/phases/CompanyPhase';
import StormDie from './components/events/StormDie';
import GanjifaDeck from './components/events/GanjifaDeck';
import AnalysisPhase from './components/phases/AnalysisPhase';

function App() {
  const { gameState, resetGame } = useGameStore();
  const currentPhase = gameState.phase;
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Navigation between phases
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
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-rose-50 flex flex-col">
      {/* Header */}
      <header className="bg-rose-800 text-white p-2 shadow-lg">
        <div className="hidden sm:flex justify-between items-center">
          <h1 className="text-xl font-bold mb-2">John Company: Events in India Companion</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span>Turn {gameState.turn} • {gameState.year}</span>
            </div>
            <button 
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Reset Game
            </button>
          </div>
        </div>
        
        {/* Phase Navigation - Display only */}
        <nav className="flex justify-center space-x-4">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            gameState.phase === 'event' 
              ? 'bg-white text-rose-800 shadow-md' 
              : 'bg-rose-700 text-rose-100 opacity-70'
          }`}>
            Event Phase
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            gameState.phase === 'company' 
              ? 'bg-white text-rose-800 shadow-md' 
              : 'bg-rose-700 text-rose-100 opacity-70'
          }`}>
            Company Phase
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 md:overflow-hidden overflow-auto">
        {/* Left Panel - Map (Always visible) */}
        {/* <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-rose-200 overflow-hidden min-h-[300px]"> */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden min-h-[300px]">
          <MapView 
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            currentPhase={currentPhase}
          />
        </div>

        {/* Right Panel - Phase-specific content */}
        <div className="w-full md:w-96 flex flex-col gap-2">
          {/* Storm Die and Event Deck - Always visible during event phase, minimized otherwise */}
          {currentPhase === 'event' && (
          <div className={`bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 transition-all ${
            currentPhase === 'event' ? 'flex-1' : 'h-32'
          }`}>
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
          {/* Phase-specific controls */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4">
            {renderPhaseContent()}
          </div>
        </div>
      </main>

      {/* Quick Stats Footer */}
      <footer className="bg-rose-900 text-amber-100 p-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Deck: {gameState.eventDeck.length} • Discard: {gameState.discardedEvents.length}</span>
          <span>Events Remaining: {gameState.eventsRemaining}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;