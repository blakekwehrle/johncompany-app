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
  getMarchElephantState: (regionId: string, shape?: ElephantShape) => ElephantState;
  getCrisisType: () => 'rebellion' | 'invasion' | 'attack_on_company';
  getNextClockwisePosition: (regionId: string, elephantState: ElephantState) => ElephantState;
  getFullyFormedOrNextPosition: (regionId: string, shape?: ElephantShape) => ElephantState;
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

  // for undo ability
  saveHistory:() => void;
  undoEvent:() => void;
}

//Helper to make sure empires are removed when the capital remains and no other dominated regions
const removeLonelyEmpireCapitals = (regions: Record<string, any>): Record<string, any> => {
  const updatedRegions = { ...regions };

  const capitalRegions = Object.values(updatedRegions).filter(
    (region) => region.towerHasFlagStar
  );

  capitalRegions.forEach((capitalRegion) => {
    const empireRegions = Object.values(updatedRegions).filter(
      (region) =>
        region.flagColor === capitalRegion.flagColor &&
        (region.towerHasFlag || region.towerHasFlagStar)
    );

    const dominatedRegions = empireRegions.filter(
      (region) => region.towerHasFlag && !region.towerHasFlagStar
    );

    if (empireRegions.length === 1 && dominatedRegions.length === 0) {
      console.log(
        `Empire ${capitalRegion.flagColor} reduced to only capital ${capitalRegion.id}; removing capital flag.`
      );

      updatedRegions[capitalRegion.id] = {
        ...updatedRegions[capitalRegion.id],
        towerHasFlag: false,
        towerHasFlagStar: false,
      };
    }
  });

  return updatedRegions;
};

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
          console.warn('No history to undo');
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
        
        let currentDeck = eventDeck;
        if (currentDeck.length === 0) {
          console.log('Deck empty, reshuffling discard pile');
          currentDeck = [...discardedEvents];
          for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
          }
        }
        
        if (currentDeck.length === 0) {
          console.warn('No events available!');
          return;
        }
        
        const drawnEventId = currentDeck[0];
        const remainingDeck = currentDeck.slice(1);
        
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

        const history = state.gameState.history;

        try {
          const newGameState = currentEvent.effect(state.gameState, currentRegion);

          set({
            gameState: {
              ...newGameState,
              history,
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
              history,
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

        const MAX_HISTORY = 5;
        const last = state.history[state.history.length - 1];

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
        
        if (areAllOrdersClosed(state.gameState, regionId)) {
          console.log(`All orders already closed in ${regionId}, starting cascade...`);
          const newState = startCascade(state.gameState, regionId);
          set({ gameState: newState });
        } else {
          const newState = closeNorthernmostOrder(state.gameState, regionId);
          set({ gameState: newState });
        }
        
        get().completeEvent();
      },

      resolvePeace: (regionId: string, shape?: ElephantShape) => {
      console.log(`Resolving peace event for region: ${regionId}, moving to ${shape} border`);
      const state = get();
      console.log(
        `Elephant Head: ${state.gameState.elephant.headRegion} and Elephant Tail: ${state.gameState.elephant.tailRegion}`
      );

      get().resolveElephantPeace();

      const next = get().getMarchElephantState(regionId, shape);
      get().moveElephant(next.tailRegion, next.headRegion);

      console.log(`Peace event: opening orders between connected regions and modifying towers`);
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

        const attackStrength = modifier + region.unrest;
        console.log(`Attack on Company in ${regionId}: strength ${attackStrength} (modifier: ${modifier} + unrest: ${region.unrest})`);

        if (attackStrength > 0) {
          console.log(`Company loses control of ${regionId}`);
          get().resolveRegionLoss(regionId);
        } else {
          console.log(`Attack on Company in ${regionId} defended successfully`);
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
        
        if (
          attackerRegion.towerHasFlag &&
          !attackerRegion.towerHasFlagStar &&
          attackerRegion.flagColor === defenderRegion.flagColor &&
          defenderRegion.towerHasFlagStar
        ) {
          return 'rebellion';
        }
        
        return 'invasion';
      },

      resolveInvasionCrisis: (attackerRegionId: string, defenderRegionId: string, modifier: number) => {
  const state = get();

  const getInvasionCombatStrength = (regionId: string) => {
    const region = state.gameState.regions[regionId];

    if (!region) {
      console.warn(`No region found for invasion strength: ${regionId}`);
      return 0;
    }

    // Only capital/star-flag regions use the combined strength of their whole empire.
    if (region.towerHasFlagStar) {
      return Object.values(state.gameState.regions)
        .filter(
          (candidateRegion) =>
            candidateRegion.flagColor === region.flagColor &&
            (candidateRegion.towerHasFlag || candidateRegion.towerHasFlagStar)
        )
        .reduce((total, candidateRegion) => total + candidateRegion.towerHeight, 0);
    }

    // Non-capital regions fight with only their own tower height.
    return region.towerHeight;
  };

  const attackerStrength = getInvasionCombatStrength(attackerRegionId) + modifier;
  const defenderStrength = getInvasionCombatStrength(defenderRegionId);

  console.log(
    `Invasion: ${attackerRegionId} (strength: ${attackerStrength}) vs ${defenderRegionId} (strength: ${defenderStrength})`
  );

  if (attackerStrength > defenderStrength) {
    console.log(`Invasion successful! ${attackerRegionId} conquers ${defenderRegionId}`);
    get().handleSuccessfulInvasion(attackerRegionId, defenderRegionId);
  } else {
    console.log(`Invasion failed! Removing tower level from ${attackerRegionId}`);

    set((state) => {
      const currentAttackerRegion = state.gameState.regions[attackerRegionId];

      return {
        gameState: {
          ...state.gameState,
          regions: {
            ...state.gameState.regions,
            [attackerRegionId]: {
              ...currentAttackerRegion,
              towerHeight: Math.max(0, currentAttackerRegion.towerHeight - 1),
            },
          },
        },
      };
    });

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

  console.log(
    `Rebellion: ${attackerRegionId} (strength: ${attackerStrength}) vs ${defenderRegionId} (strength: ${defenderStrength})`
  );

  if (attackerStrength > defenderStrength) {
    console.log(`Rebellion successful! ${attackerRegionId} becomes sovereign`);

    const updatedRegionsBeforeEmpireCleanup = {
  ...state.gameState.regions,
  [attackerRegionId]: {
    ...attackerRegion,
    towerHasFlag: false,
    towerHasFlagStar: false,
    flagColor: attackerRegion.flagColor,
  },
};

const updatedRegions = removeLonelyEmpireCapitals(updatedRegionsBeforeEmpireCleanup);

    const updatedOrders = { ...state.gameState.orders };
    const ordersToClose = state.gameState.regions[attackerRegionId].orders;

    let allOrdersClosed = true;

    ordersToClose.forEach((orderId) => {
      if (updatedOrders[orderId] && updatedOrders[orderId].open) {
        updatedOrders[orderId] = {
          ...updatedOrders[orderId],
          open: false,
        };
        allOrdersClosed = false;
      }
    });

    const gameStateAfterRebellion = {
      ...state.gameState,
      regions: updatedRegions,
      orders: updatedOrders,
    };

    if (allOrdersClosed) {
      console.log(`All orders already closed in ${attackerRegionId}, starting cascade...`);

      // Important: cascade must start from the rebellion-updated state,
      // not the old state before the attacking region's flag was removed.
      const newState = startCascade(gameStateAfterRebellion, attackerRegionId);
      set({ gameState: newState });
    } else {
      set({
        gameState: gameStateAfterRebellion,
      });
    }
  } else {
    set((state) => {
      const currentCapital = state.gameState.regions[defenderRegionId];

      if (!currentCapital) {
        console.warn(`Failed rebellion could not find capital region: ${defenderRegionId}`);
        return state;
      }

      const nextTowerHeight = Math.max(0, currentCapital.towerHeight - 1);

      console.log(
        `Rebellion failed! Capital ${defenderRegionId} loses one tower level: ${currentCapital.towerHeight} -> ${nextTowerHeight}`
      );

      return {
        gameState: {
          ...state.gameState,
          regions: {
            ...state.gameState.regions,
            [defenderRegionId]: {
              ...currentCapital,
              towerHeight: nextTowerHeight,
            },
          },
        },
      };
    });
  }

  get().moveElephantToTopOfStack();
  get().completeEvent();
},

      resolveCompanyAttackCrisis: (attackerRegionId: string, defenderRegionId: string, modifier: number) => {
        const state = get();
        const defenderRegion = state.gameState.regions[defenderRegionId];

        const attackStrength = modifier + defenderRegion.unrest;
        console.log(`Attack on Company in ${defenderRegionId}: strength ${attackStrength} (modifier: ${modifier} + unrest: ${defenderRegion.unrest})`);
        console.log(`Attacker: ${attackerRegionId}`);

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
        const defenseSuccessful = attackStrength <= 1;
        
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

      handleSuccessfulInvasion: (attackerRegionId: string, defenderRegionId: string) => {
  const state = get();
  const attackerRegion = state.gameState.regions[attackerRegionId];
  const defenderRegion = state.gameState.regions[defenderRegionId];

  const updatedRegions = { ...state.gameState.regions };

  const empireColors = ['gold', 'silver', 'bronze'] as const;

  const attackerHasEmpireMarker =
    attackerRegion.towerHasFlag || attackerRegion.towerHasFlagStar;

  const attackerIsPartOfExistingEmpire =
    attackerHasEmpireMarker &&
    Object.values(state.gameState.regions).some(
      (region) =>
        region.towerHasFlagStar &&
        region.flagColor === attackerRegion.flagColor
    );

  const usedEmpireColors = new Set(
    Object.values(state.gameState.regions)
      .filter((region) => region.towerHasFlagStar)
      .map((region) => region.flagColor)
  );

  const availableEmpireColor = empireColors.find(
    (color) => !usedEmpireColors.has(color)
  );

  const invasionEmpireColor = attackerIsPartOfExistingEmpire
    ? attackerRegion.flagColor
    : availableEmpireColor;

  // If the defender was a capital, break apart that old empire first.
  if (defenderRegion.towerHasFlagStar) {
    Object.values(state.gameState.regions).forEach((region) => {
      if (
        region.flagColor === defenderRegion.flagColor &&
        region.id !== defenderRegionId
      ) {
        updatedRegions[region.id] = {
          ...region,
          towerHasFlag: false,
          towerHasFlagStar: false,
          flagColor: region.flagColor,
        };
      }
    });
  }

  // If the attacker is not already part of an empire and no empire colors remain,
  // the invasion succeeds but no new empire is created.
  if (!invasionEmpireColor) {
    updatedRegions[defenderRegionId] = {
      ...defenderRegion,
      towerHasFlag: false,
      towerHasFlagStar: false,
      flagColor: defenderRegion.flagColor,
    };

    updatedRegions[attackerRegionId] = {
      ...attackerRegion,
      towerHasFlag: false,
      towerHasFlagStar: false,
      flagColor: attackerRegion.flagColor,
    };

    const cleanedRegions = removeLonelyEmpireCapitals(updatedRegions);

set((state) => ({
  gameState: {
    ...state.gameState,
    regions: cleanedRegions,
  },
}));

    get().moveElephantWithImperialAmbitions(attackerRegionId);
    return;
  }

  // Defender joins the attacker's existing empire, or the newly created empire.
  updatedRegions[defenderRegionId] = {
    ...defenderRegion,
    towerHasFlag: true,
    towerHasFlagStar: false,
    flagColor: invasionEmpireColor,
  };

  // If the attacker was not already part of an empire, it becomes the new capital.
  if (!attackerIsPartOfExistingEmpire) {
    updatedRegions[attackerRegionId] = {
      ...attackerRegion,
      towerHasFlag: false,
      towerHasFlagStar: true,
      flagColor: invasionEmpireColor,
    };
  }

  set((state) => ({
    gameState: {
      ...state.gameState,
      regions: removeLonelyEmpireCapitals(updatedRegions),
    },
  }));

  get().moveElephantWithImperialAmbitions(attackerRegionId);
},
      moveElephantToTopOfStack: () => {
  const nextEventRegion = get().getNextEventRegion();
  const currentEvent = get().getCurrentEvent();
  const shape = currentEvent?.shape ?? 'circle';

  if (nextEventRegion) {
    console.log(
      `Moving elephant to top of stack: ${nextEventRegion} with current card shape ${shape}`
    );
    get().resolveElephantMarch(nextEventRegion, shape);
  } else {
    console.log('No next event region found for elephant movement');
  }
},

      moveElephantWithImperialAmbitions: (capitalRegionId: string) => {
  const state = get();
  const currentEvent = state.getCurrentEvent();
  const shape = currentEvent?.shape ?? 'circle';
  const key = `${shape}${capitalRegionId}`;
  const startingMove = state.gameState.elephantRedirectLookup[key];
  const capitalRegion = state.gameState.regions[capitalRegionId];

  if (!startingMove) {
    console.warn(`No Imperial Ambitions elephant move found for ${key}`);
    get().moveElephant(capitalRegionId, capitalRegionId);
    return;
  }

  const empireColor = capitalRegion.flagColor;

  let nextElephantState = startingMove;
  const edges = state.gameState.elephantBorderClockwise[capitalRegionId] || [];

  const isRegionInSameEmpire = (regionId: string) => {
    const region = get().gameState.regions[regionId];

    return (
      region &&
      empireColor &&
      region.flagColor === empireColor &&
      (region.towerHasFlag || region.towerHasFlagStar)
    );
  };

  console.log(
    `Imperial Ambitions starting move: ${nextElephantState.tailRegion} -> ${nextElephantState.headRegion}`
  );

  for (let i = 0; i < edges.length; i++) {
    if (!isRegionInSameEmpire(nextElephantState.headRegion)) {
      console.log(
        `Imperial Ambitions final move: ${nextElephantState.tailRegion} -> ${nextElephantState.headRegion}`
      );

      get().moveElephant(nextElephantState.tailRegion, nextElephantState.headRegion);
      return;
    }

    nextElephantState = get().getNextClockwisePosition(
      capitalRegionId,
      nextElephantState
    );
  }

  // If every neighboring border is already inside the empire,
  // place the elephant on the current shape's border with its head facing the capital.
  console.log(
    `Imperial Ambitions fully surrounded. Reversing current shape border: ${startingMove.headRegion} -> ${startingMove.tailRegion}`
  );

  get().moveElephant(startingMove.headRegion, startingMove.tailRegion);
},

      resolveForeignInvasion: (regionId: string) => {
        console.log(`Resolving foreign invasion affecting: ${regionId}`);
        
        const stormRoll = get().rollStormDie();
        let invasionRegions: string[] = [];
        
        if (stormRoll.direction === 'none') {
          invasionRegions = [regionId];
        } else {
          invasionRegions = getRegionsByStormDirection(stormRoll.direction);
        }
        
        console.log(`Foreign invasion in regions: ${invasionRegions.join(', ')}`);
        
        invasionRegions.forEach(invasionRegionId => {
          const attackRoll = Math.floor(Math.random() * 6) + 1;
          console.log(`Attack strength in ${invasionRegionId}: ${attackRoll}`);
        });
        
        get().completeEvent();
      },

      resolveShuffle: (regionId: string) => {
  console.log(`Resolving shuffle event - moving elephant to: ${regionId}`);
  console.log(`SHUFFLE ELEPHANT DEBUG: region=${regionId}, shape=circle`);

  get().resolveElephantMarch(regionId, 'circle');

  const state = get();
  const shuffledDeck = [...state.gameState.discardedEvents, ...state.gameState.eventDeck];

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

      getMarchElephantState: (regionId: string, shape?: ElephantShape) => {
  const state = get();
  const currentRegion = state.gameState.regions[regionId];
  const resolvedShape: ElephantShape = shape ?? 'circle';

  if (!currentRegion) {
    console.warn(`No region found for elephant march: ${regionId}`);
    return state.gameState.elephant;
  }

  // Dominated region: point toward its sovereign capital
  if (currentRegion.towerHasFlag && !currentRegion.towerHasFlagStar) {
    for (const neighboringRegionID of currentRegion.neighbors) {
      const neighborRegion = state.gameState.regions[neighboringRegionID];

      if (
        neighborRegion?.towerHasFlagStar &&
        neighborRegion.flagColor === currentRegion.flagColor
      ) {
        return {
          tailRegion: regionId,
          headRegion: neighboringRegionID,
        };
      }
    }

    console.warn(`No matching capital found for dominated region: ${regionId}`);
    return {
      tailRegion: regionId,
      headRegion: regionId,
    };
  }

  // Capital region: use empire-border logic, starting from the current card shape's border
  if (currentRegion.towerHasFlagStar) {
    return get().getFullyFormedOrNextPosition(regionId, resolvedShape);
  }

  // Company-controlled region: elephant stays within the region
  if (currentRegion.companyControlled) {
    return {
      tailRegion: regionId,
      headRegion: regionId,
    };
  }

  // Sovereign region: use printed-shape redirect lookup
  const key = `${resolvedShape}${regionId}`;
  const move = state.gameState.elephantRedirectLookup[key];

  console.log('Elephant sovereign lookup', {
    regionId,
    shape,
    resolvedShape,
    key,
    move,
  });

  if (!move) {
    console.warn(`No elephant redirect found for key: ${key}`);
    return {
      tailRegion: regionId,
      headRegion: regionId,
    };
  }

  return {
    tailRegion: move.tailRegion,
    headRegion: move.headRegion,
  };
},

      resolveElephantPeace: () => {
        const state = get();
        const { elephant } = state.gameState;

        if (elephant.headRegion === elephant.tailRegion) {
          const region = state.gameState.regions[elephant.headRegion];
          const stackIfNotControlled = region.companyControlled ? 0 : 1;

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

          const stackIfNotControlledHead = regionHead.companyControlled ? 0 : 1;
          const stackIfNotControlledTail = regionTail.companyControlled ? 0 : 1;

          const updatedOrders = { ...state.gameState.orders };
          const ordersToOpen = state.gameState.peaceOrderConnections[elephant.headRegion + elephant.tailRegion];

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
        const next = get().getMarchElephantState(regionId, shape);
        console.log(`Elephant march from region ${regionId} with shape ${shape}:`, next);
        get().moveElephant(next.tailRegion, next.headRegion);
      },

      getNextClockwisePosition(regionId: string, elephantState: ElephantState) {
        const state = get();
        const edgesClockwise = state.gameState.elephantBorderClockwise[regionId];
        
        const currentIndex = edgesClockwise.findIndex(edge => 
          edge.tailRegion === elephantState.tailRegion && 
          edge.headRegion === elephantState.headRegion
        );
        
        if (currentIndex === -1) {
          console.warn(`getNextClockwisePosition could not find edge for ${regionId}`, elephantState);
          return edgesClockwise[0];
        }
        
        const nextIndex = (currentIndex + 1) % edgesClockwise.length;
        return edgesClockwise[nextIndex];
      },

        getFullyFormedOrNextPosition(regionId: string, shape?: ElephantShape) {
  const state = get();
  const edges = state.gameState.elephantBorderClockwise[regionId];
  const capitalRegion = state.gameState.regions[regionId];
  const empireColor = capitalRegion.flagColor;
  const resolvedShape: ElephantShape = shape ?? 'circle';
  const shapeKey = `${resolvedShape}${regionId}`;

  if (!edges || edges.length === 0) {
    console.warn(`No clockwise elephant edges found for region: ${regionId}`);
    return state.gameState.elephant;
  }

  const shapeMove = state.gameState.elephantRedirectLookup[shapeKey];

  // Start from the current card shape's border. If that lookup is missing,
  // fall back to the first clockwise edge.
  const startingElephantState = shapeMove ?? edges[0];
  let currentElephantState = startingElephantState;

  const isRegionInSameEmpire = (targetRegionId: string) => {
    const targetRegion = get().gameState.regions[targetRegionId];

    return (
      targetRegion &&
      empireColor &&
      targetRegion.flagColor === empireColor &&
      (targetRegion.towerHasFlag || targetRegion.towerHasFlagStar)
    );
  };

  console.log(
    `Capital elephant movement from ${regionId} with shape ${resolvedShape}: starting ${startingElephantState.tailRegion} -> ${startingElephantState.headRegion}`
  );

  for (let i = 0; i < edges.length; i++) {
    if (!isRegionInSameEmpire(currentElephantState.headRegion)) {
      return currentElephantState;
    }

    currentElephantState = get().getNextClockwisePosition(
      regionId,
      currentElephantState
    );
  }

  // Fully formed empire: reverse the current shape's border so the head faces the capital.
  console.log(
    `Fully surrounded capital. Reversing shape border: ${startingElephantState.headRegion} -> ${startingElephantState.tailRegion}`
  );

  return {
    tailRegion: startingElephantState.headRegion,
    headRegion: startingElephantState.tailRegion,
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
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            eventsRemaining: state.gameState.eventsRemaining - 1
          }
        }));

        get().drawEvent();
      },

      completeEventPhase: () => {
        console.log('trying to finish event phase');
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