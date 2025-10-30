import React from 'react';
import { useGameStore } from '../../store';
import { getEventDefinition, REGION_IDS } from '../../types/events';
// Import your region back images
import blank_img from '../../assets/images/ganjifa/backs/ganjifa_blank.png';
import bengal_img from '../../assets/images/ganjifa/backs/ganjifa_bengal.png';
import bombay_img from '../../assets/images/ganjifa/backs/ganjifa_bombay.png';
import delhi_img from '../../assets/images/ganjifa/backs/ganjifa_delhi.png';
import hyderabad_img from '../../assets/images/ganjifa/backs/ganjifa_hyderabad.png';
import madras_img from '../../assets/images/ganjifa/backs/ganjifa_madras.png';
import maratha_img from '../../assets/images/ganjifa/backs/ganjifa_maratha.png';
import mysore_img from '../../assets/images/ganjifa/backs/ganjifa_mysore.png';
import punjab_img from '../../assets/images/ganjifa/backs/ganjifa_punjab.png';

const GanjifaDeck: React.FC = () => {
  const { gameState, drawNextEvent, getCurrentEvent, handleEventResolution } = useGameStore();
  
  const currentEvent = getCurrentEvent();

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

  // Determine if we can draw next event
  const canDrawNextEvent = gameState.eventsRemaining > 0 && !currentEvent;

  return (
    <div className="text-center">
      <h3 className="font-bold text-amber-700 mb-2">Event Deck</h3>
      
      <div className="flex justify-center items-center gap-4 mb-4">
        {/* Deck */}
        <div className="relative">
          <div className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-200 opacity-60"></div>
          <img 
            src={topDeckCard.image} 
            alt={`Next region: ${topDeckCard.region}`}
            className="w-16 h-16 rounded-full border-2 border-amber-600 relative z-10"
          />
          <div className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-20">
            {gameState.eventDeck.length}
          </div>
        </div>

        {/* Current Event */}
        {currentEvent && (
          <div className="relative">
            <img 
              src={currentEvent.image} 
              alt={currentEvent.title}
              className="w-16 h-16 rounded-full border-2 border-yellow-500"
            />
            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Draw Next Event button */}
        <button
          onClick={drawNextEvent}
          disabled={!canDrawNextEvent}
          className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 hover:bg-green-600 transition-colors"
        >
          {canDrawNextEvent ? `Draw Event (${gameState.eventsRemaining})` : 'Draw Event'}
        </button>

        {/* Resolve Event button */}
        {currentEvent && (
          <button
            onClick={handleEventResolution}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Resolve Event
          </button>
        )}
      </div>
      {/* Current Event Info 
      
      {currentEvent && (
        <div className="mt-3 p-2 bg-amber-100 rounded-lg border border-amber-300">
          <h4 className="font-bold text-sm">{currentEvent.title}</h4>
          <p className="text-xs text-amber-700">{currentEvent.description}</p>
          <p className="text-xs text-amber-600 mt-1">
            Region: <span className="capitalize font-medium">{currentEvent.regionBack}</span>
          </p>
        </div>
      )}

      <div className="mt-2 text-xs text-amber-600">
        <p>Deck: {gameState.eventDeck.length} • Discard: {gameState.discardedEvents.length}</p>
      </div>

      */}
      
    </div>
  );
};

export default GanjifaDeck;