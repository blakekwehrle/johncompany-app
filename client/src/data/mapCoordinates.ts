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

export interface ElephantPosition extends MapPosition {
  regionIdFront: string;
  regionIdBack: string;
  rotation: string;
}

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
  [REGION_IDS.MADRAS]: { regionId: REGION_IDS.MADRAS, x: 47.75, y: 74.1 }
};

export const elephantPositions:  Record<string, ElephantPosition[]> = {
  [REGION_IDS.PUNJAB + REGION_IDS.PUNJAB]: [
    {regionIdFront: REGION_IDS.PUNJAB, regionIdBack: REGION_IDS.PUNJAB, rotation: "-rotate-[0deg]", x: 16.5, y: 8.7 }
  ],
  [REGION_IDS.DELHI + REGION_IDS.DELHI]: [
    {regionIdFront: REGION_IDS.DELHI, regionIdBack: REGION_IDS.DELHI, rotation: "rotate-[00deg]", x: 33.5, y: 6.7 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[0deg]", x: 28.5, y: 22 }
  ],
  [REGION_IDS.BENGAL + REGION_IDS.BENGAL]: [
    {regionIdFront: REGION_IDS.BENGAL, regionIdBack: REGION_IDS.BENGAL, rotation: "rotate-[0deg]", x: 87.5, y: 8.7 }
  ],
  [REGION_IDS.MARATHA + REGION_IDS.MARATHA]: [
    {regionIdFront: REGION_IDS.MARATHA, regionIdBack: REGION_IDS.MARATHA, rotation: "rotate-[0deg]", x: 55.5, y: 33.7 }
  ],
  [REGION_IDS.HYDERABAD + REGION_IDS.HYDERABAD]: [
    {regionIdFront: REGION_IDS.HYDERABAD, regionIdBack: REGION_IDS.HYDERABAD, rotation: "rotate-[0deg]", x: 46, y: 53 }
  ],
  [REGION_IDS.MYSORE + REGION_IDS.MYSORE]: [
    {regionIdFront: REGION_IDS.MYSORE, regionIdBack: REGION_IDS.MYSORE, rotation: "rotate-[0deg]", x: 37.5, y: 81 }
  ],
  [REGION_IDS.MADRAS + REGION_IDS.MADRAS]: [
    {regionIdFront: REGION_IDS.MADRAS, regionIdBack: REGION_IDS.MADRAS, rotation: "rotate-[0deg]", x: 46.8, y: 66.7 }
  ],
  [REGION_IDS.PUNJAB + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.PUNJAB, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[160deg]", x: 18, y: 18 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.PUNJAB]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.PUNJAB, rotation: "rotate-[-20deg]", x: 17.5, y: 18 }
  ],
  [REGION_IDS.PUNJAB + REGION_IDS.DELHI]: [
    {regionIdFront: REGION_IDS.PUNJAB, regionIdBack: REGION_IDS.DELHI, rotation: "-rotate-[260deg]", x: 25.5, y: 10.5 }
  ],
  [REGION_IDS.DELHI + REGION_IDS.PUNJAB]: [
    {regionIdFront: REGION_IDS.DELHI, regionIdBack: REGION_IDS.PUNJAB, rotation: "rotate-[-70deg]", x: 25.5, y: 10.5 }
  ],
  [REGION_IDS.DELHI + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.DELHI, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[210deg]", x: 30.5, y: 15.2 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.DELHI]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.DELHI, rotation: "rotate-[40deg]", x: 30.3, y: 15.7 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.MARATHA]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.MARATHA, rotation: "rotate-[85deg]", x: 33.2, y: 27.5 }
  ],
  [REGION_IDS.MARATHA + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.MARATHA, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[265deg]", x: 33.2, y: 27.5 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.HYDERABAD]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.HYDERABAD, rotation: "rotate-[110deg]", x: 31, y: 42.7 }
  ],
  [REGION_IDS.HYDERABAD + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.HYDERABAD, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[290deg]", x: 31, y: 42.7 }
  ],
  [REGION_IDS.BOMBAY + REGION_IDS.MYSORE]: [
    {regionIdFront: REGION_IDS.BOMBAY, regionIdBack: REGION_IDS.MYSORE, rotation: "-rotate-[190deg]", x: 28.8, y: 59 }
  ],
  [REGION_IDS.MYSORE + REGION_IDS.BOMBAY]: [
    {regionIdFront: REGION_IDS.MYSORE, regionIdBack: REGION_IDS.BOMBAY, rotation: "rotate-[-15deg]", x: 28.8, y: 59 }
  ],
  [REGION_IDS.DELHI + REGION_IDS.MARATHA]: [
    {regionIdFront: REGION_IDS.DELHI, regionIdBack: REGION_IDS.MARATHA, rotation: "rotate-[185deg]", x: 41.5, y: 17.2 }
  ],
  [REGION_IDS.MARATHA + REGION_IDS.DELHI]: [
    {regionIdFront: REGION_IDS.MARATHA, regionIdBack: REGION_IDS.DELHI, rotation: "rotate-[10deg]", x: 41.4, y: 16.7 }
  ],
  [REGION_IDS.DELHI + REGION_IDS.BENGAL]: [
    {regionIdFront: REGION_IDS.DELHI, regionIdBack: REGION_IDS.BENGAL, rotation: "rotate-[145deg]", x: 66, y: 14.5 }
  ],
  [REGION_IDS.BENGAL + REGION_IDS.DELHI]: [
    {regionIdFront: REGION_IDS.BENGAL, regionIdBack: REGION_IDS.DELHI, rotation: "rotate-[315deg]", x: 66, y: 14.5 }
  ],
  [REGION_IDS.MARATHA + REGION_IDS.BENGAL]: [
    {regionIdFront: REGION_IDS.MARATHA, regionIdBack: REGION_IDS.BENGAL, rotation: "rotate-[5deg]", x: 75, y: 30.5 }
  ],
  [REGION_IDS.BENGAL + REGION_IDS.MARATHA]: [
    {regionIdFront: REGION_IDS.BENGAL, regionIdBack: REGION_IDS.MARATHA, rotation: "rotate-[185deg]", x: 75, y: 30.5 }
  ],
  [REGION_IDS.MARATHA + REGION_IDS.HYDERABAD]: [
    {regionIdFront: REGION_IDS.MARATHA, regionIdBack: REGION_IDS.HYDERABAD, rotation: "rotate-[205deg]", x: 53, y: 46 }
  ],
  [REGION_IDS.HYDERABAD + REGION_IDS.MARATHA]: [
    {regionIdFront: REGION_IDS.HYDERABAD, regionIdBack: REGION_IDS.MARATHA, rotation: "rotate-[25deg]", x: 53, y: 46 }
  ],
  [REGION_IDS.HYDERABAD + REGION_IDS.MYSORE]: [
    {regionIdFront: REGION_IDS.HYDERABAD, regionIdBack: REGION_IDS.MYSORE, rotation: "rotate-[180deg]", x: 38.2, y: 59.8 }
  ],  
  [REGION_IDS.MYSORE + REGION_IDS.HYDERABAD]: [
    {regionIdFront: REGION_IDS.MYSORE, regionIdBack: REGION_IDS.HYDERABAD, rotation: "rotate-[0deg]", x: 39, y: 59.8 }
  ],
  [REGION_IDS.HYDERABAD + REGION_IDS.MADRAS]: [
    {regionIdFront: REGION_IDS.HYDERABAD, regionIdBack: REGION_IDS.MADRAS, rotation: "-rotate-[185deg]", x: 45, y: 61.3 }
  ],  
  [REGION_IDS.MADRAS + REGION_IDS.HYDERABAD]: [
    {regionIdFront: REGION_IDS.MADRAS, regionIdBack: REGION_IDS.HYDERABAD, rotation: "rotate-[5deg]", x: 45, y: 61.3 }
  ],
  [REGION_IDS.MYSORE + REGION_IDS.MADRAS]: [
    {regionIdFront: REGION_IDS.MYSORE, regionIdBack: REGION_IDS.MADRAS, rotation: "-rotate-[315deg]", x: 43.5, y: 70 }
  ],  
  [REGION_IDS.MADRAS + REGION_IDS.MYSORE]: [
    {regionIdFront: REGION_IDS.MADRAS, regionIdBack: REGION_IDS.MYSORE, rotation: "rotate-[240deg]", x: 43.5, y: 70 }
  ],
}