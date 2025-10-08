
import type { Event, GameState } from '../types/game';
import { REGION_IDS } from "../data/initialState";
// Helper functions for common game actions
const closeNorthernmostOrder = (state: GameState, regionId: string): GameState => {
  // Implementation for closing northernmost order TODO
  console.log(`Closing northernmost order in ${regionId}`);
  return state;
};

const cascadeCloseOrders = (state: GameState, regionId: string): GameState => {
  // Implementation for cascade closing TODO
  console.log(`Cascading close orders from ${regionId}`);
  return state;
};

const addTowerLevel = (state: GameState, regionId: string): GameState => {
  const region = state.regions[regionId];
  return {
    ...state,
    regions: {
      ...state.regions,
      [regionId]: {
        ...region,
        towerHeight: region.towerHeight + 1
      }
    }
  };
};

export const events: Event[] = [
  // WINFALL EVENT
  //these are probably gonna be updated from the new ones in intitial state
  {
    id: 'windfall_bombay',
    type: 'windfall',
    title: 'Windfall in Bombay',
    description: 'Players with writers in Bombay and adjacent regions each receive £1.',
    regionBack: REGION_IDS.BENGAL, // Example previous region
    crisisModifier: 0,
    effect: (state: GameState) => {
      // Windfall gives money to players with writers in the region and adjacent regions
      const bombay = state.regions[REGION_IDS.BOMBAY];
      const adjacentRegions = bombay.neighbors;
      
      console.log(`Windfall! Writers in Bombay and adjacent regions (${adjacentRegions.join(', ')}) receive money`);
      // Note: Player money tracking would need to be added to GameState
      
      return state;
    }
  },

  // TURMOIL EVENT
  // {
  //   id: 'turmoil_madras',
  //   type: 'turmoil', 
  //   title: 'Turmoil in Madras',
  //   description: 'Close the northernmost open order in Madras. May cascade.',
  //   regionBack: REGION_IDS.BOMBAY,
  //   effect: (state: GameState) => {
  //     const madras = state.regions[REGION_IDS.MADRAS];
      
  //     // Check if all orders are already closed
  //     const allOrdersClosed = madras.orders.every(orderId => {
  //       const order = // You'll need to access orders from state
  //       return !order.open; // Assuming order.open exists
  //     });
      
  //     if (allOrdersClosed) {
  //       // Cascade to connected regions
  //       return cascadeCloseOrders(state, REGION_IDS.MADRAS);
  //     } else {
  //       // Close northernmost open order
  //       return closeNorthernmostOrder(state, REGION_IDS.MADRAS);
  //     }
  //   }
  // },

  // PEACE EVENT
  {
    id: 'peace_elephant',
    type: 'peace',
    title: 'Peace Negotiations',
    description: 'Open connecting orders and add tower levels, or open all orders and remove unrest in company-controlled regions.',
    regionBack: REGION_IDS.DELHI,
    crisisModifier: 0,
    effect: (state: GameState) => {
      // Peace event logic depends on elephant position
      // This would need access to elephant state (which we should add to GameState)
      
      console.log('Peace event: Opening orders and modifying towers/unrest based on elephant position');
      
      // After effect, elephant moves to top of stack (regionBack)
      // You'll need to add elephant state to GameState
      
      return state;
    }
  },

  // CRISIS EVENT
  {
    id: 'crisis_rebellion',
    type: 'crisis',
    title: 'Crisis: Rebellion',
    description: 'Rebellion crisis based on elephant position.',
    regionBack: REGION_IDS.MARATHA,
    crisisModifier: 1,
    effect: (state: GameState) => {
      // Crisis resolution depends on elephant position and type (rebellion, invasion, attack on company)
      console.log('Crisis event: Resolving based on elephant position and crisis type');
      
      // This would involve:
      // 1. Determining crisis type from elephant position
      // 2. Calculating attacker/defender strength
      // 3. Resolving combat
      // 4. Updating regions, flags, unrest accordingly
      
      return state;
    }
  },

  // LEADER EVENT
  {
    id: 'leader_maratha', 
    type: 'leader',
    title: 'Leader Emerges in Maratha',
    description: 'Strengthen region or cause rebellion based on region state.',
    regionBack: REGION_IDS.HYDERABAD,
    crisisModifier: 0,
    effect: (state: GameState) => {
      const maratha = state.regions[REGION_IDS.MARATHA];
      
      if (!maratha.companyControlled && !maratha.towerHasFlag) {
        // Sovereign region - add tower level
        return addTowerLevel(state, REGION_IDS.MARATHA);
      } else {
        // Dominated or company-controlled - cause rebellion with +2 modifier
        console.log('Leader event causing rebellion with +2 modifier');
        // Would trigger rebellion resolution
        return state;
      }
    }
  },

  // FOREIGN INVASION EVENT
  {
    id: 'foreign_invasion_storm',
    type: 'foreign_invasion',
    title: 'Foreign Invasion',
    description: 'Roll storm die for invasions in east, west, south, or top region.',
    regionBack: REGION_IDS.MYSORE,
    stormDirection: 'east', // This would be determined by storm die roll
    crisisModifier: 0,
    effect: (state: GameState) => {
      // Foreign invasion in Bengal (east), Bombay (west), or Madras (south)
      // Or top region if storm die is 'none'
      console.log('Foreign invasion event: Resolving invasions based on storm die');
      
      // This involves:
      // 1. Rolling storm die (or using provided direction)
      // 2. For each invaded region, roll D6 for attack strength
      // 3. Resolve combat against company or other empires
      // 4. Update regions, place domes with half strength rounded down
      
      return state;
    }
  },

  // SHUFFLE EVENT
  {
    id: 'shuffle_deck',
    type: 'shuffle', 
    title: 'Deck Shuffle',
    description: 'Redirect elephant and shuffle event deck.',
    regionBack: REGION_IDS.PUNJAB,
    crisisModifier: 0,
    effect: (state: GameState) => {
      // 1. Redirect elephant to top of stack (regionBack)
      console.log(`Shuffle event: Moving elephant to ${REGION_IDS.PUNJAB}`);
      
      // 2. Shuffle current event back into deck with remaining events
      // 3. Take all discarded events and shuffle them on top
      
      // You'll need to implement deck shuffling logic
      console.log('Shuffling event deck');
      
      return state;
    }
  }
];

// Helper to get random event
export const getRandomEvent = (availableEvents: Event[]): Event => {
  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
};