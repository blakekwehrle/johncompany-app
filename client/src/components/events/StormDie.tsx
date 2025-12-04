import React, { useState } from 'react';
import { useGameStore } from '../../store';
import { diceAnimation, stormDie } from '../../data/storm';
import type { StormDieSide } from '../../types/game';
import sdr from '../../assets/images/dice/sdr.png';

const StormDie: React.FC = () => {
  const { gameState, completeStormRoll, setStormDieResult, canCompleteEventPhase, startEventPhaseWithStorm } = useGameStore();
  const [showSelector, setShowSelector] = useState(false);
  const canChangeDie = !gameState.storm.isRolling && 
    (!gameState.storm.currentRoll || gameState.eventsRemaining === 0)
    && !gameState.stormDieConfirmed;

  const handleDieSelect = (side: StormDieSide, index: number) => {
    if (index === 5) {
      startEventPhaseWithStorm();
      
    } else {
      setStormDieResult(side);
    }
    setShowSelector(false);
  };

  const handleStartEventPhase = () => {
    if (!gameState.storm.currentRoll && !gameState.stormDieConfirmed) {
      setShowSelector(true);
    } else {
      completeStormRoll(gameState.storm.currentRoll);
    }
  };

  return (
    <div className="text-center">
      <h3 className="font-bold text-blue-700 mb-2">Storm Die</h3>
      
      <div 
        className="relative touch-manipulation"
        onClick={() => canChangeDie && setShowSelector(true)}
      >
        {gameState.storm.isRolling ? (
          <div className="w-20 h-20 mx-auto border-2 border-blue-300 rounded-lg shadow-lg overflow-hidden">
            <img 
              src={diceAnimation}
              alt="Rolling storm die..."
              className="w-full h-full object-cover"
            />
          </div>
        ) : gameState.storm.currentRoll ? (
          <div className={`relative ${canChangeDie ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}>
            <img 
              src={gameState.storm.currentRoll.image} 
              alt={`Storm die: ${gameState.storm.currentRoll.value} events, ${gameState.storm.currentRoll.direction}`}
              className="w-20 h-20 mx-auto border-2 border-blue-500 rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className={`
            w-20 h-20 mx-auto border-2 border-dashed border-blue-300 rounded-lg 
            flex items-center justify-center bg-blue-50
            ${canChangeDie ? 'cursor-pointer active:bg-blue-100 transition-colors' : ''}
          `}>
            <span className="text-blue-400 text-sm">Tap to select</span>
          </div>
        )}
      </div>

      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 touch-manipulation">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Select Storm Die Result</h3>
              <button 
                onClick={() => setShowSelector(false)}
                className="text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {stormDie.dieSides.map((side, index) => (
                <button
                  key={index}
                  onClick={() => handleDieSelect(side, index)}
                  className="flex flex-col items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  <img 
                    src={index === 5 ? sdr : side.image} 
                    alt={index === 5 ? "Random roll" : `${side.value} events, ${side.direction}`}
                    className="w-16 h-16 mb-2"
                  />
                  <span className="text-sm font-medium text-blue-800">
                    {index === 5 
                      ? "Random Roll"
                      : side.direction === 'none' 
                        ? `${side.value} Event${side.value > 1 ? 's' : ''}`
                        : `Storm: ${side.direction}`
                    }
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSelector(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {(!gameState.stormDieConfirmed) && (
        <button
          onClick={handleStartEventPhase}
          disabled={canCompleteEventPhase() || gameState.stormDieConfirmed}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:bg-gray-400"
        >
          Start Event Phase
        </button>
        )}
        
        {gameState.storm.currentRoll && (
          <div className="mt-2 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm font-bold text-blue-800">
              {gameState.storm.currentRoll.direction === 'none' 
                ? `${gameState.storm.currentRoll.value} Event${gameState.storm.currentRoll.value > 1 ? 's' : ''}`
                : `STORMS IN ${gameState.storm.currentRoll.direction.toUpperCase()}!`
              }
            </p>
            {gameState.eventsRemaining > 0 ? (
              <p className="text-xs text-blue-600 mt-1">
                {gameState.eventsRemaining} event{gameState.eventsRemaining > 1 ? 's' : ''} remaining
              </p>
            ) : (
              <p className="text-xs text-blue-600 mt-1">
                Ready to start event phase
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StormDie;