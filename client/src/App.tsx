import React, { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { REGION_IDS, type RegionId } from './data/initialState';
import type { EventType } from './types/game';
import { diceAnimation, getRegionsByStormDirection, rollStormDie } from './data/storm';

function App() {
  const { 
    gameState, 
    startEventPhaseWithStorm, 
    rollStormDie,
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
    getNextEventRegion,
    triggerTurmoilTest,
    resetAllOrders,
    setAllOrdersOpen,
  } = useGameStore();

  const [showFinalResult, setShowFinalResult] = useState(false);
  const [selectedTestRegion, setSelectedTestRegion] = useState<RegionId>(REGION_IDS.PUNJAB);
  
  useEffect(() => {
    if (gameState.storm.isRolling) {
      setShowFinalResult(false);
    } else if (gameState.storm.currentRoll && !showFinalResult) {
      // Small delay after animation completes to show final result
      const timer = setTimeout(() => {
        setShowFinalResult(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [gameState.storm.isRolling, gameState.storm.currentRoll, showFinalResult]);

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
        {gameState.eventsRemaining > 0 && (
          <p className="text-blue-600 font-semibold">
            Events remaining: {gameState.eventsRemaining}
          </p>
        )}
      </div>

       {/* Storm Die Display with Animation */}
      {((gameState.storm.isRolling || gameState.storm.currentRoll)) && (
        <div className="mb-4 p-4 border-2 border-blue-400 bg-blue-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            {gameState.storm.isRolling ? 'Rolling Storm Die...' : 'Storm Die Result'}
          </h3>
          <div className="flex items-center gap-6">
            {/* Dice Image/Animation */}
            <div className="flex-shrink-0">
              {gameState.storm.isRolling ? (
                // Show animation during roll
                <img 
                  src={diceAnimation}
                  alt="Rolling storm die..."
                  className="w-16 h-16 object-contain border-2 border-blue-300 rounded-lg"
                />
              ) : (
                // Show final result after animation
                showFinalResult && gameState.storm.currentRoll && (
                  <img 
                    src={gameState.storm.currentRoll.image} 
                    alt={`Storm die: ${gameState.storm.currentRoll.value} events, ${gameState.storm.currentRoll.direction}`}
                    className="w-16 h-16 object-contain border-2 border-blue-300 rounded-lg transition-opacity duration-300"
                    style={{ opacity: showFinalResult ? 1 : 0 }}
                  />
                )
              )}
            </div>
            
            {/* Die Information */}
            <div className="flex-grow">
              {gameState.storm.isRolling ? (
                <div className="text-xl font-bold text-blue-600 animate-pulse">
                  Rolling...
                </div>
              ) : (
                showFinalResult && gameState.storm.currentRoll && (
                  <>
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {gameState.storm.currentRoll.direction === 'none' 
                        ? `${gameState.storm.currentRoll.value} Event${gameState.storm.currentRoll.value > 1 ? 's' : ''}`
                        : `STORMS IN THE ${gameState.storm.currentRoll.direction.toUpperCase()}!`
                      }
                    </div>
                    
                    {gameState.eventsRemaining > 0 && (
                      <p className="font-semibold text-blue-800">
                        Events remaining: {gameState.eventsRemaining}
                      </p>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={startEventPhaseWithStorm}
          disabled={gameState.phase === 'event'}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Start Event Phase (Roll Storm Die)
        </button>
        
        <button 
          onClick={rollStormDie}

          disabled={gameState.storm.isRolling === true}
          className="bg-cyan-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Roll Storm Die Only
        </button>
        
        <button 
          onClick={resetGame}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Game
        </button>
      </div>

      {/* controls */}
      {/* <div className="mb-4 space-x-2">
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
      </div> */}
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
       {/* Cascade Testing Controls */}
      <div className="mb-6 p-4 border border-purple-300 bg-purple-50 rounded">
        <h2 className="text-lg font-bold mb-2 text-purple-800">Turmoil & Cascade Testing</h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            onClick={resetAllOrders}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Reset All Orders
          </button>
          
          <button 
            onClick={setAllOrdersOpen}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            All Orders Open
          </button>
          
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Test Turmoil in:</label>
          <select 
            value={selectedTestRegion}
            onChange={(e) => setSelectedTestRegion(e.target.value as RegionId)}
            className="border rounded px-2 py-1 text-sm"
          >
            {Object.values(REGION_IDS).map(regionId => (
              <option key={regionId} value={regionId}>{regionId}</option>
            ))}
          </select>
          
          <button 
            onClick={() => triggerTurmoilTest(selectedTestRegion)}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
          >
            Test Turmoil
          </button>
        </div>
        
        <div className="mt-2 text-xs text-purple-600">
          <p>Note: Cascade only triggers if ALL orders in the region are closed</p>
        </div>
      </div>
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
            <div className="text-sm">
              Orders: 
              {region.orders.map(orderId => {
                const order = gameState.orders?.[orderId]; // Safe access with optional chaining
                if (!order) {
                  return (
                    <div key={orderId} className="ml-2 text-gray-400">
                      • Order {orderId}: NOT FOUND
                    </div>
                  );
                }
                return (
                  <div key={orderId} className={`ml-2 ${order.open ? 'text-green-600' : 'text-red-600'}`}>
                    • Order {orderId} (P{order.northPriority}): {order.open ? 'OPEN' : 'CLOSED'}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">Order Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.values(gameState.orders).map(order => (
            <div key={order.id} className={`p-2 border rounded ${order.open ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between">
                <span className="font-medium">Order {order.id}</span>
                <span className={order.open ? 'text-green-600' : 'text-red-600'}>
                  {order.open ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <div>Region: {order.region}</div>
                <div>North Priority: {order.northPriority}</div>
                <div>Neighbors: {order.neighbors.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
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