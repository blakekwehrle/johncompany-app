import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Region, Order } from '../types/game';
import { initialState, getOrdersByRegion, getNeighboringRegions, getOrderById } from '../data/initialState';

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
  
  // helper functions
  getRegion: (regionId: string) => Region | undefined;
  getRegionOrders: (regionId: string) => Order[];
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
        // Auto-draws event when entering event phase
        get().drawEvent();
      },

      // Draw a random event
      drawEvent: () => {
        // TODO: Implement actual event drawing logic
        // For now, we'll create a placeholder event
        const placeholderEvent = {
          id: 'storm_east',
          title: 'Storms in the East!',
          description: 'A massive storm system has disrupted shipping lanes...',
          effect: (state: GameState) => {
            const newRegions = { ...state.regions };
            Object.keys(newRegions).forEach(regionId => {
              const region = newRegions[regionId];
              if (['bombay', 'madras', 'bengal'].includes(regionId)) {
                newRegions[regionId] = {
                  ...region,
                  unrest: region.unrest + 1
                };
              }
            });
            return {
              ...state,
              regions: newRegions
            };
          }
        };

        set((state) => ({
          gameState: {
            ...state.gameState,
            currentEvent: placeholderEvent,
            phase: 'event'
          }
        }));
      },

      // Complete the current event and return to company phase
      completeEvent: () => {
        const state = get();
        if (state.gameState.currentEvent) {
          // Apply the event effect
          const newGameState = state.gameState.currentEvent.effect(state.gameState);
          
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

      // Update a region's properties
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
          console.log(`Would update order ${orderId} with:`, updates);
          console.warn('Order updates not fully implemented - orders are currently static data');
          
          return state;
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

      //get a region by ID
      getRegion: (regionId: string) => {
        return get().gameState.regions[regionId];
      },

      //get all orders for a region
      getRegionOrders: (regionId: string) => {
        return getOrdersByRegion(regionId as any); // Type assertion for now
      }
    }),
    {
      name: 'joco-game-storage', // localStorage
      partialize: (state) => ({ 
        gameState: state.gameState 
      }),
    }
  )
);
