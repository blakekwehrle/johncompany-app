import React, { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { REGION_IDS, type RegionId } from './data/initialState';
import type { EventType } from './types/game';
import { diceAnimation } from './data/storm';
import { getEventDefinition } from './types/events';

// Import ganjifa images
import blank_img from './assets/images/ganjifa/backs/ganjifa_blank.png';
import bengal_img from './assets/images/ganjifa/backs/ganjifa_bengal.png';
import bombay_img from './assets/images/ganjifa/backs/ganjifa_bombay.png';
import delhi_img from './assets/images/ganjifa/backs/ganjifa_delhi.png';
import hyderabad_img from './assets/images/ganjifa/backs/ganjifa_hyderabad.png';
import madras_img from './assets/images/ganjifa/backs/ganjifa_madras.png';
import maratha_img from './assets/images/ganjifa/backs/ganjifa_maratha.png';
import mysore_img from './assets/images/ganjifa/backs/ganjifa_mysore.png';
import punjab_img from './assets/images/ganjifa/backs/ganjifa_punjab.png';

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
    resetAllOrders,
    setAllOrdersOpen,
    triggerCascadeTest,
    getCurrentEvent,
    getCurrentEventRegion,
    handleEventResolution,
    drawNextEvent
  } = useGameStore();

  const [showFinalResult, setShowFinalResult] = useState(false);
  const [selectedTestRegion, setSelectedTestRegion] = useState<RegionId>(REGION_IDS.PUNJAB);
  
  useEffect(() => {
    if (gameState.storm.isRolling) {
      setShowFinalResult(false);
    } else if (gameState.storm.currentRoll && !showFinalResult) {
      const timer = setTimeout(() => {
        setShowFinalResult(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [gameState.storm.isRolling, gameState.storm.currentRoll, showFinalResult]);

  const currentEvent = getCurrentEvent();
  const currentEventRegion = getCurrentEventRegion();

  // Map region IDs to their back images
  const regionBackImages: Record<string, string> = {
    [REGION_IDS.PUNJAB]: punjab_img,
    [REGION_IDS.DELHI]: delhi_img,
    [REGION_IDS.BENGAL]: bengal_img,
    [REGION_IDS.BOMBAY]: bombay_img,
    [REGION_IDS.MARATHA]: maratha_img,
    [REGION_IDS.HYDERABAD]: hyderabad_img,
    [REGION_IDS.MYSORE]: mysore_img,
    [REGION_IDS.MADRAS]: madras_img,
  };

  // Get the top card of the deck for display
  const getTopDeckCard = () => {
    if (gameState.eventDeck.length > 0) {
      const topEventId = gameState.eventDeck[0];
      const topEvent = getEventDefinition(topEventId);
      return {
        image: regionBackImages[topEvent.regionBack] || blank_img,
        region: topEvent.regionBack
      };
    }
    return {
      image: blank_img,
      region: 'Empty'
    };
  };

  const topDeckCard = getTopDeckCard();

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

  const isStartEventPhaseDisabled = gameState.phase === 'event' || gameState.eventsRemaining > 0;
  const isDrawNextEventDisabled = gameState.eventsRemaining <= 0 || !!currentEvent;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">John Company Companion</h1>
      
      {/* Game Info */}
      {/* Ganjifa Card Display */}
      <div className="mb-4 p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-lg">
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Event Deck */}
          <div className="text-center">
            <h3 className="font-bold text-amber-700 mb-3">Event Deck</h3>
            <div className="relative">
              {/* Deck stack effect */}
              <div className="absolute -bottom-2 -right-2 w-40 h-40 rounded-full border-2 border-amber-400 bg-amber-200 opacity-60"></div>
              <div className="absolute -bottom-1 -right-1 w-40 h-40 rounded-full border-2 border-amber-500 bg-amber-300 opacity-80"></div>
              
              {/* Top card */}
              <img 
                src={topDeckCard.image} 
                alt={`Next region: ${topDeckCard.region}`}
                className="w-40 h-40 rounded-full border-4 border-amber-600 shadow-xl relative z-10"
              />
              
              {/* Card count badge */}
              <div className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-md z-20">
                {gameState.eventDeck.length}
              </div>
            </div>
            <p className="mt-3 text-s text-amber-600">
              {gameState.eventDeck.length} cards remaining
            </p>
          
          </div>

          {/* Current Event Card */}
          <div className="text-center">
            <h3 className="font-bold text-amber-700 mb-3">Current Event</h3>
            {currentEvent ? (
              <div className="relative">
                <img 
                  src={currentEvent.image} 
                  alt={currentEvent.title}
                  className="w-40 h-40 rounded-full border-4 border-yellow-500 shadow-xl"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                  !
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 flex flex-col items-center justify-center border-4 border-dashed border-amber-300 rounded-full bg-amber-50">
                
              </div>
            )}
            {currentEvent && (
              <p className="mt-3 text-sm text-amber-700 font-medium">
                Region: <span className="capitalize">{currentEventRegion}</span>
              </p>
            )}
          </div>

          {/* Discard Pile */}
          <div className="text-center">
            <h3 className="font-bold text-amber-700 mb-3">Discard Pile</h3>
            <div className="relative">
              {/* Discard stack effect */}
              <div className="absolute -bottom-2 -right-2 w-40 h-40 rounded-full border-2 border-amber-300 bg-amber-100 opacity-60"></div>
              <div className="absolute -bottom-1 -right-1 w-40 h-40 rounded-full border-2 border-amber-400 bg-amber-200 opacity-80"></div>
              
              {/* Top discard */}
              <img 
                src={blank_img} 
                alt="Discard pile"
                className="w-40 h-40 rounded-full border-4 border-amber-500 opacity-75 relative z-10"
              />
              
              {/* Discard count badge */}
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-md z-20">
                {gameState.discardedEvents.length}
              </div>
            </div>
            <p className="mt-3 text-sm text-amber-700 font-medium">
              Discarded: {gameState.discardedEvents.length}
            </p>
          </div>
        </div>

        {/* Event progress bar */}
        {gameState.eventsRemaining > 0 && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-amber-700 mb-1">
              <span>Events Progress</span>
              <span>{gameState.eventsRemaining} remaining</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((gameState.storm.currentRoll?.value || 1) - gameState.eventsRemaining) / (gameState.storm.currentRoll?.value || 1) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>


      {/* Controls */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={startEventPhaseWithStorm}
          disabled={isStartEventPhaseDisabled}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Start Event Phase (Roll Storm Die)
        </button>
        
        <button 
          onClick={drawNextEvent}
          disabled={isDrawNextEventDisabled}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Next Event
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

      {/* Storm Die Display  */}
      {((gameState.storm.isRolling || gameState.storm.currentRoll)) && (
        <div className="mb-4 p-4 border-2 border-blue-400 bg-blue-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            {gameState.storm.isRolling ? 'Rolling Storm Die...' : 'Storm Die Result'}
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {gameState.storm.isRolling ? (
                <img 
                  src={diceAnimation}
                  alt="Rolling storm die..."
                  className="w-16 h-16 object-contain border-2 border-blue-300 rounded-lg"
                />
              ) : (
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
                        : `STORMS IN ${gameState.storm.currentRoll.direction.toUpperCase()}!`
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
      
      {/* Event Display */}
      {currentEvent && (
        <div className={`mb-4 p-4 border-2 rounded ${getEventColor(currentEvent.type)}`}>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">{currentEvent.title}</h2>
            <span className="px-2 py-1 bg-gray-200 rounded text-sm capitalize">
              {currentEvent.type.replace('_', ' ')}
            </span>
          </div>
          
          <p className="mb-4">{currentEvent.description}</p>
          
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Event Happening In:</span>
              <strong className="text-blue-700">{currentEventRegion}</strong>
            </div>
            <div className="flex justify-between">
              <span>This Cards Back:</span>
              <span>{currentEvent.regionBack}</span>
            </div>
            {currentEvent.strength && (
              <div className="flex justify-between">
                <span>Strength:</span>
                <span>{currentEvent.strength}</span>
              </div>
            )}
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
            onClick={() => triggerCascadeTest(selectedTestRegion)}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
          >
            Test Cascade
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
                const order = gameState.orders?.[orderId];
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