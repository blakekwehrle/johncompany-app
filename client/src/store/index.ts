import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Region, Order, ElephantShape, ElephantState, StormDieSide } from '../types/game';
import { getInitialState, createShuffledEventDeck } from '../data/initialState';
import type { ScenarioPreset } from '../data/initialState';

import { rollStormDie, getRegionsByStormDirection } from '../data/storm';
import { closeNorthernmostOrder, areAllOrdersClosed, startCascade } from '../utils/gameLogic';
import { getEventDefinition } from '../types/events';

interface GameStore {
  // State
  gameState: GameState;
  currentScenario: ScenarioPreset;
  
  // Core Actions
  startEventPhase: () => void;
  drawEvent: () => void;
  completeEvent: () => void;
  updateRegion: (regionId: string, updates: Partial<Region>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrders: (updates: Record<string, Partial<Order>>) => void;
  changePhase: (phase: GameState['phase']) => void;
  resetGame: (scenario?: ScenarioPreset) => void;
  setScenario: (scenario: ScenarioPreset) => void;
  
  // Event Resolution
  resolveCurrentEvent: () => void;
  handleEventResolution: () => void;
  
  // Individual Event Resolvers
  resolveWindfall: (regionId: string) => void;
  resolveTurmoil: (regionId: string) => void;
  resolvePeace: (regionId: string, shape?: ElephantShape) => void;
  resolveCrisis: (crisisModifier?: number) => void;
  determineCrisisType: (attackerRegion: Region, defenderRegion: Region) => string;
  resolveInvasionCrisis: (attackerRegionId: string, defenderRegionId:string, crisisModifier: number) => void;
  handleSuccessfulInvasion:(attackerRegionId: string, defenderRegionId:string)=> void;
  resolveRebellionCrisis: (attackerRegionId: string, defenderRegionId:string, crisisModifier: number) => void;
  resolveAdditionalRebellion: (regionId: string) => void;
  resolveCompanyAttackCrisis: (attackerRegionId: string, defenderRegionId:string, crisisModifier: number) => void;
  resolveLeader: (regionId: string) => void;
  resolveForeignInvasion: (regionId: string) => void;
  resolveShuffle: (regionId: string) => void;
  resolveCompanyAttack: (regionId: string, strengthModifier: number) => void;
  resolveRebellion: (regionId: string, strengthModifier: number) => void;
  resolveRegionLoss: (regionId: string) => void;

  // Elephant Actions
  moveElephant: (tailRegion: string, headRegion: string) => void;
  moveElephantToTopOfStack:() => void;
  moveElephantWithImperialAmbitions:(attackerRegionId: string) => void;
  resolveElephantPeace: () => void;
  resolveElephantMarch: (regionId: string, shape?: ElephantShape) => void;
  getCrisisType: () => 'rebellion' | 'invasion' | 'attack_on_company';
  getNextClockwisePosition: (regionId: string, elephantState: ElephantState) => ElephantState;
  getFullyFormedOrNextPosition: (regionId: string) => ElephantState;
  getEmpireStrength: (regionId: string) => number;
  // Storm Die & Animation
  setStormDieResult: (result: StormDieSide) => void;
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

  //for undo ability
  saveHistory:() => void;
  undoEvent:() => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: getInitialState('1710'),
      currentScenario: '1710',

      setScenario: (scenario: ScenarioPreset) => {
        set({ currentScenario: scenario });
      },

    saveHistory: () => {
      const state = get();
      const snapshot = structuredClone({
  ...state.gameState,
  history: [],
});
      const MAX_HISTORY = 5;
      const newHistory = [...state.gameState.history, snapshot];
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      set({
        gameState: {
          ...state.gameState,
          history: newHistory
        }
      });
    },

  undoEvent: () => {
    const state = get();

    if (state.gameState.history.length === 0) {
      console.warn("No history to undo");
      return;
    }
    const previousState =
    state.gameState.history[state.gameState.history.length - 1];
    set({
      gameState: {
        ...structuredClone(previousState),
        history: state.gameState.history.slice(0, -1)
      }
    });
  },
      // Core Game Actions
      startEventPhase: () => {
  set((state) => ({
    gameState: {
      ...state.gameState,
      phase: 'event',
      eventsRemaining: 0,
      eventPhaseComplete: false,
      stormDieConfirmed: false,
      history: [],  
      storm: {
        ...state.gameState.storm,
        isRolling: false,
        currentRoll: undefined
      }
    }
  }));
},

      

      canCompleteEventPhase: () => {
        const state = get();
        return state.gameState.eventsRemaining === 0 && !state.gameState.currentEventId && state.gameState.stormDieConfirmed;
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

  // keep whatever history is currently in store
  const history = state.gameState.history;

  try {
    const newGameState = currentEvent.effect(state.gameState, currentRegion);

    set({
      gameState: {
        ...newGameState,
        history, // preserve
        currentEventId: undefined,
        currentEventRegion: undefined,
        phase: 'event',
        turn: state.gameState.turn + 1
      }
    });
  } catch (error) {
    console.error('Error resolving event:', error);
    set({
      gameState: {
        ...state.gameState,
        history, //preserve
        currentEventId: undefined,
        currentEventRegion: undefined,
        phase: 'event'
      }
    });
  }
},

      handleEventResolution: () => {
  const state = get().gameState;
  const currentEvent = get().getCurrentEvent();
  const currentRegion = get().getCurrentEventRegion();

  if (!currentEvent || !currentRegion) return;

  // SAVE UNDO SNAPSHOT ONCE PER EVENT (max 5)
  const MAX_HISTORY = 5;
  const last = state.history[state.history.length - 1];

  // Only push if we haven't already saved a snapshot for THIS event instance
  const alreadySnapshottedThisEvent =
    last?.currentEventId === state.currentEventId &&
    last?.currentEventRegion === state.currentEventRegion &&
    last?.turn === state.turn;

  if (!alreadySnapshottedThisEvent) {
    const snapshot = structuredClone({
  ...state,
  history: [],
});
    const newHistory = [...state.history, snapshot].slice(-MAX_HISTORY);

    set({
      gameState: {
        ...state,
        history: newHistory
      }
    });
  }

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
      get().resolveCrisis(currentEvent.crisisModifier);
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
        console.log(`Elephant Head: ${state.gameState.elephant.headRegion} and Elephant Tail: ${state.gameState.elephant.tailRegion}`)
        const region = state.gameState.regions[regionId];
        get().resolveElephantPeace();
        if (region) {
          if (region.companyControlled) {
            get().moveElephant(regionId, regionId);
          } else {
            const facingRegion = region.neighbors.length > 0 ? region.neighbors[0] : regionId;
            get().moveElephant(regionId, facingRegion);
          }
          console.log(`Peace event: opening orders between connected regions and modifying towers`);
        }
        
        get().completeEvent();
      },

      resolveLeader: (regionId: string) => {
        console.log(`Resolving leader event for region: ${regionId}`);
        const state = get();
        const region = state.gameState.regions[regionId];
        const currentEvent = get().getCurrentEvent();
        
        if (!region) {
          console.error(`Region ${regionId} not found!`);
          get().completeEvent();
          return;
        }

        const strengthModifier = currentEvent?.strength ? parseInt(currentEvent.strength) : 0;
        
        if (region.companyControlled || (region.towerHasFlag && !region.towerHasFlagStar)) {
          // dominated or company-controlled - rebellion
          console.log(`Leader causing rebellion in ${regionId} with modifier: ${strengthModifier}`);
          
          if (region.companyControlled) {
            get().resolveCompanyAttack(regionId, strengthModifier);
          } else {
            get().resolveRebellion(regionId, strengthModifier);
          }
        } else {
          console.log(`Leader strengthening sovereign region ${regionId}`);
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
          get().completeEvent();
        }
      },

      resolveRebellion: (regionId: string, modifier: number) => {
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (!region.towerHasFlag || region.towerHasFlagStar) {
          console.error(`Region ${regionId} is not dominated, cannot rebel`);
          get().completeEvent();
          return;
        }

        const flagColor = region.flagColor;
        const capital = Object.values(state.gameState.regions).find(r => 
          r.flagColor === flagColor && r.towerHasFlagStar
        );

        if (!capital) {
          console.error(`Could not find capital for dominated region ${regionId}`);
          get().completeEvent();
          return;
        }

        const attackerStrength = region.towerHeight + modifier;
        const defenderStrength = capital.towerHeight;

        console.log(`Rebellion: ${regionId} (strength: ${attackerStrength}) vs ${capital.id} (strength: ${defenderStrength})`);

        if (attackerStrength > defenderStrength) {
          console.log(`Rebellion successful! ${regionId} becomes sovereign`);
          
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [regionId]: {
                  ...region,
                  towerHasFlag: false,
                  flagColor: 'silver'
                }
              }
            }
          }));

          const updatedOrders = { ...state.gameState.orders };
          const ordersToClose = state.gameState.regions[regionId].orders;
          
          let allOrdersClosed = true;
          ordersToClose.forEach(orderId => {
            if (updatedOrders[orderId] && updatedOrders[orderId].open) {
              updatedOrders[orderId] = {
                ...updatedOrders[orderId],
                open: false
              };
              allOrdersClosed = false;
            }
          });

          if (allOrdersClosed) {
            console.log(`All orders already closed in ${regionId}, starting cascade...`);
            const newState = startCascade(state.gameState, regionId);
            set({ gameState: newState });
          } else {
            set((state) => ({
              gameState: {
                ...state.gameState,
                orders: updatedOrders
              }
            }));
          }

        } else {
          console.log(`Rebellion failed! Removing tower level from ${capital.id}`);
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [capital.id]: {
                  ...capital,
                  towerHeight: Math.max(0, capital.towerHeight - 1)
                }
              }
            }
          }));
        }

        get().completeEvent();
      },

      resolveCompanyAttack: (regionId: string, modifier: number) => {
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (!region.companyControlled) {
          console.error(`Region ${regionId} is not company controlled`);
          get().completeEvent();
          return;
        }

        // Calculate attack strength: modifier + unrest
        const attackStrength = modifier + region.unrest;
        console.log(`Attack on Company in ${regionId}: strength ${attackStrength} (modifier: ${modifier} + unrest: ${region.unrest})`);

        // simple version for now, will use army defense 
        // for now: if attack strength > 0, region is lost
        if (attackStrength > 0) {
          console.log(`Company loses control of ${regionId}`);
          get().resolveRegionLoss(regionId);
        } else {
          console.log(`Attack on Company in ${regionId} defended successfully`);
          // Clear unrest 
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [regionId]: {
                  ...region,
                  unrest: 0
                }
              }
            }
          }));
        }

        const otherUnrestRegions = Object.values(state.gameState.regions).filter(r => 
          r.companyControlled && r.unrest > 0 && r.id !== regionId
        );

        otherUnrestRegions.forEach(unrestRegion => {
          console.log(`Additional rebellion in ${unrestRegion.id} due to unrest`);
            //just logging for now, but additional rebellions would occur in these regions.
        });

        get().completeEvent();
      },

      resolveRegionLoss: (regionId: string) => {
        const state = get();
        const region = state.gameState.regions[regionId];
        
        console.log(`Region loss in ${regionId}`);
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            regions: {
              ...state.gameState.regions,
              [regionId]: {
                ...region,
                companyControlled: false,
                unrest: 0,
                towerHeight: 1,
                towerHasFlag: false,
                towerHasFlagStar: false
              }
            }
          }
        }));

        const updatedOrders = { ...state.gameState.orders };
        const ordersToClose = state.gameState.regions[regionId].orders;
        
        ordersToClose.forEach(orderId => {
          if (updatedOrders[orderId]) {
            updatedOrders[orderId] = {
              ...updatedOrders[orderId],
              open: false
            };
          }
        });

        set((state) => ({
          gameState: {
            ...state.gameState,
            orders: updatedOrders
          }
        }));

        // prompt to lower company standing 
        console.log(`Company Standing lowered due to region loss`);
      },
      resolveCrisis: (crisisModifier: number = 0) => {
        console.log(`Resolving crisis event with modifier: ${crisisModifier}`);
        const state = get();
        const { elephant } = state.gameState;
        const attackerRegionId = elephant.tailRegion;
        const defenderRegionId = elephant.headRegion;
        
        console.log(`Crisis: Elephant at ${attackerRegionId}-${defenderRegionId} border`);
        
        const attackerRegion = state.gameState.regions[attackerRegionId];
        const defenderRegion = state.gameState.regions[defenderRegionId];
        
        if (!attackerRegion || !defenderRegion) {
          console.error('Invalid elephant position for crisis');
          get().completeEvent();
          return;
        }

        const crisisType = get().determineCrisisType(attackerRegion, defenderRegion);
        console.log(`Crisis type: ${crisisType}`);
        
        switch (crisisType) {
          case 'invasion':
            get().resolveInvasionCrisis(attackerRegionId, defenderRegionId, crisisModifier);
            break;
          case 'rebellion':
            get().resolveRebellionCrisis(attackerRegionId, defenderRegionId, crisisModifier);
            break;
          case 'attack_on_company':
            get().resolveCompanyAttackCrisis(attackerRegionId, defenderRegionId, crisisModifier);
            break;
          default:
            console.error('Unknown crisis type');
            get().completeEvent();
        }
      },

      determineCrisisType: (attackerRegion: Region, defenderRegion: Region) => {
        const state = get();
        
        if (state.gameState.elephant.tailRegion === state.gameState.elephant.headRegion) {
          return 'attack_on_company';
        }
        
        if (defenderRegion.companyControlled) {
          return 'attack_on_company';
        }
        
        // attacker is dominated by defender
        if (attackerRegion.towerHasFlag && !attackerRegion.towerHasFlagStar && 
            attackerRegion.flagColor === defenderRegion.flagColor && defenderRegion.towerHasFlagStar) {
          return 'rebellion';
        }
        
        // otherwise
        return 'invasion';
      },

      resolveInvasionCrisis: (attackerRegionId: string, defenderRegionId: string, modifier: number) => {
        const state = get();
        const attackerRegion = state.gameState.regions[attackerRegionId];
        //const defenderRegion = state.gameState.regions[defenderRegionId];
        
        const attackerStrength = get().getEmpireStrength(attackerRegionId) + modifier;
        const defenderStrength = get().getEmpireStrength(defenderRegionId);
        
        console.log(`Invasion: ${attackerRegionId} (strength: ${attackerStrength}) vs ${defenderRegionId} (strength: ${defenderStrength})`);
        
        if (attackerStrength > defenderStrength) {
          console.log(`Invasion successful! ${attackerRegionId} conquers ${defenderRegionId}`);
          get().handleSuccessfulInvasion(attackerRegionId, defenderRegionId);
        } else {
          console.log(`Invasion failed! Removing tower level from ${attackerRegionId}`);
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [attackerRegionId]: {
                  ...attackerRegion,
                  towerHeight: Math.max(0, attackerRegion.towerHeight - 1)
                }
              }
            }
          }));
          
          get().moveElephantToTopOfStack();
        }
        
        get().completeEvent();
      },

      resolveRebellionCrisis: (attackerRegionId: string, defenderRegionId: string, modifier: number) => {
        const state = get();
        const attackerRegion = state.gameState.regions[attackerRegionId];
        const defenderRegion = state.gameState.regions[defenderRegionId];
        
        const attackerStrength = attackerRegion.towerHeight + modifier;
        const defenderStrength = defenderRegion.towerHeight;
        
        console.log(`Rebellion: ${attackerRegionId} (strength: ${attackerStrength}) vs ${defenderRegionId} (strength: ${defenderStrength})`);
        
        if (attackerStrength > defenderStrength) {
          console.log(`Rebellion successful! ${attackerRegionId} becomes sovereign`);
          
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [attackerRegionId]: {
                  ...attackerRegion,
                  towerHasFlag: false,
                  flagColor: 'silver'
                }
              }
            }
          }));
          
          const updatedOrders = { ...state.gameState.orders };
          const ordersToClose = state.gameState.regions[attackerRegionId].orders;
          
          let allOrdersClosed = true;
          ordersToClose.forEach(orderId => {
            if (updatedOrders[orderId] && updatedOrders[orderId].open) {
              updatedOrders[orderId] = {
                ...updatedOrders[orderId],
                open: false
              };
              allOrdersClosed = false;
            }
          });
          
          if (allOrdersClosed) {
            console.log(`All orders already closed in ${attackerRegionId}, starting cascade...`);
            const newState = startCascade(state.gameState, attackerRegionId);
            set({ gameState: newState });
          } else {
            set((state) => ({
              gameState: {
                ...state.gameState,
                orders: updatedOrders
              }
            }));
          }
        } else {
          console.log(`Rebellion failed! Removing tower level from ${defenderRegionId}`);
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [defenderRegionId]: {
                  ...defenderRegion,
                  towerHeight: Math.max(0, defenderRegion.towerHeight - 1)
                }
              }
            }
          }));
        }
        
        get().moveElephantToTopOfStack();
        get().completeEvent();
      },

      resolveCompanyAttackCrisis: (attackerRegionId: string, defenderRegionId: string, modifier: number) => {
        const state = get();
        const defenderRegion = state.gameState.regions[defenderRegionId];
        

        // Calculate attack strength: modifier + unrest
        const attackStrength = modifier + defenderRegion.unrest;
        console.log(`Attack on Company in ${defenderRegionId}: strength ${attackStrength} (modifier: ${modifier} + unrest: ${defenderRegion.unrest})`);
        console.log(`Attacker: ${attackerRegionId}`);
        // simple version - also needs army.
        //for now just using '2' for testing
        const defenseSuccessful = attackStrength <= 2;
        
        if (!defenseSuccessful) {
          console.log(`Company loses control of ${defenderRegionId}`);
          get().resolveRegionLoss(defenderRegionId);
          
          const otherUnrestRegions = Object.values(state.gameState.regions).filter(r => 
            r.companyControlled && r.unrest > 0 && r.id !== defenderRegionId
          );
          
          otherUnrestRegions.forEach(unrestRegion => {
            console.log(`Additional rebellion in ${unrestRegion.id} due to unrest`);
            get().resolveAdditionalRebellion(unrestRegion.id);
          });
        } else {
          console.log(`Attack on Company in ${defenderRegionId} defended successfully`);
          // clear unrest
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [defenderRegionId]: {
                  ...defenderRegion,
                  unrest: 0
                }
              }
            }
          }));
        }
        
        get().completeEvent();
      },

      resolveAdditionalRebellion: (regionId: string) => {
        const state = get();
        const region = state.gameState.regions[regionId];
        
        const attackStrength = region.unrest; 
        
        // again simple version just using '1' here
        const defenseSuccessful = attackStrength <= 1; // 
        
        if (!defenseSuccessful) {
          console.log(`Additional rebellion successful! Company loses ${regionId}`);
          get().resolveRegionLoss(regionId);
        } else {
          console.log(`Additional rebellion in ${regionId} defended successfully`);
          set((state) => ({
            gameState: {
              ...state.gameState,
              regions: {
                ...state.gameState.regions,
                [regionId]: {
                  ...region,
                  unrest: 0
                }
              }
            }
          }));
        }
      },

      getEmpireStrength: (regionId: string) => {
        const state = get();
        const region = state.gameState.regions[regionId];
        
        if (!region.towerHasFlag || !region.flagColor) {
          return region.towerHeight;
        }
        
        const empireRegions = Object.values(state.gameState.regions).filter(r => 
          r.flagColor === region.flagColor
        );
        
        return empireRegions.reduce((total, r) => total + r.towerHeight, 0);
      },

      // successful invasion aka empire creation/growth
      handleSuccessfulInvasion: (attackerRegionId: string, defenderRegionId: string) => {
        const state = get();
        const attackerRegion = state.gameState.regions[attackerRegionId];
        const defenderRegion = state.gameState.regions[defenderRegionId];
        
        // Remove any flag from defender
        const updatedRegions = { ...state.gameState.regions };
        
        updatedRegions[defenderRegionId] = {
          ...defenderRegion,
          towerHasFlag: true,
          towerHasFlagStar: false, // Defender becomes dominated
          flagColor: attackerRegion.flagColor || attackerRegionId // Use attacker's flag color or create new
        };
        
        // If defender was a capital, shatter the empire (remove all matching flags)
        if (defenderRegion.towerHasFlagStar) {
          Object.values(state.gameState.regions).forEach(region => {
            if (region.flagColor === defenderRegion.flagColor && region.id !== defenderRegionId) {
              updatedRegions[region.id] = {
                ...region,
                towerHasFlag: false,
                towerHasFlagStar: false,
                flagColor: 'silver'
              };
            }
          });
        }
        
        // If attacker doesn't have a flag, make it a capital
        if (!attackerRegion.towerHasFlag) {
          updatedRegions[attackerRegionId] = {
            ...attackerRegion,
            towerHasFlag: false,
            towerHasFlagStar: true,
            flagColor: attackerRegion.flagColor || attackerRegionId
          };
        }
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            regions: updatedRegions
          }
        }));
        
        get().moveElephantWithImperialAmbitions(attackerRegionId);
      },

      moveElephantToTopOfStack: () => {
        const nextEventRegion = get().getNextEventRegion();
        
        if (nextEventRegion) {
          console.log(`Moving elephant to top of stack: ${nextEventRegion}`);
          get().resolveElephantMarch(nextEventRegion, 'circle'); // Default shape
        } else {
          console.log('No next event region found for elephant movement');
        }
      },

      // Move elephant with Imperial Ambitions (to successful attacker's capital)
      moveElephantWithImperialAmbitions: (capitalRegionId: string) => {
        console.log(`Imperial Ambitions: Moving elephant to successful capital ${capitalRegionId}`);
        
        //const capitalRegion = state.gameState.regions[capitalRegionId];
        const currentEvent = get().getCurrentEvent();
        const shape = currentEvent?.shape || 'circle'; 
        
        // For Imperial Ambitions, elephant moves to capital and then marches from there
        get().resolveElephantMarch(capitalRegionId, shape);
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

        get().resolveElephantMarch(regionId, "circle")
        
        get().completeEvent();
      },

      moveElephant: (tailRegion: string, headRegion: string) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            elephant: {
              tailRegion,
              headRegion
            }
          }
        }));
        console.log(`Elephant moved: tail in ${tailRegion} head in ${headRegion}`);
      },

      resolveElephantPeace: () => {
        const state = get();
        const { elephant } = state.gameState;
        // within region: open all orders / clear unrest.
        if (elephant.headRegion === elephant.tailRegion) {

          const region = state.gameState.regions[elephant.headRegion];
          let stackIfNotControlled = region.companyControlled ? 0 : 1;

          const updatedOrders = { ...state.gameState.orders };
          const ordersToOpen = state.gameState.regions[elephant.headRegion].orders;
          
          console.log(ordersToOpen);
          ordersToOpen.forEach(orderId => {
            if (updatedOrders[orderId]) {
              updatedOrders[orderId] = {
                ...updatedOrders[orderId],
                open: true
              };
            }
          });
          set({
            gameState: {
              ...state.gameState,
              orders: updatedOrders,
              regions: {
                ...state.gameState.regions,
                [region.id]: {
                  ...region,
                  unrest: 0,
                  towerHeight: region.towerHeight + stackIfNotControlled
                }
              }
            }
          });
        } else {

          const regionHead = state.gameState.regions[elephant.headRegion];
          const regionTail = state.gameState.regions[elephant.tailRegion];

          let stackIfNotControlledHead = regionHead.companyControlled ? 0 : 1;
          let stackIfNotControlledTail = regionTail.companyControlled ? 0 : 1;

          const updatedOrders = { ...state.gameState.orders };
          const ordersToOpen = state.gameState.peaceOrderConnections[elephant.headRegion+elephant.tailRegion];

          console.log(ordersToOpen);

          ordersToOpen.forEach(orderId => {
            if (updatedOrders[orderId]) {
              updatedOrders[orderId] = {
                ...updatedOrders[orderId],
                open: true
              };
            }
          });

          set({
            gameState: {
              ...state.gameState,
              orders: updatedOrders,
              regions: {
                ...state.gameState.regions,
                [regionHead.id]: {
                  ...regionHead,
                  unrest: 0,
                  towerHeight: regionHead.towerHeight + stackIfNotControlledHead
                },
                [regionTail.id]: {
                  ...regionTail,
                  unrest: 0,
                  towerHeight: regionTail.towerHeight + stackIfNotControlledTail
                }
              }
            }
          });
        }
      },
      resolveElephantMarch: (regionId: string, shape?: ElephantShape) => {
        const state = get();
        const currentRegion = state.gameState.regions[regionId];
        if (currentRegion.towerHasFlag) {
          currentRegion.neighbors.forEach(neighboringRegionID => {
            const neighborRegion = state.gameState.regions[neighboringRegionID]
            if (neighborRegion.towerHasFlagStar && (neighborRegion.flagColor === currentRegion.flagColor)){
              get().moveElephant(regionId, neighboringRegionID);
              return;
            }
          });
        } 
        else if (currentRegion.towerHasFlagStar) {
          const m = get().getFullyFormedOrNextPosition(regionId)
          get().moveElephant(m.headRegion, m.tailRegion);
        }
        //use elephantBorderClockwise to check if empire is fully formed. in that rare case its shape and flip.
        else if (currentRegion.companyControlled) {
          get().moveElephant(regionId, regionId);
        } else {
          // soverign
          //console.log(shape+regionId);
          //console.log(state.gameState.elephantRedirectLookup[shape+regionId]);
          get().moveElephant(regionId, state.gameState.elephantRedirectLookup[shape+regionId].tailRegion);
        }
        //check imperial ambitions first 

        //move to top of stack region
        //. if region is company controlled - elephant moves within
        //. if region dominated by another - place the Elephant on the border 
        //     facing its current sovereign to indicate a looming Rebellion
        //. If the region is sovereign, place the Elephant on the border matching
        //     the shape (circle, triangle, or square) printed on the tile to indicate a 
        //     looming Invasion. The Elephant should be facing towards the region on the 
        //     other side of that border. If the Elephant faces a region that is already 
        //     dominated by the acting region (with the Elephant’s tail), use the first 
        //     clockwise region from that border where this is not true.
      },
      getNextClockwisePosition(regionId: string, elephantState: ElephantState) {
        const state = get();
        const edgesClockwise = state.gameState.elephantBorderClockwise[regionId];
        
        const currentIndex = edgesClockwise.findIndex(edge => 
          edge.tailRegion === elephantState.tailRegion && 
          edge.headRegion === elephantState.headRegion
        );
        
        if (currentIndex === -1) {
          console.log("getNextClockwisePosition returned a negative index, somethings wrong.")
          return edgesClockwise[0];
        }
        
        const nextIndex = (currentIndex + 1) % edgesClockwise.length;
        return edgesClockwise[nextIndex];
      },
      getFullyFormedOrNextPosition(regionId: string) {
        const state = get();
        const elephantState = state.gameState.elephant;
        const edges = state.gameState.elephantBorderClockwise[regionId];
        
        const currentRegionFlagColor = state.gameState.regions[regionId].flagColor;
        let currentElephantState = elephantState;
        
        const headRegionFlagColor = state.gameState.regions[currentElephantState.headRegion].flagColor;
        if (headRegionFlagColor !== currentRegionFlagColor) {
          return currentElephantState;
        }
        
        for (let i = 0; i < edges.length; i++) {
          currentElephantState = this.getNextClockwisePosition(regionId, currentElephantState);
          
          const nextHeadRegionFlagColor = state.gameState.regions[currentElephantState.headRegion].flagColor;
          if (nextHeadRegionFlagColor !== currentRegionFlagColor) {
            return currentElephantState;
          }
        }
        const firstEdge = edges[0];
        return {
          tailRegion: firstEdge.headRegion,
          headRegion: firstEdge.tailRegion
        };

      },
      getCrisisType: () => {
        const state = get();
        const { elephant } = state.gameState;
        
        if (elephant.headRegion === elephant.tailRegion) {
          return 'attack_on_company';
        }
        
        const tailRegion = state.gameState.regions[elephant.tailRegion];
        const headRegion = state.gameState.regions[elephant.headRegion];
        
        if (tailRegion.towerHasFlag && headRegion.towerHasFlag && tailRegion.towerHasFlag === headRegion.towerHasFlag) {
          return 'rebellion';
        }
        
        return 'invasion';
      },
      setStormDieResult: (result: StormDieSide) => set((state) => ({
        gameState: {
          ...state.gameState,
          storm: {
            ...state.gameState.storm,
            currentRoll: result,
            isRolling: false
          }
        }
      })),
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
            eventsRemaining: stormRoll.value,
            stormDieConfirmed: true
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
      //needs renamed- rolls storm die in app now doesnt start anything
      startEventPhaseWithStorm: () => {
        const stormRoll = rollStormDie();
        get().startStormRoll();
        
        const animationDuration = 1500;
        
        setTimeout(() => {
          const currentState = get();
          if (currentState.gameState.storm.isRolling) {
            get().setStormDieResult(stormRoll);
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
        const state = get().gameState;
        const region = state.regions[regionId];

        if (!region) return [];

        return region.orders
          .map((orderId) => state.orders[orderId])
          .filter((order): order is Order => Boolean(order));
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
        set((state) => {
          const order = state.gameState.orders[orderId];
          if (!order) {
            console.error(`Order ${orderId} not found!`);
            return state;
          }

          return {
            gameState: {
              ...state.gameState,
              orders: {
                ...state.gameState.orders,
                [orderId]: {
                  ...order,
                  ...updates
                }
              }
            }
          };
        });
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

      resetGame: (scenario?: ScenarioPreset) => {
        const selectedScenario = scenario ?? get().currentScenario;

        set({
          currentScenario: selectedScenario,
          gameState: {
            ...getInitialState(selectedScenario),
            eventDeck: createShuffledEventDeck(),
            discardedEvents: [],
            currentEventId: undefined,
            currentEventRegion: undefined,
            history: [],
          }
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
          phase: 'company',
          history: [],
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
  currentScenario: state.currentScenario,
  gameState: {
    ...state.gameState,
    history: [],
    storm: {
      ...state.gameState.storm,
      isRolling: false
    }
  }
}),
      onRehydrateStorage: () => {
        return (state) => {
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