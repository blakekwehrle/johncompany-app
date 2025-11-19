import type { RegionId } from "../data/initialState";

export interface GameState {
  phase: 'event' | 'company' | 'analysis';
  regions: Record<string, Region>;
  orders: Record<string, Order>;
  peaceOrderConnections: Record<string, string[]>;

  currentEventId?: string; //eventids instead of event objects
  currentEventRegion?: string; 
  eventDeck: string[];
  discardedEvents: string[];
  turn: number;
  year: number;
  history: GameState[];
  storm: Storm;
  eventsRemaining: number; 

  elephant: ElephantState;
  elephantRedirectLookup: Record<string, ElephantState> ;
  stormDie?: 'east' | 'west' | 'south' | 'none';
  crisisType?: 'rebellion' | 'invasion' | 'attack_on_company';
  eventPhaseComplete: boolean;
}

export interface Region {
  id: string;
  name: string;
  unrest: number;
  towerHeight: number;
  towerHasFlag: boolean;
  towerHasFlagStar: boolean;
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
}

export type StormDirection = 'the east' | 'the west' | 'the south' | 'all seas' |'none';

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
  image: string;
  imageBack: string;
  description: string;
  imageUrl?: string;
  regionBack: string; // region on the back of this card/event
  strength?: string;
  crisisModifier: number;
  currentRegion?: string;
  shape?: ElephantShape;
}

export interface EventDefinition extends Event {
  effect: (state: GameState, currentRegion: string) => GameState;
}

export interface UIState {
  selectedRegion: string | null;
  isModalOpen: boolean;
  isLoading: boolean;
  mapZoom: number;
  mapPan: { x: number; y: number };
}
