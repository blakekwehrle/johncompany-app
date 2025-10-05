import type { RegionId } from "../data/initialState";

export interface GameState {
  phase: 'event' | 'company' | 'analysis';
  regions: Record<string, Region>;
  currentEvent?: Event;
  eventDeck: Event[];
  discardedEvents: Event[];
  turn: number;
  year: number;
  history: GameState[];
}

export interface Region {
  id: string;
  name: string;
  unrest: number;
  towerHeight: number;
  towerHasFlag: boolean;
  elephantFacing: boolean;
  elephantBackRegion: string | null; // Reference by ID
  companyControlled: boolean;
  orders: string[]; // Array of order IDs
  neighbors: RegionId[];  // Array of region IDs
  color: string;
  svgPath?: string;
}

export interface Order {
  id: string; 
  open: boolean;
  price: number;
  priceSecondary: number;
  region: string; // region ID
  neighbors: string[]; // Array of order IDs
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  effect: (state: GameState) => GameState;
}

export interface UIState {
  selectedRegion: string | null;
  isModalOpen: boolean;
  isLoading: boolean;
  mapZoom: number;
  mapPan: { x: number; y: number };
}
