// In src/components/phases/EventPhase.tsx
import React from 'react';
import { useGameStore } from '../../store';

const EventPhase: React.FC = () => {
  const { 
    gameState, 
    getCurrentEvent, 
    getCurrentEventRegion, 
    completeEventPhase, 
    canCompleteEventPhase 
  } = useGameStore();
  
  const currentEvent = getCurrentEvent();
  const currentEventRegion = getCurrentEventRegion();
  const canComplete = canCompleteEventPhase();

  // Show different states based on what's happening
  if (!gameState.storm.currentRoll && gameState.eventsRemaining === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="text-center font-medium">Ready for Event Phase</p>
        <p className="text-sm mt-2 text-center">
          Roll the storm die to start events
        </p>
      </div>
    );
  }

  if (gameState.storm.currentRoll && !currentEvent && gameState.eventsRemaining > 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-blue-600">
        <p className="text-center font-medium">Ready for Next Event</p>
        <p className="text-sm mt-2 text-center">
          {gameState.eventsRemaining} event{gameState.eventsRemaining > 1 ? 's' : ''} remaining
        </p>
        <p className="text-xs mt-1 text-blue-500">
          Click "Draw Event" to continue
        </p>
      </div>
    );
  }

  if (canComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-center text-black-600 font-medium mb-1">Events in India Concluded</p>
        <button
          onClick={completeEventPhase}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          Continue to Company Phase
        </button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="text-center">Processing events...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-3 text-blue-800">Current Event</h2>
      
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-700">{currentEvent.title}</h3>
          <p className="text-sm text-blue-600 mt-1">{currentEvent.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white p-2">
            <span className="font-medium">Region: </span>
            <span className="text-blue-700 font-bold capitalize">{currentEventRegion}</span>
            <br />
            {currentEvent.strength && (
              <div>
                <span className="font-medium">Strength: </span>
                <span className="text-red-600 font-bold">{currentEvent.strength}</span>
              </div>
            )}
          </div>
          <div className="relative flex justify-center">
            <img 
              src={currentEvent.image} 
              alt={currentEvent.title}
              className="w-24 h-24 rounded-lg border-2 border-yellow-500"
            />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 text-center">
            Event Phase - Map is view-only
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventPhase;