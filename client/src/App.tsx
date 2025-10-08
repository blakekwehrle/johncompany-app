import React from 'react';
import { useGameStore } from './store';
import { REGION_IDS } from './data/initialState';
import type { EventType } from './types/game';

function App() {
  const { 
    gameState, 
    startEventPhase, 
    completeEvent,
    resolveWindfall,
    resolveTurmoil,
    resolvePeace,
    resolveCrisis,
    resolveLeader,
    resolveForeignInvasion,
    resolveShuffle,
    updateRegion,
    resetGame,
    getNextEventRegion
  } = useGameStore();

  const handleEventResolution = () => {
    const currentEvent = gameState.currentEvent;
    if (!currentEvent) return;

    // Get the current region for this event (determined by next card's regionBack)
    const currentRegion = currentEvent.currentRegion || currentEvent.regionBack;

    // Route to the appropriate resolver based on event type
    switch (currentEvent.type) {
      case 'windfall':
        resolveWindfall(currentRegion);
        break;
      case 'turmoil':
        resolveTurmoil(currentRegion);
        break;
      case 'peace':
        resolvePeace(currentRegion, currentEvent.shape);
        break;
      case 'crisis':
        resolveCrisis(currentRegion, currentEvent.crisisModifier);
        break;
      case 'leader':
        resolveLeader(currentRegion);
        break;
      case 'foreign_invasion':
        resolveForeignInvasion(currentRegion);
        break;
      case 'shuffle':
        resolveShuffle(currentRegion);
        break;
      default:
        completeEvent();
    }
  };

  const getEventColor = (type: EventType): string => {
    const colors = {
      windfall: 'bg-green-100 border-green-500',
      turmoil: 'bg-red-100 border-red-500',
      peace: 'bg-blue-100 border-blue-500',
      crisis: 'bg-orange-100 border-orange-500',
      leader: 'bg-purple-100 border-purple-500',
      foreign_invasion: 'bg-yellow-100 border-yellow-500',
      shuffle: 'bg-gray-100 border-gray-500'
    };
    return colors[type] || 'bg-gray-100 border-gray-500';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">John Company Companion</h1>
      
      {/* Game Info */}
      <div className="mb-4">
        <p>Turn: {gameState.turn} | Year: {gameState.year} | Phase: {gameState.phase}</p>
        <p>Events in deck: {gameState.eventDeck.length} | Discarded: {gameState.discardedEvents.length}</p>
        {gameState.eventDeck.length > 0 && (
          <p className="text-sm text-gray-600">
            Next event region: {getNextEventRegion()}
          </p>
        )}
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
          onClick={resetGame}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Game
        </button>
      </div>

      {/* Current Event Display */}
      {gameState.currentEvent && (
        <div className={`mb-4 p-4 border-2 rounded ${getEventColor(gameState.currentEvent.type)}`}>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">{gameState.currentEvent.title}</h2>
            <span className="px-2 py-1 bg-gray-200 rounded text-sm capitalize">
              {gameState.currentEvent.type.replace('_', ' ')}
            </span>
          </div>
          
          <p className="mb-4">{gameState.currentEvent.description}</p>
          
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Event Happening In:</span>
              <strong className="text-blue-700">{gameState.currentEvent.currentRegion}</strong>
            </div>
            <div className="flex justify-between">
              <span>Chosen Region (Next Card Shows):</span>
              <span>{getNextEventRegion() || 'End of deck'}</span>
            </div>
            <div className="flex justify-between">
              <span>This Cards Back:</span>
              <span>{gameState.currentEvent.regionBack}</span>
            </div>
          </div>
          
          <button 
            onClick={handleEventResolution}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Resolve Event
          </button>
        </div>
      )}

      {/* Regions List */}
      <div className="grid grid-cols-2 gap-4">
        {Object.values(gameState.regions).map(region => (
          <div 
            key={region.id}
            onClick={() => updateRegion(region.id, { 
              companyControlled: !region.companyControlled 
            })}
            className={`p-4 border rounded cursor-pointer ${
              region.companyControlled ? 'bg-green-100 border-green-500' : 'bg-gray-100'
            }`}
          >
            <h3 className="font-bold">{region.name}</h3>
            <p>Unrest: {region.unrest}</p>
            <p>Tower: {region.towerHeight}</p>
            <p>Company: {region.companyControlled ? 'Yes' : 'No'}</p>
            <p>Orders: {region.orders.length}</p>
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