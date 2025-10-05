import React from 'react';
import { useGameStore } from './store';
import { REGION_IDS } from './data/initialState';

function App() {
  const { 
    gameState, 
    startEventPhase, 
    completeEvent, 
    updateRegion,
    resetGame,
    getRegionOrders 
  } = useGameStore();

  const handleRegionClick = (regionId: string) => {
    const region = gameState.regions[regionId];
    if (region) {
      // Simple toggle for testing
      updateRegion(regionId, { 
        companyControlled: !region.companyControlled,
        unrest: region.unrest + 1 
      });
    }
  };

  return (
    <div className="p-4" style={{ fontFamily: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, "Times New Roman", serif' }}>
      <h1 className="text-2xl font-bold mb-4">John Company Companion</h1>
      
      {/* Game Info */}
      <div className="mb-4">
        <p>Turn: {gameState.turn} | Year: {gameState.year} | Phase: {gameState.phase}</p>
      </div>

      {/* Controls */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={startEventPhase}
          disabled={gameState.phase === 'event'}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Start Event Phase
        </button>
        
        <button 
          onClick={completeEvent}
          disabled={!gameState.currentEvent}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Complete Event
        </button>
        
        <button 
          onClick={resetGame}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Game
        </button>
      </div>

      {/* Current Event */}
      {gameState.currentEvent && (
        <div className="mb-4 p-4 border border-yellow-400 bg-yellow-50 rounded">
          <h2 className="text-xl font-bold">{gameState.currentEvent.title}</h2>
          <p>{gameState.currentEvent.description}</p>
        </div>
      )}

      {/* Regions List (Temporary until we have the SVG map) */}
      <div className="grid grid-cols-2 gap-4">
        {Object.values(gameState.regions).map(region => (
          <div 
            key={region.id}
            onClick={() => handleRegionClick(region.id)}
            className={`p-4 border rounded cursor-pointer ${
              region.companyControlled ? 'bg-green-100 border-green-500' : 'bg-gray-100'
            }`}
          >
            <h3 className="font-bold">{region.name}</h3>
            <p>Unrest: {region.unrest}</p>
            <p>Company Controlled: {region.companyControlled ? 'Yes' : 'No'}</p>
            <p>Orders: {region.orders.length}</p>
            <p>Neighbors: {region.neighbors.length}</p>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <details className="mt-8">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(gameState, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default App;
