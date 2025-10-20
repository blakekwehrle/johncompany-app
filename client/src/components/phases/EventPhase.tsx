// components/phases/EventPhase.tsx
import React from 'react';
import { useGameStore } from '../../store';
import { getEventDefinition } from '../../types/events';

const EventPhase: React.FC = () => {
  const { gameState, getCurrentEvent, getCurrentEventRegion } = useGameStore();
  const currentEvent = getCurrentEvent();
  const currentEventRegion = getCurrentEventRegion();

  // Show different states based on what's happening
  if (!gameState.storm.currentRoll && gameState.eventsRemaining === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="text-4xl mb-4">⚡</div>
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
        <div className="text-4xl mb-4"></div>
        <p className="text-center font-medium"></p>
        <p className="text-sm mt-2 text-center">
          {gameState.eventsRemaining} event{gameState.eventsRemaining > 1 ? 's' : ''} remaining
        </p>
        <p className="text-xs mt-1 text-blue-500">
          Click "Draw Event" to continue
        </p>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-center">Event phase complete</p>
        <p className="text-sm mt-2 text-center">
          Switch to Company Phase to continue
        </p>
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
            
          <div className="bg-white p-2 ">
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
          <div className="relative ">
                <img 
                src={currentEvent.image} 
                alt={currentEvent.title}
                className="w-32 h-32 rounded-full border-2 border-yellow-500"
                />
            </div>
        </div>
        {
            
        }
        
      </div>
    </div>
  );
};

export default EventPhase;