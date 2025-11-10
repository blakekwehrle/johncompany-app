// src/data/mapCoordinates.ts

import { REGION_IDS } from './initialState';

export interface MapPosition {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
}

export interface OrderPosition extends MapPosition {
  orderId: string;
}

export interface TowerPosition extends MapPosition {
  regionId: string;
}

export interface UnrestPosition extends MapPosition {
  regionId: string;
}

// Order positions for each region (approximate positions - you'll need to adjust these)
export const orderPositions: Record<string, OrderPosition[]> = {
  [REGION_IDS.PUNJAB]: [
    { orderId: '1', x: 20.5, y: 7.7 }
  ],
  [REGION_IDS.DELHI]: [
    { orderId: '2', x: 40.3, y: 6.5 },
    { orderId: '3', x: 35.8, y: 14.5 },
    { orderId: '4', x: 53.3, y: 12 }
  ],
  [REGION_IDS.BENGAL]: [
    { orderId: '5', x: 70.4, y: 23.2 },
    { orderId: '6', x: 84.4, y: 33.1 }
  ],
  [REGION_IDS.BOMBAY]: [
    { orderId: '7', x: 23.7, y: 19 },
    { orderId: '8', x: 29.8, y: 33.2 },
    { orderId: '9', x: 21.8, y: 43.5 }
  ],
  [REGION_IDS.MARATHA]: [
    { orderId: '10', x: 55.1, y: 22.4 },
    { orderId: '11', x: 40.8, y: 33.7 },
    { orderId: '12', x: 62.6, y: 41 }
  ],
  [REGION_IDS.HYDERABAD]: [
    { orderId: '13', x: 49.62, y: 54.8 }
  ],
  [REGION_IDS.MYSORE]: [
    { orderId: '14', x: 32.8, y: 62.1 },
    { orderId: '15', x: 38.2, y: 71.7 }
  ],
  [REGION_IDS.MADRAS]: [
    { orderId: '16', x: 51.9, y: 71.5 },
    { orderId: '17', x: 47.5, y: 79.7 }
  ]
};

// Tower positions for each region (center of each region)
export const towerPositions: Record<string, TowerPosition> = {
  [REGION_IDS.PUNJAB]: { regionId: REGION_IDS.PUNJAB, x: 10.3, y: 9.38 },
  [REGION_IDS.DELHI]: { regionId: REGION_IDS.DELHI, x: 58.9, y: 7.1 },
  [REGION_IDS.BENGAL]: { regionId: REGION_IDS.BENGAL, x: 81.2, y: 22.1 },
  [REGION_IDS.BOMBAY]: { regionId: REGION_IDS.BOMBAY, x: 25.19, y: 53 },
  [REGION_IDS.MARATHA]: { regionId: REGION_IDS.MARATHA, x: 45.7, y: 22.1 },
  [REGION_IDS.HYDERABAD]: { regionId: REGION_IDS.HYDERABAD, x: 37.5, y: 54.72 },
  [REGION_IDS.MYSORE]: { regionId: REGION_IDS.MYSORE, x: 29.41, y: 75.03 },
  [REGION_IDS.MADRAS]: { regionId: REGION_IDS.MADRAS, x: 47.75, y: 88.8 }
};
export const unrestPositions: Record<string, UnrestPosition> = {
  [REGION_IDS.PUNJAB]: { regionId: REGION_IDS.PUNJAB, x: 17.3, y: 15.38 },
  [REGION_IDS.DELHI]: { regionId: REGION_IDS.DELHI, x: 48.9, y: 7.1 },
  [REGION_IDS.BENGAL]: { regionId: REGION_IDS.BENGAL, x: 74.2, y: 12.1 },
  [REGION_IDS.BOMBAY]: { regionId: REGION_IDS.BOMBAY, x: 19.1, y: 29 },
  [REGION_IDS.MARATHA]: { regionId: REGION_IDS.MARATHA, x: 55.7, y: 34.1 },
  [REGION_IDS.HYDERABAD]: { regionId: REGION_IDS.HYDERABAD, x: 47.5, y: 48.72 },
  [REGION_IDS.MYSORE]: { regionId: REGION_IDS.MYSORE, x: 39.41, y: 83.03 },
  [REGION_IDS.MADRAS]: { regionId: REGION_IDS.MADRAS, x: 46.75, y: 67.8 }
};