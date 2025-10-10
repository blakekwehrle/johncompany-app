import type { RegionId } from "../data/initialState";

export interface GameState {
  phase: 'event' | 'company' | 'analysis';
  regions: Record<string, Region>;
  orders: Record<string, Order>;
  currentEvent?: Event;
  eventDeck: Event[];
  discardedEvents: Event[];
  turn: number;
  year: number;
  history: GameState[];
  storm: Storm;
  eventsRemaining: number; 

  elephant: ElephantState;
  
  stormDie?: 'east' | 'west' | 'south' | 'none';
  crisisType?: 'rebellion' | 'invasion' | 'attack_on_company';
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
  northPriority: number; //1 is northernmost
}

export type EventType = 'windfall' | 'turmoil' | 'peace' | 'crisis' | 'leader' | 'foreign_invasion' | 'shuffle';

export type ElephantShape = 'circle' | 'square' | 'triangle' | undefined;

export interface ElephantState {
  tailRegion: string; 
  headRegion: string;
  isWithinRegion: boolean; 
}

export type StormDirection = 'east' | 'west' | 'south' | 'none';

export interface StormDieSide {
  value: number;
  direction: StormDirection;
  image: string;
}

export interface Storm {
  dieSides: StormDieSide[];
  currentRoll?: StormDieSide;
  isRolling: boolean;
}

export interface EventDeck {
  events: Event[];
  currentIndex: number;
}
export interface Event {
  id: string;
  type: EventType;
  title: string;
  description: string;
  imageUrl?: string;
  regionBack: string; // region on the back of this card/event
  strength?: string;
  effect: (state: GameState, currentRegion: string) => GameState; 

  crisisModifier: number;
  currentRegion?: string;
  shape?: ElephantShape;
  stormDirection?: 'east' | 'west' | 'south' | 'none';  // for foreign invasion
}

export interface UIState {
  selectedRegion: string | null;
  isModalOpen: boolean;
  isLoading: boolean;
  mapZoom: number;
  mapPan: { x: number; y: number };
}
