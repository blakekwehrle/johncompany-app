import { getAllEventIds } from '../types/events';
import type { GameState, Region, Order, Event, ElephantState } from '../types/game';
import { stormDie } from './storm';


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

export const initialEventDeck: string[] = getAllEventIds();

export const ORDER_IDS = {
} as const;

export const initialOrders: Record<string, Order> = {
  // Punjab Orders
  '1': {
    id: '1',
    open: true,
    price: 7,
    priceSecondary: 3,
    region: REGION_IDS.PUNJAB,
    neighbors: ['2','7'], 
    northPriority: 1,
  },
  
  // Delhi Orders
  '2': {
    id: '2',
    open: true,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.DELHI,
    neighbors: ['1','3'],
    northPriority: 1,
  },
  '3': {
    id: '3',
    open: true,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.DELHI,
    neighbors: ['2','4','7'],
    northPriority: 3,
  },
  '4': {
    id: '4',
    open: true,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.DELHI,
    neighbors: ['3','10'],
    northPriority: 2,
  },
  
  // Bengal Orders
  '5': {
    id: '5',
    open: false,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.BENGAL,
    neighbors: ['10','12','6'],
    northPriority: 1,
  },
  '6': {
    id: '6',
    open: false,
    price: 6,
    priceSecondary: 3,
    region: REGION_IDS.BENGAL,
    neighbors: ['5'],
    northPriority: 2,
  },
  
  // Bombay Orders
  '7': {
    id: '7',
    open: true,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.BOMBAY,
    neighbors: ['1','3','9'],
    northPriority: 1,
  },
  '8': {
    id: '8',
    open: true,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.BOMBAY,
    neighbors: ['9','11'],
    northPriority: 2,
  },
  '9': {
    id: '9',
    open: true,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.BOMBAY,
    neighbors: ['7','8','14'],
    northPriority: 3,
  },
  
  // Maratha Orders
  '10': {
    id: '10',
    open: true,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.MARATHA,
    neighbors: ['4','5'],
    northPriority: 1,
  },
  '11': {
    id: '11',
    open: true,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.MARATHA,
    neighbors: ['8','12'],
    northPriority: 2,
  },
  '12': {
    id: '12',
    open: true,
    price: 2,
    priceSecondary: 1,
    region: REGION_IDS.MARATHA,
    neighbors: ['11','5','13'],
    northPriority: 3,
  },
  
  // Hyderabad Orders
  '13': {
    id: '13',
    open: true,
    price: 7,
    priceSecondary: 3,
    region: REGION_IDS.HYDERABAD,
    neighbors: ['12','15','16'],
    northPriority: 1,
  },
  
  // Mysore Orders
  '14': {
    id: '14',
    open: true,
    price: 3,
    priceSecondary: 1,
    region: REGION_IDS.MYSORE,
    neighbors: ['9','15'],
    northPriority: 1,
  },
  '15': {
    id: '15',
    open: true,
    price: 6,
    priceSecondary: 3,
    region: REGION_IDS.MYSORE,
    neighbors: ['14','13','17'],
    northPriority: 2,
  },
  
  // Madras Orders
  '16': {
    id: '16',
    open: true,
    price: 5,
    priceSecondary: 2,
    region: REGION_IDS.MADRAS,
    neighbors: ['13','17'],
    northPriority: 1,
  },
  '17': {
    id: '17',
    open: true,
    price: 4,
    priceSecondary: 2,
    region: REGION_IDS.MADRAS,
    neighbors: ['16','15'],
    northPriority: 2,
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
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['1'], 
    neighbors: [REGION_IDS.DELHI, REGION_IDS.BOMBAY],
    flagColor: 'silver',
  },
  [REGION_IDS.DELHI]: {
    id: REGION_IDS.DELHI,
    name: "Delhi",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['2', '3', '4'], 
    neighbors: [REGION_IDS.PUNJAB, REGION_IDS.BENGAL, REGION_IDS.BOMBAY, REGION_IDS.MARATHA],
    flagColor: 'silver',
  },
  [REGION_IDS.BENGAL]: {
    id: REGION_IDS.BENGAL,
    name: "Bengal",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['5', '6'],
    neighbors: [REGION_IDS.DELHI, REGION_IDS.MARATHA],
    flagColor: 'silver',
  },
  [REGION_IDS.BOMBAY]: {
    id: REGION_IDS.BOMBAY,
    name: "Bombay",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['7', '8', '9'], 
    neighbors: [REGION_IDS.PUNJAB, REGION_IDS.DELHI, REGION_IDS.MARATHA, REGION_IDS.HYDERABAD, REGION_IDS.MYSORE],
    flagColor: 'gold',
  },
  [REGION_IDS.MARATHA]: {
    id: REGION_IDS.MARATHA,
    name: "Maratha",
    unrest: 1,
    towerHeight: 1,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: false,
    orders: ['10', '11', '12'],
    neighbors: [REGION_IDS.DELHI, REGION_IDS.BENGAL, REGION_IDS.BOMBAY, REGION_IDS.HYDERABAD],
    flagColor: 'silver',
  },
  [REGION_IDS.HYDERABAD]: {
    id: REGION_IDS.HYDERABAD,
    name: "Hyderabad",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['13'],
    neighbors: [REGION_IDS.BOMBAY, REGION_IDS.MARATHA, REGION_IDS.MYSORE, REGION_IDS.MADRAS],
    flagColor: 'silver',
  },
  [REGION_IDS.MYSORE]: {
    id: REGION_IDS.MYSORE,
    name: "Mysore",
    unrest: 2,
    towerHeight: 1,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: false,
    orders: ['14', '15'], 
    neighbors: [REGION_IDS.BOMBAY, REGION_IDS.HYDERABAD, REGION_IDS.MADRAS],
    flagColor: 'silver',
  },
  [REGION_IDS.MADRAS]: {
    id: REGION_IDS.MADRAS,
    name: "Madras",
    unrest: 0,
    towerHeight: 0,
    towerHasFlag: false,
    towerHasFlagStar: false,
    companyControlled: true,
    orders: ['16', '17'],
    neighbors: [REGION_IDS.HYDERABAD, REGION_IDS.MYSORE],
    flagColor: 'silver',
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
  tailRegion: REGION_IDS.BOMBAY,
  headRegion: REGION_IDS.BOMBAY,
};

//order ids need for Peace
export const peaceOrderConnections: Record<string, string[]> = {
  [REGION_IDS.PUNJAB + REGION_IDS.PUNJAB]: ['1'],
  [REGION_IDS.DELHI + REGION_IDS.DELHI]: ['2','3','4'],
  [REGION_IDS.BOMBAY + REGION_IDS.BOMBAY]: ['7','8','9'],
  [REGION_IDS.BENGAL + REGION_IDS.BENGAL]: ['5','6'],
  [REGION_IDS.MARATHA + REGION_IDS.MARATHA]: ['10','11','12'],
  [REGION_IDS.HYDERABAD + REGION_IDS.HYDERABAD]: ['13'],
  [REGION_IDS.MYSORE + REGION_IDS.MYSORE]: ['14','15'],
  [REGION_IDS.MADRAS + REGION_IDS.MADRAS]: ['16','17'],
  [REGION_IDS.PUNJAB + REGION_IDS.BOMBAY]: ['1','7'],
  [REGION_IDS.BOMBAY + REGION_IDS.PUNJAB]: ['1','7'],
  [REGION_IDS.PUNJAB + REGION_IDS.DELHI]: ['1','2'],
  [REGION_IDS.DELHI + REGION_IDS.PUNJAB]: ['1','2'],
  [REGION_IDS.DELHI + REGION_IDS.BOMBAY]: ['3','7'],
  [REGION_IDS.BOMBAY + REGION_IDS.DELHI]: ['3','7'],
  [REGION_IDS.BOMBAY + REGION_IDS.MARATHA]: ['8','11'],
  [REGION_IDS.MARATHA + REGION_IDS.BOMBAY]: ['8','11'],
  [REGION_IDS.BOMBAY + REGION_IDS.HYDERABAD]: [],
  [REGION_IDS.HYDERABAD + REGION_IDS.BOMBAY]: [],
  [REGION_IDS.BOMBAY + REGION_IDS.MYSORE]: ['9','14'],
  [REGION_IDS.MYSORE + REGION_IDS.BOMBAY]: ['9','14'],
  [REGION_IDS.DELHI + REGION_IDS.MARATHA]: ['4','10'],
  [REGION_IDS.MARATHA + REGION_IDS.DELHI]: ['4','10'],
  [REGION_IDS.DELHI + REGION_IDS.BENGAL]: [],
  [REGION_IDS.BENGAL + REGION_IDS.DELHI]: [],
  [REGION_IDS.MARATHA + REGION_IDS.BENGAL]: ['5','10','12'],
  [REGION_IDS.BENGAL + REGION_IDS.MARATHA]: ['5','10','12'],
  [REGION_IDS.MARATHA + REGION_IDS.HYDERABAD]: ['12','13'],
  [REGION_IDS.HYDERABAD + REGION_IDS.MARATHA]: ['12','13'],
  [REGION_IDS.HYDERABAD + REGION_IDS.MYSORE]: ['13','15'],  
  [REGION_IDS.MYSORE + REGION_IDS.HYDERABAD]: ['13','15'],
  [REGION_IDS.HYDERABAD + REGION_IDS.MADRAS]: ['13','16'],  
  [REGION_IDS.MADRAS + REGION_IDS.HYDERABAD]: ['13','16'],
  [REGION_IDS.MYSORE + REGION_IDS.MADRAS]: ['15','17'],  
  [REGION_IDS.MADRAS + REGION_IDS.MYSORE]: ['15','17'],
}

export const elephantRedirectLookup: Record<string, ElephantState> = {
  ['circle' + REGION_IDS.PUNJAB]: {tailRegion: REGION_IDS.PUNJAB, headRegion: REGION_IDS.BOMBAY},
  ['square' + REGION_IDS.PUNJAB]: {tailRegion: REGION_IDS.PUNJAB, headRegion: REGION_IDS.DELHI},
  ['triangle' + REGION_IDS.PUNJAB]: {tailRegion: REGION_IDS.PUNJAB, headRegion: REGION_IDS.BOMBAY},
  ['circle' + REGION_IDS.DELHI]: {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.MARATHA},
  ['square' + REGION_IDS.DELHI]: {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.PUNJAB},
  ['triangle' + REGION_IDS.DELHI]: {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.BENGAL},
  ['circle' + REGION_IDS.BENGAL]: {tailRegion: REGION_IDS.BENGAL, headRegion: REGION_IDS.MARATHA},
  ['square' + REGION_IDS.BENGAL]: {tailRegion: REGION_IDS.BENGAL, headRegion: REGION_IDS.DELHI},
  ['triangle' + REGION_IDS.BENGAL]: {tailRegion: REGION_IDS.BENGAL, headRegion: REGION_IDS.DELHI},
  ['circle' + REGION_IDS.BOMBAY]: {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.MARATHA},
  ['square' + REGION_IDS.BOMBAY]: {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.HYDERABAD},
  ['triangle' + REGION_IDS.BOMBAY]: {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.PUNJAB },
  ['circle' + REGION_IDS.MARATHA]: {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.BOMBAY},
  ['square' + REGION_IDS.MARATHA]: {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.DELHI},
  ['triangle' + REGION_IDS.MARATHA]: {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.BENGAL },
  ['circle' + REGION_IDS.MYSORE]: {tailRegion: REGION_IDS.MYSORE, headRegion: REGION_IDS.BOMBAY},
  ['square' + REGION_IDS.MYSORE]: {tailRegion: REGION_IDS.MYSORE, headRegion: REGION_IDS.MADRAS},
  ['triangle' + REGION_IDS.MYSORE]: {tailRegion: REGION_IDS.MYSORE, headRegion: REGION_IDS.HYDERABAD },
  ['circle' + REGION_IDS.MADRAS]: {tailRegion: REGION_IDS.MADRAS, headRegion: REGION_IDS.HYDERABAD},
  ['square' + REGION_IDS.MADRAS]: {tailRegion: REGION_IDS.MADRAS, headRegion: REGION_IDS.MYSORE},
  ['triangle' + REGION_IDS.MADRAS]: {tailRegion: REGION_IDS.MADRAS, headRegion: REGION_IDS.MYSORE },
}

export const elephantBorderClockwise: Record<string, ElephantState[]> = {
  [REGION_IDS.PUNJAB]: [{tailRegion: REGION_IDS.PUNJAB, headRegion: REGION_IDS.DELHI}, 
                        {tailRegion: REGION_IDS.PUNJAB, headRegion: REGION_IDS.BOMBAY}],
  [REGION_IDS.DELHI]: [{tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.BENGAL},
                       {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.MARATHA},
                       {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.BOMBAY},
                       {tailRegion: REGION_IDS.DELHI, headRegion: REGION_IDS.PUNJAB}],
  [REGION_IDS.BENGAL]: [{tailRegion: REGION_IDS.BENGAL, headRegion: REGION_IDS.MARATHA},
                       {tailRegion: REGION_IDS.BENGAL, headRegion: REGION_IDS.DELHI}],
  [REGION_IDS.BOMBAY]: [{tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.PUNJAB},
                       {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.DELHI},
                       {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.MARATHA},
                       {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.HYDERABAD},
                       {tailRegion: REGION_IDS.BOMBAY, headRegion: REGION_IDS.MYSORE}],
  [REGION_IDS.MARATHA]:[{tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.DELHI},
                       {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.BENGAL},
                       {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.HYDERABAD},
                       {tailRegion: REGION_IDS.MARATHA, headRegion: REGION_IDS.BOMBAY}],
  [REGION_IDS.HYDERABAD]:[{tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.BOMBAY},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.MARATHA},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.MADRAS},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.MYSORE}],
  [REGION_IDS.MYSORE]:[{tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.BOMBAY},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.HYDERABAD},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.MADRAS}],
  [REGION_IDS.MADRAS]:[{tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.MYSORE},
                       {tailRegion: REGION_IDS.HYDERABAD, headRegion: REGION_IDS.HYDERABAD}],
}

export const initialState: GameState = {
  phase: 'company',
  regions: initialRegions,
  orders: initialOrders,
  peaceOrderConnections: peaceOrderConnections,
  elephantRedirectLookup: elephantRedirectLookup,
  elephantBorderClockwise: elephantBorderClockwise,
  currentEventId: undefined,
  currentEventRegion: undefined,
  eventDeck: initialEventDeck,
  discardedEvents: [],
  turn: 1,
  year: 1710,
  history: [],
  elephant: initialElephantState, 
  stormDie: 'none',
  crisisType: undefined,
  storm: stormDie,
  eventsRemaining: 0,
  eventPhaseComplete: false, 
};