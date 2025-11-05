import React from 'react';
import { useGameStore } from '../../store';
import { diceAnimation } from '../../data/storm';

const StormDie: React.FC = () => {
  const { gameState, rollStormDie, startEventPhaseWithStorm } = useGameStore();

  // Determine if we can start the event phase
  const canStartEventPhase = !gameState.eventPhaseComplete && !gameState.storm.currentRoll;

  return (
    <div className="text-center">
      <h3 className="font-bold text-blue-700 mb-2">Storm Die</h3>
      
      <div className="relative">
        {gameState.storm.isRolling ? (
          <img 
            src={diceAnimation}
            alt="Rolling storm die..."
            className="w-20 h-20 mx-auto border-2 border-blue-300 rounded-lg shadow-lg"
          />
        ) : gameState.storm.currentRoll ? (
          <img 
            src={gameState.storm.currentRoll.image} 
            alt={`Storm die: ${gameState.storm.currentRoll.value} events, ${gameState.storm.currentRoll.direction}`}
            className="w-20 h-20 mx-auto border-2 border-blue-500 rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 mx-auto border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50">
            <span className="text-blue-400 text-sm">Roll</span>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {/* Start Event Phase button - only show when not in event phase and no events remaining */}
        {canStartEventPhase && (
          <button
            onClick={startEventPhaseWithStorm}
            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Start Event Phase
          </button>
        )}
        
        {/* Roll Storm Die button - always available when not rolling */}
        {/* <button
          onClick={rollStormDie}
          disabled={gameState.storm.isRolling}
          className="w-full bg-cyan-500 text-white py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 hover:bg-cyan-600 transition-colors"
        >
          Roll Storm Die
        </button> */}
      </div>

      {gameState.storm.currentRoll && (
        <div className="mt-2 p-2 bg-blue-100 rounded-lg">
          <p className="text-sm font-bold text-blue-800">
            {gameState.storm.currentRoll.direction === 'none' 
              ? `${gameState.storm.currentRoll.value} Event${gameState.storm.currentRoll.value > 1 ? 's' : ''}`
              : `STORMS IN ${gameState.storm.currentRoll.direction.toUpperCase()}!`
            }
          </p>
          {gameState.eventsRemaining > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              {gameState.eventsRemaining} event{gameState.eventsRemaining > 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StormDie;
