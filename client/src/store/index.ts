import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Region, Order, EventType, ElephantShape } from '../types/game';
import { initialState, REGION_IDS, getOrdersByRegion, getNeighboringRegions, getOrderById } from '../data/initialState';

import { rollStormDie, getRegionsByStormDirection, diceAnimation } from '../data/storm';
import { closeNorthernmostOrder, areAllOrdersClosed, startCascade } from '../utils/gameLogic';
import { getEventDefinition } from '../types/events';

interface GameStore {
  // State
  gameState: GameState;
  
  // Core Actions
  startEventPhase: () => void;
  drawEvent: () => void;
  completeEvent: () => void;
  updateRegion: (regionId: string, updates: Partial<Region>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrders: (updates: Record<string, Partial<Order>>) => void;
  changePhase: (phase: GameState['phase']) => void;
  resetGame: () => void;
  
  // Event Resolution
  resolveCurrentEvent: () => void;
  handleEventResolution: () => void;
  
  // Individual Event Resolvers
  resolveWindfall: (regionId: string) => void;
  resolveTurmoil: (regionId: string) => void;
  resolvePeace: (regionId: string, shape?: ElephantShape) => void;
  resolveCrisis: (regionId: string, crisisModifier?: number) => void;
  resolveLeader: (regionId: string) => void;
  resolveForeignInvasion: (regionId: string) => void;
  resolveShuffle: (regionId: string) => void;
  
  // Elephant Actions
  moveElephant: (tailRegion: string, headRegion: string, isWithinRegion?: boolean) => void;
  resolveElephantEvent: (eventId: string, currentRegion: string) => void;
  getCrisisType: () => 'rebellion' | 'invasion' | 'attack_on_company';
  
  // Storm Die & Animation
  startStormRoll: () => void;
  completeStormRoll: (stormRoll: any) => void;
  completeStormRollForeignInvasion: (stormRoll: any) => void;
  rollStormDie: () => any;
  startEventPhaseWithStorm: () => void;
  resolveStormEvents: () => void;
  cancelRollingState: () => void;
  recoverFromInterruptedRoll: () => void;
  
  // Cascade Testing
  triggerCascadeTest: (regionId: string) => void;
  resetAllOrders: () => void;
  setAllOrdersOpen: () => void;
  setAllOrdersClosed: () => void;
  
  // Helper functions
  drawNextEvent: () => void;
  getCurrentEvent: () => any;
  getCurrentEventRegion: () => string | null;
  getNextEventRegion: () => string | null;
  getRegion: (regionId: string) => Region | undefined;
  getRegionOrders: (regionId: string) => Order[];

  // Phase management
  canCompleteEventPhase: () => boolean;
  completeEventPhase: () => void;
  startCompanyPhase: () => void;
  isEventPhaseComplete: () => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: initialState,

      // Core Game Actions
      startEventPhase: () => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: 'event',
            eventPhaseComplete: false,
            eventsRemaining: state.gameState.storm.currentRoll?.value || 0
          }
        }));
      },

      canCompleteEventPhase: () => {
        const state = get();
        return state.gameState.eventsRemaining === 0 && !state.gameState.currentEventId;
      },

      drawEvent: () => {
        const state = get();
        const { eventDeck, discardedEvents } = state.gameState;
        
        console.log('=== DRAWING EVENT ===');
        console.log('Deck before draw:', eventDeck);
        console.log('Discarded before draw:', discardedEvents);
        
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
        const drawnEventId = currentDeck[0];
        const remainingDeck = currentDeck.slice(1);
        
        //current region is the regionBack of the NEXT event in deck
        let currentRegion: string;
        if (remainingDeck.length > 0) {
          const nextEventId = remainingDeck[0];
          const nextEvent = getEventDefinition(nextEventId);
          currentRegion = nextEvent.regionBack;
          console.log(`Next event in deck: ${nextEventId} (regionBack: ${currentRegion})`);
        } else {
          const drawnEvent = getEventDefinition(drawnEventId);
          currentRegion = drawnEvent.regionBack;
          console.log('No next event, using drawn event regionBack as fallback');
        }
        
        console.log(`Drawing: ${drawnEventId} with region: ${currentRegion}`);
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            currentEventId: drawnEventId,
            currentEventRegion: currentRegion,
            eventDeck: remainingDeck,
            discardedEvents: [...state.gameState.discardedEvents, drawnEventId],
            phase: 'event'
          }
        }));
      },

      // Event Resolution System
      resolveCurrentEvent: () => {
        const state = get();
        const currentEvent = get().getCurrentEvent();
        const currentRegion = get().getCurrentEventRegion();
        
        if (!currentEvent || !currentRegion) {
          console.error('Cannot resolve event: no current event or region');
          return;
        }
        
        console.log(`Resolving event: ${currentEvent.id} in region: ${currentRegion}`);
        
        try {
          // Apply the event effect
          const newGameState = currentEvent.effect(state.gameState, currentRegion);
          
          // Update state and complete the event
          set({
            gameState: {
              ...newGameState,
              currentEventId: undefined,
              currentEventRegion: undefined,
              phase: 'event',
              turn: state.gameState.turn + 1
            }
          });
        } catch (error) {
          console.error('Error resolving event:', error);
          // If there's an error, at least clear the current event
          set((state) => ({
            gameState: {
              ...state.gameState,
              currentEventId: undefined,
              currentEventRegion: undefined,
              phase: 'event'
            }
          }));
        }
      },

      handleEventResolution: () => {
        const state = get();
        const currentEvent = get().getCurrentEvent();
        const currentRegion = get().getCurrentEventRegion();
        
        if (!currentEvent || !currentRegion) return;

        // Route to the appropriate resolver based on event type
        switch (currentEvent.type) {
          case 'windfall':
            get().resolveWindfall(currentRegion);
            break;
          case 'turmoil':
            get().resolveTurmoil(currentRegion);
            break;
          case 'peace':
            get().resolvePeace(currentRegion, currentEvent.shape);
            break;
          case 'crisis':
            get().resolveCrisis(currentRegion, currentEvent.crisisModifier);
            break;
          case 'leader':
            get().resolveLeader(currentRegion);
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
      },

      completeEvent: () => {
        get().resolveCurrentEvent();
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
        
        // Check if all orders are already closed in this region
        if (areAllOrdersClosed(state.gameState, regionId)) {
          console.log(`All orders already closed in ${regionId}, starting cascade...`);
          const newState = startCascade(state.gameState, regionId);
          set({ gameState: newState });
        } else {
          // Close the northernmost open order
          const newState = closeNorthernmostOrder(state.gameState, regionId);
          set({ gameState: newState });
        }
        
        get().completeEvent();
      },

      resolvePeace: (regionId: string, shape?: ElephantShape) => {
        console.log(`Resolving peace event for region: ${regionId}, moving to ${shape} border`);
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (region) {
          if (region.companyControlled) {
            get().moveElephant(regionId, regionId, true);
          } else {
            const facingRegion = region.neighbors.length > 0 ? region.neighbors[0] : regionId;
            get().moveElephant(regionId, facingRegion, false);
          }
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
            break;
          case 'invasion':
            console.log('Invasion crisis: sovereign region attacking another');
            break;
          case 'attack_on_company':
            console.log('Attack on company: region attacking company-controlled territory');
            break;
        }
        
        // After crisis, elephant moves based on success/failure
        get().moveElephant(regionId, regionId, true);
        
        get().completeEvent();
      },

      resolveLeader: (regionId: string) => {
        console.log(`Resolving leader event for region: ${regionId}`);
        const state = get();
        const region = state.gameState.regions[regionId];
        
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
            get().resolveCrisis(regionId, 2);
            return;
          }
        }
        
        get().completeEvent();
      },

      resolveForeignInvasion: (regionId: string) => {
        console.log(`Resolving foreign invasion affecting: ${regionId}`);
        
        // Roll storm die for foreign invasion
        const stormRoll = get().rollStormDie();
        let invasionRegions: string[] = [];
        
        if (stormRoll.direction === 'none') {
          invasionRegions = [regionId];
        } else {
          invasionRegions = getRegionsByStormDirection(stormRoll.direction);
        }
        
        console.log(`Foreign invasion in regions: ${invasionRegions.join(', ')}`);
        
        // Basic invasion resolution
        invasionRegions.forEach(invasionRegionId => {
          const attackRoll = Math.floor(Math.random() * 6) + 1;
          console.log(`Attack strength in ${invasionRegionId}: ${attackRoll}`);
        });
        
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
        
        get().moveElephant(regionId, regionId, true);
        
        get().completeEvent();
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

      resolveElephantEvent: (eventId: string, currentRegion: string) => {
        const event = getEventDefinition(eventId);
        
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

      // Storm Die & Animation System
      startStormRoll: () => {
        console.log('Starting storm die roll animation...');
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            storm: {
              ...state.gameState.storm,
              isRolling: true,
              currentRoll: undefined
            }
          }
        }));
        
        // Safety timeout
        // setTimeout(() => {
        //   const state = get();
        //   if (state.gameState.storm.isRolling) {
        //     console.warn('Rolling state timeout - cancelling');
        //     get().cancelRollingState();
        //   }
        // }, 10000);
      },

      completeStormRoll: (stormRoll: any) => {
        console.log(`Storm die roll completed: ${stormRoll.value} events, direction: ${stormRoll.direction}`);
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            storm: {
              ...state.gameState.storm,
              isRolling: false,
              currentRoll: stormRoll
            },
            eventsRemaining: stormRoll.value
          }
        }));
      },

      completeStormRollForeignInvasion: (stormRoll: any) => {
        //TODO. finish for ForeignInvasion
        console.log(`Storm die roll completed: ${stormRoll.value} events, direction: ${stormRoll.direction}`);
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            storm: {
              ...state.gameState.storm,
              isRolling: false,
              currentRoll: stormRoll
            },
          }
        }));
      },

      rollStormDie: () => {
        const stormRoll = rollStormDie();
        get().startStormRoll();
        
        const animationDuration = 1500;
        
        setTimeout(() => {
          const currentState = get();
          if (currentState.gameState.storm.isRolling) {
            get().completeStormRollForeignInvasion(stormRoll);
          }
        }, animationDuration);
        
        return stormRoll;
      },

      startEventPhaseWithStorm: () => {
        const stormRoll = rollStormDie();
        get().startStormRoll();
        
        const animationDuration = 1500;
        
        setTimeout(() => {
          const currentState = get();
          if (currentState.gameState.storm.isRolling) {
            get().completeStormRoll(stormRoll);
          }
        }, animationDuration);
        
        return stormRoll;
      },

      resolveStormEvents: () => {
        const state = get();
        
        if (state.gameState.eventsRemaining <= 0) {
          console.log('No events remaining to resolve');
          return;
        }

        console.log(`Resolving event ${state.gameState.eventsRemaining} of ${state.gameState.storm.currentRoll?.value}`);
        
        get().drawEvent();
      },

      cancelRollingState: () => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            storm: {
              ...state.gameState.storm,
              isRolling: false
            }
          }
        }));
        console.log('Rolling state cancelled');
      },

      recoverFromInterruptedRoll: () => {
        const state = get();
        if (state.gameState.storm.isRolling) {
          console.log('Recovering from interrupted roll state...');
          get().cancelRollingState();
        }
      },

      // Cascade Testing
      triggerCascadeTest: (regionId: string) => {
        console.log(`=== MANUAL CASCADE TEST IN ${regionId} ===`);
        const state = get();
        
        if (areAllOrdersClosed(state.gameState, regionId)) {
          console.log(`All orders already closed in ${regionId}, starting cascade...`);
          const newState = startCascade(state.gameState, regionId);
          set({ gameState: newState });
        } else {
          console.log(`Not all orders closed in ${regionId}. Close all orders first to test cascade.`);
        }
      },

      resetAllOrders: () => {
        const state = get();
        const updatedOrders = { ...state.gameState.orders };
        
        Object.keys(updatedOrders).forEach(orderId => {
          updatedOrders[orderId] = {
            ...updatedOrders[orderId],
            open: true
          };
        });

        set({
          gameState: {
            ...state.gameState,
            orders: updatedOrders
          }
        });
        console.log('All orders reset to open');
      },

      setAllOrdersOpen: () => {
        const state = get();
        const updatedOrders = { ...state.gameState.orders };
        
        Object.keys(updatedOrders).forEach(orderId => {
          updatedOrders[orderId] = {
            ...updatedOrders[orderId],
            open: true
          };
        });

        set({
          gameState: {
            ...state.gameState,
            orders: updatedOrders
          }
        });
        console.log('All orders set to open');
      },

      setAllOrdersClosed: () => {
        const state = get();
        const updatedOrders = { ...state.gameState.orders };
        
        Object.keys(updatedOrders).forEach(orderId => {
          updatedOrders[orderId] = {
            ...updatedOrders[orderId],
            open: false
          };
        });

        set({
          gameState: {
            ...state.gameState,
            orders: updatedOrders
          }
        });
        console.log('All orders set to closed');
      },

      // Helper functions
      getCurrentEvent: () => {
        const state = get();
        // console.log("first ", !!(state.gameState.eventsRemaining <= 0));

        // console.log("2nd ", !!(state.gameState.phase!== 'event'));

        // console.log("3 ", !!state.gameState.currentEventId);
        if (!state.gameState.currentEventId) return null;
        
        try {
          return getEventDefinition(state.gameState.currentEventId);
        } catch (error) {
          console.error('Error getting current event:', error);
          return null;
        }
      },

      getCurrentEventRegion: () => {
        const state = get();
        return state.gameState.currentEventRegion || null;
      },

      getNextEventRegion: () => {
        const state = get();
        if (state.gameState.eventDeck.length > 0) {
          const nextEventId = state.gameState.eventDeck[0];
          const nextEvent = getEventDefinition(nextEventId);
          return nextEvent.regionBack;
        }
        return null;
      },

      getRegion: (regionId: string) => {
        return get().gameState.regions[regionId];
      },

      getRegionOrders: (regionId: string) => {
        return getOrdersByRegion(regionId as any);
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
      updateOrders: (updates: Record<string, Partial<Order>>) => {
        set((state) => {
          const updatedOrders = { ...state.gameState.orders };
          
          Object.entries(updates).forEach(([orderId, orderUpdates]) => {
            if (updatedOrders[orderId]) {
              updatedOrders[orderId] = {
                ...updatedOrders[orderId],
                ...orderUpdates
              };
            }
          });

          return {
            gameState: {
              ...state.gameState,
              orders: updatedOrders
            }
          };
        });
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
      drawNextEvent: () => {
        const state = get();
        
        if (state.gameState.eventsRemaining <= 0) {
          console.log('No events remaining in this phase');
          return;
        }

        console.log(`Drawing next event (${state.gameState.eventsRemaining} remaining)`);
        
        // Decrement events remaining
        set((state) => ({
          gameState: {
            ...state.gameState,
            eventsRemaining: state.gameState.eventsRemaining - 1
          }
        }));

        get().drawEvent();
      },
      // In the store implementation, add these actions:
      completeEventPhase: () => {
        console.log("trying to finish event phase");
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: 'company',
            eventPhaseComplete: true
          }
        }));
      },


      startCompanyPhase: () => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: 'company'
          }
        }));
      },

      isEventPhaseComplete: () => {
        const state = get();
        return state.gameState.eventsRemaining <= 0 && !state.gameState.currentEventId;
      },
    }),
    {
      name: 'joco-game-storage',
      partialize: (state) => ({ 
        gameState: {
          ...state.gameState,
          storm: {
            ...state.gameState.storm,
            isRolling: false
          }
        }
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (state) {
            setTimeout(() => {
              state.recoverFromInterruptedRoll();
            }, 100);
          }
        };
      },
    }
  )
);