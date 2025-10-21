import React, { useState } from 'react';
import { useGameStore } from './store';
import { REGION_IDS } from './data/initialState';

// Components we'll create
import MapView from './components/map/MapView';
import EventPhase from './components/phases/EventPhase';
import CompanyPhase from './components/phases/CompanyPhase';
import AnalysisPhase from './components/phases/AnalysisPhase';
import StormDie from './components/events/StormDie';
import GanjifaDeck from './components/events/GanjifaDeck';

type AppPhase = 'event' | 'company' | 'analysis';

function App() {
  const { gameState, resetGame } = useGameStore();
  const [currentPhase, setCurrentPhase] = useState<AppPhase>('event');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Navigation between phases
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'event':
        return <EventPhase />;
      case 'company':
        return <CompanyPhase />;
      case 'analysis':
        return <AnalysisPhase />;
      default:
        return <EventPhase />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-800 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">John Company Companion</h1>
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
        
        {/* Phase Navigation */}
        <nav className="flex justify-center space-x-4 mt-2">
          <button
            onClick={() => setCurrentPhase('event')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentPhase === 'event' 
                ? 'bg-white text-amber-800 shadow-md' 
                : 'bg-amber-700 text-amber-100'
            }`}
          >
             Event Phase
          </button>
          <button
            onClick={() => setCurrentPhase('company')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentPhase === 'company' 
                ? 'bg-white text-amber-800 shadow-md' 
                : 'bg-amber-700 text-amber-100'
            }`}
          >
            Company Phase
          </button>
          <button
            onClick={() => setCurrentPhase('analysis')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentPhase === 'analysis' 
                ? 'bg-white text-amber-800 shadow-md' 
                : 'bg-amber-700 text-amber-100'
            }`}
          >
             Analysis
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Panel - Map (Always visible) */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-amber-200 overflow-hidden min-h-[300px]">
          <MapView 
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            currentPhase={currentPhase}
          />
        </div>

        {/* Right Panel - Phase-specific content */}
        <div className="w-full md:w-96 flex flex-col gap-4">
          {/* Storm Die and Event Deck - Always visible during event phase, minimized otherwise */}
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

          {/* Phase-specific controls */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border-2 border-amber-200 p-4">
            {renderPhaseContent()}
          </div>
        </div>
      </main>

      {/* Quick Stats Footer */}
      <footer className="bg-amber-900 text-amber-100 p-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Deck: {gameState.eventDeck.length} • Discard: {gameState.discardedEvents.length}</span>
          <span>Events Remaining: {gameState.eventsRemaining}</span>
          <span>Unrest: {Object.values(gameState.regions).reduce((sum, r) => sum + r.unrest, 0)}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;