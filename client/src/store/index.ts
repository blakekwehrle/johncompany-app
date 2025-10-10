import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Region, Order, Event, ElephantShape, EventType, StormDieSide } from '../types/game';
import { initialState, getOrdersByRegion, getNeighboringRegions, getOrderById, initialEventDeck, REGION_IDS } from '../data/initialState';
import { closeNorthernmostOrder, areAllOrdersClosed, cascadeCloseOrders, startCascade } from '../utils/gameLogic';
import { getRegionsByStormDirection, rollStormDie } from '../data/storm';

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
  triggerTurmoilTest:(regionId: string)=> void;
  resetAllOrders: () => void;
  setAllOrdersOpen: () => void;
  // Helper functions
  getRegion: (regionId: string) => Region | undefined;
  getRegionOrders: (regionId: string) => Order[];
  getNextEventRegion: () => string | null;

  // Elephant actions
  moveElephant: (tailRegion: string, headRegion: string, isWithinRegion?: boolean) => void;
  resolveElephantEvent: (event: Event, currentRegion: string) => void;
  
  // Helper functions
  getCrisisType: () => 'rebellion' | 'invasion' | 'attack_on_company';
  rollStormDie: () => StormDieSide;
  startEventPhaseWithStorm: () => void;
  resolveStormEvents: () => void;
  startStormRoll: () => void;
  completeStormRoll: (stormRoll: StormDieSide) => void;
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
      startStormRoll: () => {
        console.log('Starting storm die roll animation...');
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            storm: {
              ...state.gameState.storm,
              isRolling: true,
              currentRoll: undefined // Clear previous roll during animation
            }
          }
        }));
      },

      // Complete the storm roll after animation
      completeStormRoll: (stormRoll: StormDieSide) => {
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

      // Updated rollStormDie with animation
      rollStormDie: () => {
        const stormRoll = rollStormDie();
        get().startStormRoll();
        
        // Simulate animation duration (you can adjust this)
        const animationDuration = 1500; // 1.5 seconds
        
        setTimeout(() => {
          get().completeStormRoll(stormRoll);
        }, animationDuration);
        
        return stormRoll;
      },

      // Updated startEventPhaseWithStorm with animation
      startEventPhaseWithStorm: () => {
        const stormRoll = get().rollStormDie();
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: 'event',
            eventsRemaining: stormRoll.value
          }
        }));
        
        // Wait for animation to complete before starting events
        setTimeout(() => {
          if (stormRoll.value > 0) {
            get().resolveStormEvents();
          } else {
            console.log('No events to resolve from storm die');
          }
        }, 1600); // Slightly longer than animation duration
      },
      // Resolve events from storm die roll
      resolveStormEvents: () => {
        const state = get();
        
        if (state.gameState.eventsRemaining <= 0) {
          console.log('No events remaining to resolve');
          return;
        }

        console.log(`Resolving event ${state.gameState.eventsRemaining} of ${state.gameState.storm.currentRoll?.value}`);
        
        // Draw and resolve one event
        get().drawEvent();
        
        // Note: The event resolution will be handled by the existing handleEventResolution
        // After the event is resolved, we'll decrement eventsRemaining in completeEvent
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
        if (state.gameState.currentEvent) {
          const currentEvent = state.gameState.currentEvent;
          
          // Apply the event effect with the current region
          const newGameState = currentEvent.effect(
            state.gameState, 
            currentEvent.currentRegion || currentEvent.regionBack
          );
          
          // Decrement events remaining
          const eventsRemaining = Math.max(0, state.gameState.eventsRemaining - 1);
          
          set({
            gameState: {
              ...newGameState,
              currentEvent: undefined,
              eventsRemaining: eventsRemaining,
              // Only change phase back to company when no events remain
              phase: eventsRemaining === 0 ? 'company' : 'event',
              turn: eventsRemaining === 0 ? state.gameState.turn + 1 : state.gameState.turn
            }
          });
          
          // If there are more events to resolve, draw the next one
          if (eventsRemaining > 0) {
            setTimeout(() => {
              get().resolveStormEvents();
            }, 100); // Small delay for better UX
          }
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
        console.log('Resolving foreign invasion with storm die roll');
        const state = get();
        
        // Roll storm die for foreign invasion
        const stormRoll = get().rollStormDie();
        let invasionRegions: string[] = [];
        
        if (stormRoll.direction === 'none') {
          // Use the region from the event (regionId) if storm die is 'none'
          invasionRegions = [regionId];
        } else {
          // Use the regions from the storm direction
          invasionRegions = getRegionsByStormDirection(stormRoll.direction);
        }
        
        console.log(`Foreign invasion in regions: ${invasionRegions.join(', ')}`);
        
        // Resolve invasion for each region
        invasionRegions.forEach(invasionRegionId => {
          // Simulate invasion resolution
          console.log(`Invasion in ${invasionRegionId}: Rolling attack die`);
          const attackRoll = Math.floor(Math.random() * 6) + 1; // 1d6
          console.log(`Attack strength: ${attackRoll}`);
          
          // Basic invasion logic - you can expand this later
          const region = state.gameState.regions[invasionRegionId];
          if (region) {
            if (region.companyControlled) {
              console.log(`Company defense in ${invasionRegionId}`);
              // Company defense logic would go here
            } else {
              console.log(`Invasion against sovereign region ${invasionRegionId}`);
              // Sovereign region invasion logic would go here
            }
          }
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
      },
      
      triggerTurmoilTest: (regionId: string) => {
        console.log(`=== MANUAL Turmoil TEST IN ${regionId} ===`);
        const state = get();
        state.resolveTurmoil(regionId)
      },

      resetAllOrders: () => {
        const state = get();
        const updatedOrders = { ...state.gameState.orders };
        
        // Reset all orders to their initial open state
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
    }),
    {
      name: 'joco-game-storage',
      partialize: (state) => ({ 
        gameState: {
          ...state.gameState,
          storm: {
            ...state.gameState.storm,
            isRolling: false // Always reset to false when saving
          }
        }
      }),
    }
  )
);