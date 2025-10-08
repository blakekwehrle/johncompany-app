import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Region, Order, Event, ElephantShape, EventType } from '../types/game';
import { initialState, getOrdersByRegion, getNeighboringRegions, getOrderById, initialEventDeck } from '../data/initialState';

interface GameStore {
  // State
  gameState: GameState;
  
  // Actions
  startEventPhase: () => void;
  drawEvent: () => void;
  completeEvent: () => void;
  updateRegion: (regionId: string, updates: Partial<Region>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  changePhase: (phase: GameState['phase']) => void;
  resetGame: () => void;
  
  // Event-specific actions
  resolveWindfall: (regionId: string) => void;
  resolveTurmoil: (regionId: string) => void;
  resolvePeace: (regionId: string, shape: ElephantShape) => void;
  resolveCrisis: (regionId: string, crisisModifier: number) => void;
  resolveLeader: (regionId: string) => void;
  resolveForeignInvasion: (regionId: string) => void;
  resolveShuffle: (regionId: string) => void;
  
  // Helper functions
  getRegion: (regionId: string) => Region | undefined;
  getRegionOrders: (regionId: string) => Order[];
  getNextEventRegion: () => string | null;

  // Elephant actions
  moveElephant: (tailRegion: string, headRegion: string, isWithinRegion?: boolean) => void;
  resolveElephantEvent: (event: Event, currentRegion: string) => void;
  
  // Helper functions
  getCrisisType: () => 'rebellion' | 'invasion' | 'attack_on_company';
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: initialState,

      startEventPhase: () => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: 'event'
          }
        }));
        get().drawEvent();
      },
      moveElephant: (tailRegion: string, headRegion: string, isWithinRegion: boolean = false) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            elephant: {
              tailRegion,
              headRegion: isWithinRegion ? tailRegion : headRegion,
              isWithinRegion
            }
          }
        }));
        console.log(`Elephant moved: tail in ${tailRegion}, facing ${isWithinRegion ? 'within region' : headRegion}`);
      },

      resolveElephantEvent: (event: Event, currentRegion: string) => {
        const state = get();
        
        switch (event.type) {
          case 'peace':
            get().resolvePeace(currentRegion, event.shape);
            break;
          case 'crisis':
            get().resolveCrisis(currentRegion, event.crisisModifier);
            break;
          case 'leader':
            get().resolveLeader(currentRegion);
            break;
          default:
            console.log(`No special elephant handling for event type: ${event.type}`);
        }
      },

      getCrisisType: () => {
        const state = get();
        const { elephant } = state.gameState;
        
        // Determine crisis type based on elephant position?
        if (elephant.isWithinRegion) {
          return 'attack_on_company';
        }
        
        const tailRegion = state.gameState.regions[elephant.tailRegion];
        const headRegion = state.gameState.regions[elephant.headRegion];
        
        if (tailRegion.towerHasFlag && headRegion.towerHasFlag && tailRegion.towerHasFlag === headRegion.towerHasFlag) {
          return 'rebellion';
        }
        
        return 'invasion';
      },

      drawEvent: () => {
        const state = get();
        const { eventDeck, discardedEvents } = state.gameState;
        
        console.log('=== DRAWING EVENT ===');
        console.log('Deck before draw:', eventDeck.map(e => `${e.type} (${e.regionBack})`));
        console.log('Discarded before draw:', discardedEvents.map(e => `${e.type} (${e.regionBack})`));
        
        // If deck is empty, reshuffle discard 
        let currentDeck = eventDeck;
        if (currentDeck.length === 0) {
          console.log('Deck empty, reshuffling discard pile');
          currentDeck = [...discardedEvents];
          // Shuffle 
          for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
          }
        }
        
        if (currentDeck.length === 0) {
          console.warn('No events available!');
          return;
        }
        
        // Draw the top event
        const drawnEvent = currentDeck[0];
        const remainingDeck = currentDeck.slice(1);
        
        //current region is the regionBack of the NEXT event in deck
        let currentRegion: string;
        if (remainingDeck.length > 0) {
          currentRegion = remainingDeck[0].regionBack;
          console.log(`Next event in deck: ${remainingDeck[0].type} (regionBack: ${currentRegion})`);
        } else {
          currentRegion = drawnEvent.regionBack; // fallback
          console.log('No next event, using drawn event regionBack as fallback');
        }
        
        console.log(`Drawing: ${drawnEvent.type} (card regionBack: ${drawnEvent.regionBack})`);
        console.log(`Current region for this event: ${currentRegion}`);
        
        //current event with the determined region
        const currentEventWithRegion: Event = {
          ...drawnEvent,
          currentRegion: currentRegion
        };
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            currentEvent: currentEventWithRegion,
            eventDeck: remainingDeck,
            discardedEvents: [...state.gameState.discardedEvents, drawnEvent],
            phase: 'event'
          }
        }));
        
        console.log('Deck after draw:', remainingDeck.map(e => `${e.type} (${e.regionBack})`));
        console.log('=== END DRAW ===');
      },


      completeEvent: () => {
        const state = get();
        const currentEvent = state.gameState.currentEvent;
        if (currentEvent) {
          // apply event effect with current region
          const newGameState = currentEvent.effect(
            state.gameState, 
            currentEvent.currentRegion || currentEvent.regionBack
          );
          
          set({
            gameState: {
              ...newGameState,
              currentEvent: undefined,
              phase: 'company',
              turn: state.gameState.turn + 1
            }
          });
        }
      },

      resolveWindfall: (regionId: string) => {
        console.log(`Resolving windfall for region: ${regionId}`);
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (region) {
          console.log(`Windfall! Writers in ${regionId} and neighbors: ${region.neighbors.join(', ')} receive money`);
        }
        
        get().completeEvent();
      },

      resolveTurmoil: (regionId: string) => {
        console.log(`Resolving turmoil for region: ${regionId}`);
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (region) {
          // Simple turmoil effect - close one order in the region
          //need to revisit each event itself.
          if (region.orders.length > 0) {
            const orderToClose = region.orders[0];
            console.log(`Closing order: ${orderToClose} in ${regionId}`);
          }
        }
        
        get().completeEvent();
      },

      resolvePeace: (regionId: string, shape: ElephantShape = undefined) => {
        console.log(`Resolving peace event for region: ${regionId}, moving to ${shape} border`);
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (region) {
          // Peace event opens connecting orders and adds tower levels
          // For now, just move the elephant
          if (region.companyControlled) {
            // Elephant stays wholly within company-controlled region
            get().moveElephant(regionId, regionId, true);
          } else {
            // Elephant moves to the region and faces the appropriate border
            // For now, use the first neighbor as the facing region
            const facingRegion = region.neighbors.length > 0 ? region.neighbors[0] : regionId;
            get().moveElephant(regionId, facingRegion, false);
          }
          
          // TODO: Implement order opening and tower level logic
          console.log(`Peace event: opening orders between connected regions and modifying towers`);
        }
        
        get().completeEvent();
      },

      resolveCrisis: (regionId: string, crisisModifier: number = 0) => {
        console.log(`Resolving crisis event with modifier: ${crisisModifier}`);
        const state = get();
        const crisisType = get().getCrisisType();
        
        console.log(`Crisis type: ${crisisType}`);
        
        // Basic crisis resolution
        switch (crisisType) {
          case 'rebellion':
            console.log('Rebellion crisis: dominated region attacking its capital');
            // TODO: Implement rebellion logic
            break;
          case 'invasion':
            console.log('Invasion crisis: sovereign region attacking another');
            // TODO: Implement invasion logic  
            break;
          case 'attack_on_company':
            console.log('Attack on company: region attacking company-controlled territory');
            // TODO: Implement attack on company logic
            break;
        }
        
        // After crisis, elephant moves based on success/failure
        // For now, just move to top of stack (regionId)
        get().moveElephant(regionId, regionId, true);
        
        get().completeEvent();
      },

      resolveLeader: (regionId: string) => {
        console.log(`Resolving leader event for region: ${regionId}`);
        const state = get();
        const region = state.gameState.regions[regionId];
        const { elephant } = state.gameState;
        
        if (region) {
          if (!region.companyControlled && !region.towerHasFlag) {
            // Sovereign region - add tower level
            set((state) => ({
              gameState: {
                ...state.gameState,
                regions: {
                  ...state.gameState.regions,
                  [regionId]: {
                    ...region,
                    towerHeight: region.towerHeight + 1
                  }
                }
              }
            }));
          } else {
            // Dominated or company-controlled - cause rebellion
            console.log(`Leader causing rebellion in ${regionId}`);
            // This would trigger a rebellion crisis using the current elephant position
            const crisisModifier = 2; // Leader events have +2 modifier for rebellions
            get().resolveCrisis(regionId, crisisModifier);
            return; // Don't complete event here - crisis will handle it
          }
        }
        
        get().completeEvent();
      },
      handleEventResolution: () => {
        const state = get();
        const currentEvent = state.gameState.currentEvent;
        if (!currentEvent) return;

        const currentRegion = currentEvent.currentRegion || currentEvent.regionBack;

        // Check if this is an elephant-related event
        const elephantEvents: EventType[] = ['peace', 'crisis', 'leader'];
        if (elephantEvents.includes(currentEvent.type)) {
          get().resolveElephantEvent(currentEvent, currentRegion);
        } else {
          // Use existing resolvers for non-elephant events
          switch (currentEvent.type) {
            case 'windfall':
              get().resolveWindfall(currentRegion);
              break;
            case 'turmoil':
              get().resolveTurmoil(currentRegion);
              break;
            case 'foreign_invasion':
              get().resolveForeignInvasion(currentRegion);
              break;
            case 'shuffle':
              get().resolveShuffle(currentRegion);
              break;
            default:
              get().completeEvent();
          }
        }
      },

      resolveForeignInvasion: (regionId: string) => {
        console.log(`Resolving foreign invasion affecting: ${regionId}`);
        get().completeEvent();
      },

      resolveShuffle: (regionId: string) => {
        console.log(`Resolving shuffle event - moving elephant to: ${regionId}`);
        
        // Shuffle logic: take all discarded events and put them back in deck
        const state = get();
        const shuffledDeck = [...state.gameState.discardedEvents, ...state.gameState.eventDeck];
        
        // Simple shuffle
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            eventDeck: shuffledDeck,
            discardedEvents: []
          }
        }));
        
        get().completeEvent();
      },

      // Helper to get the next event's region (for UI display)
      getNextEventRegion: () => {
        const state = get();
        if (state.gameState.eventDeck.length > 0) {
          return state.gameState.eventDeck[0].regionBack;
        }
        return null;
      },

      updateRegion: (regionId: string, updates: Partial<Region>) => {
        set((state) => {
          const region = state.gameState.regions[regionId];
          if (!region) {
            console.error(`Region ${regionId} not found!`);
            return state;
          }

          return {
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [regionId]: {
                  ...region,
                  ...updates
                }
              }
            }
          };
        });
      },

      updateOrder: (orderId: string, updates: Partial<Order>) => {
        console.log(`Would update order ${orderId} with:`, updates);
        return get();
      },

      changePhase: (phase: GameState['phase']) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase
          }
        }));
      },

      resetGame: () => {
        set({
          gameState: initialState
        });
      },

      getRegion: (regionId: string) => {
        return get().gameState.regions[regionId];
      },

      getRegionOrders: (regionId: string) => {
        return getOrdersByRegion(regionId as any);
      }
    }),
    {
      name: 'joco-game-storage',
      partialize: (state) => ({ 
        gameState: state.gameState 
      }),
    }
  )
);