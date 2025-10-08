import type { GameState, Region, Order, Event, ElephantState } from '../types/game';


export const REGION_IDS = {
  PUNJAB: 'punjab',
  DELHI: 'delhi',
  BENGAL: 'bengal', 
  BOMBAY: 'bombay',
  MARATHA: 'maratha',
  HYDERABAD: 'hyderabad',
  MYSORE: 'mysore',
  MADRAS: 'madras',
} as const;

export type RegionId = typeof REGION_IDS[keyof typeof REGION_IDS];

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const initialEventDeck: Event[] = shuffleArray([
  {
    id: 'windfall_1',
    type: 'windfall',
    title: 'Windfall',
    description: 'Players with writers in the region and adjacent regions each receive £1.',
    regionBack: REGION_IDS.BOMBAY,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Windfall in ${currentRegion}! Writers in ${currentRegion} and adjacent regions receive money`);
      return state;
    }
  },
  {
    id: 'windfall_2', 
    type: 'windfall',
    title: 'Windfall',
    description: 'Players with writers in the region and adjacent regions each receive £1.',
    regionBack: REGION_IDS.BENGAL,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Windfall in ${currentRegion}! Writers in ${currentRegion} and adjacent regions receive money`);
      return state;
    }
  },
  {
    id: 'windfall_3',
    type: 'windfall',
    title: 'Windfall', 
    description: 'Players with writers in the region and adjacent regions each receive £1.',
    regionBack: REGION_IDS.DELHI,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Windfall in ${currentRegion}! Writers in ${currentRegion} and adjacent regions receive money`);
      return state;
    }
  },

  {
    id: 'turmoil_1',
    type: 'turmoil',
    title: 'Turmoil',
    description: 'Close the northernmost open order in the region. May cascade.',
    regionBack: REGION_IDS.MADRAS,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Turmoil in ${currentRegion}: Closing northernmost open order`);
      return state;
    }
  },
  {
    id: 'turmoil_2',
    type: 'turmoil',
    title: 'Turmoil',
    description: 'Close the northernmost open order in the region. May cascade.',
    regionBack: REGION_IDS.MARATHA,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Turmoil in ${currentRegion}: Closing northernmost open order`);
      return state;
    }
  },

  {
    id: 'peace_1',
    type: 'peace',
    title: 'Peace Negotiations',
    description: 'Open connecting orders and add tower levels, or open all orders and remove unrest in company-controlled regions.',
    regionBack: REGION_IDS.HYDERABAD,
    strength: undefined,
    crisisModifier: 0,
    shape: 'square', // Elephant will move to triangle border
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Peace event with elephant reference to ${currentRegion}, ${'square'}`);
      // Peace event logic will be implemented in the store
      return state;
    }
  },
  {
    id: 'peace_2', 
    type: 'peace',
    title: 'Peace Negotiations',
    description: 'Open connecting orders and add tower levels, or open all orders and remove unrest in company-controlled regions.',
    regionBack: REGION_IDS.MYSORE,
    strength: undefined,
    crisisModifier: 0,
    shape: 'triangle',
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Peace event with elephant reference to ${currentRegion}, ${'triangle'}`);
      return state;
    }
  },

  {
    id: 'crisis_1',
    type: 'crisis',
    title: 'Resolve Crisis',
    description: 'Rebellion, invasion, or attack on company based on elephant position.',
    regionBack: REGION_IDS.PUNJAB,
    strength: undefined,
    crisisModifier: 0,
    shape: 'square',
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Crisis event with elephant at ${state.elephant.tailRegion}-${state.elephant.headRegion} border`);
      console.log(`Crisis event with elephant reference to ${currentRegion}, ${'square'}`);
      return state;
    }
  },
  

  // Multiple leader events
  {
    id: 'leader_1',
    type: 'leader',
    title: 'Leader Emerges',
    description: 'Strengthen region or cause rebellion based on region state.',
    regionBack: REGION_IDS.HYDERABAD,
    strength: '4',
    crisisModifier: 0,
    shape: 'triangle',
    effect: (state: GameState, currentRegion: string) => {
      const region = state.regions[currentRegion];
      console.log(`Leader event in ${currentRegion}, company controlled: ${region.companyControlled}`);
      console.log(`Leader event in ${currentRegion}`);
      return state;
    }
  },
  {
    id: 'leader_2',
    type: 'leader',
    title: 'Leader Emerges',
    description: 'Strengthen region or cause rebellion based on region state.',
    regionBack: REGION_IDS.BENGAL,
    strength: '2',
    crisisModifier: 0,
    shape: 'triangle',
    effect: (state: GameState, currentRegion: string) => {
      const region = state.regions[currentRegion];
      console.log(`Leader event in ${currentRegion}, company controlled: ${region.companyControlled}`);
      console.log(`Leader event in ${currentRegion}`);
      return state;
    }
  },
  {
    id: 'leader_3',
    type: 'leader',
    title: 'Leader Emerges',
    description: 'Strengthen region or cause rebellion based on region state.',
    regionBack: REGION_IDS.PUNJAB,
    strength: '3',
    crisisModifier: 0,
    shape: 'circle',
    effect: (state: GameState, currentRegion: string) => {
      const region = state.regions[currentRegion];
      console.log(`Leader event in ${currentRegion}, company controlled: ${region.companyControlled}`);
      console.log(`Leader event in ${currentRegion}`);
      return state;
    }
  },
  {
    id: 'leader_4',
    type: 'leader',
    title: 'Leader Emerges',
    description: 'Strengthen region or cause rebellion based on region state.',
    regionBack: REGION_IDS.BOMBAY,
    strength: '2',
    crisisModifier: 0,
    shape: 'square',
    effect: (state: GameState, currentRegion: string) => {
      const region = state.regions[currentRegion];
      console.log(`Leader event in ${currentRegion}, company controlled: ${region.companyControlled}`);
      console.log(`Leader event in ${currentRegion}`);
      return state;
    }
  },
  {
    id: 'foreign_invasion_1',
    type: 'foreign_invasion',
    title: 'Foreign Invasion',
    description: 'Roll storm die for invasions in east, west, south, or top region.',
    regionBack: REGION_IDS.MADRAS,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Foreign invasion affecting ${currentRegion}`);
      return state;
    }
  },

  {
    id: 'shuffle_1',
    type: 'shuffle',
    title: 'Deck Shuffle',
    description: 'Redirect elephant and shuffle event deck.',
    regionBack: REGION_IDS.DELHI,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Shuffle event - moving elephant to ${currentRegion}`);
      return state;
    }
  }
]);

export const ORDER_IDS = {
} as const;

export const initialOrders: Record<string, Order> = {
  // Punjab Orders
  '1': {
    id: '1',
    open: false,
    price: 7,
    priceSecondary: 3,
    region: REGION_IDS.PUNJAB,
    neighbors: ['2','7'] 
  },
  
  // Delhi Orders
  '2': {
    id: '2',
    open: false,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.DELHI,
    neighbors: ['1','3']
  },
  '3': {
    id: '3',
    open: false,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.DELHI,
    neighbors: ['2','4','7']
  },
  '4': {
    id: '4',
    open: false,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.DELHI,
    neighbors: ['3','10']
  },
  
  // Bengal Orders
  '5': {
    id: '5',
    open: false,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.BENGAL,
    neighbors: ['10','12','6']
  },
  '6': {
    id: '6',
    open: false,
    price: 6,
    priceSecondary: 3,
    region: REGION_IDS.BENGAL,
    neighbors: ['5']
  },
  
  // Bombay Orders
  '7': {
    id: '7',
    open: false,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.BOMBAY,
    neighbors: ['1','3','9']
  },
  '8': {
    id: '8',
    open: false,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.BOMBAY,
    neighbors: ['9','11']
  },
  '9': {
    id: '9',
    open: false,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.BOMBAY,
    neighbors: ['7','8','14']
  },
  
  // Maratha Orders
  '10': {
    id: '10',
    open: false,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.MARATHA,
    neighbors: ['4','6']
  },
  '11': {
    id: '11',
    open: false,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.MARATHA,
    neighbors: ['8','12']
  },
  '12': {
    id: '12',
    open: false,
    price: 2,
    priceSecondary: 1,
    region: REGION_IDS.MARATHA,
    neighbors: ['11','5','13']
  },
  
  // Hyderabad Orders
  '13': {
    id: '13',
    open: false,
    price: 7,
    priceSecondary: 3,
    region: REGION_IDS.HYDERABAD,
    neighbors: ['12','15','16']
  },
  
  // Mysore Orders
  '14': {
    id: '14',
    open: false,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.MYSORE,
    neighbors: ['9','15']
  },
  '15': {
    id: '15',
    open: false,
    price: 6,
    priceSecondary: 3,
    region: REGION_IDS.MYSORE,
    neighbors: ['14','13','17']
  },
  
  // Madras Orders
  '16': {
    id: '16',
    open: false,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.MADRAS,
    neighbors: ['13','17']
  },
  '17': {
    id: '17',
    open: false,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.MADRAS,
    neighbors: ['16','15']
  },
};

// Initial regions data with orders
export const initialRegions: Record<RegionId, Region> = {
  [REGION_IDS.PUNJAB]: {
    id: REGION_IDS.PUNJAB,
    name: "Punjab",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: false,
    orders: ['1'], 
    neighbors: [REGION_IDS.DELHI, REGION_IDS.BOMBAY],
    color: '#f0f0f0',
  },
  [REGION_IDS.DELHI]: {
    id: REGION_IDS.DELHI,
    name: "Delhi",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: false,
    orders: ['2', '3', '4'], 
    neighbors: [REGION_IDS.PUNJAB, REGION_IDS.BENGAL, REGION_IDS.BOMBAY, REGION_IDS.MARATHA],
    color: '#e0e0e0',
  },
  [REGION_IDS.BENGAL]: {
    id: REGION_IDS.BENGAL,
    name: "Bengal",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: true,
    orders: ['5', '6'],
    neighbors: [REGION_IDS.DELHI, REGION_IDS.MARATHA],
    color: '#d4edda',
  },
  [REGION_IDS.BOMBAY]: {
    id: REGION_IDS.BOMBAY,
    name: "Bombay",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: true,
    orders: ['7', '8', '9'], 
    neighbors: [REGION_IDS.PUNJAB, REGION_IDS.DELHI, REGION_IDS.MARATHA, REGION_IDS.HYDERABAD, REGION_IDS.MYSORE],
    color: '#d4edda',
  },
  [REGION_IDS.MARATHA]: {
    id: REGION_IDS.MARATHA,
    name: "Maratha",
    unrest: 1,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: false,
    orders: ['10', '11', '12'],
    neighbors: [REGION_IDS.DELHI, REGION_IDS.BENGAL, REGION_IDS.BOMBAY, REGION_IDS.HYDERABAD],
    color: '#f8d7da',
  },
  [REGION_IDS.HYDERABAD]: {
    id: REGION_IDS.HYDERABAD,
    name: "Hyderabad",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: false,
    orders: ['13'],
    neighbors: [REGION_IDS.BOMBAY, REGION_IDS.MARATHA, REGION_IDS.MYSORE, REGION_IDS.MADRAS],
    color: '#f0f0f0',
  },
  [REGION_IDS.MYSORE]: {
    id: REGION_IDS.MYSORE,
    name: "Mysore",
    unrest: 2,
    towerHeight: 1,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: false,
    orders: ['14', '15'], 
    neighbors: [REGION_IDS.BOMBAY, REGION_IDS.HYDERABAD, REGION_IDS.MADRAS],
    color: '#f8d7da',
  },
  [REGION_IDS.MADRAS]: {
    id: REGION_IDS.MADRAS,
    name: "Madras",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    elephantFacing: false,
    elephantBackRegion: null,
    companyControlled: true,
    orders: ['16', '17'],
    neighbors: [REGION_IDS.HYDERABAD, REGION_IDS.MYSORE],
    color: '#d4edda',
  },
};

export const getOrdersByRegion = (regionId: RegionId): Order[] => {
  const region = initialRegions[regionId];
  return region.orders.map(orderId => initialOrders[orderId]);
};

export const getNeighboringRegions = (regionId: RegionId): Region[] => {
  const region = initialRegions[regionId];
  return region.neighbors.map(neighborId => initialRegions[neighborId]);
};

export const getOrderById = (orderId: string): Order => {
  return initialOrders[orderId];
};

export const initialElephantState: ElephantState = {
  tailRegion: REGION_IDS.BENGAL,
  headRegion: REGION_IDS.MARATHA,
  isWithinRegion: false
};

// initial game state
export const initialState: GameState = {
  phase: 'company',
  regions: initialRegions,
  eventDeck: initialEventDeck,
  discardedEvents: [],
  turn: 1,
  year: 1710,
  history: [],
  elephant: initialElephantState, 
  stormDie: 'none',
  crisisType: undefined,
};