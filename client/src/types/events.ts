import type { EventDefinition, GameState } from '../types/game';
import { closeNorthernmostOrder, areAllOrdersClosed, startCascade } from '../utils/gameLogic';


import bengal_img from '../assets/images/ganjifa/backs/ganjifa_bengal.png';
import bombay_img from '../assets/images/ganjifa/backs/ganjifa_bombay.png';
import delhi_img from '../assets/images/ganjifa/backs/ganjifa_delhi.png';
import hyderabad_img from '../assets/images/ganjifa/backs/ganjifa_hyderabad.png';

import madras_img from '../assets/images/ganjifa/backs/ganjifa_madras.png';
import maratha_img from '../assets/images/ganjifa/backs/ganjifa_maratha.png';
import mysore_img from '../assets/images/ganjifa/backs/ganjifa_mysore.png';
import punjab_img from '../assets/images/ganjifa/backs/ganjifa_punjab.png';

import crisis_1_img from '../assets/images/ganjifa/ganjifa_crisis_1.png';
import crisis_2_img from '../assets/images/ganjifa/ganjifa_crisis_2.png';
import crisis_3_img from '../assets/images/ganjifa/ganjifa_crisis_3.png';
import crisis_4_img from '../assets/images/ganjifa/ganjifa_crisis_4.png';
import crisis_5_img from '../assets/images/ganjifa/ganjifa_crisis_5.png';
import crisis_6_img from '../assets/images/ganjifa/ganjifa_crisis_6.png';
import foreign_invasion_img from '../assets/images/ganjifa/ganjifa_foreign_invasion.png';
import leader_1_img from '../assets/images/ganjifa/ganjifa_leader_1.png';
import leader_2_img from '../assets/images/ganjifa/ganjifa_leader_2.png';
import leader_3_img from '../assets/images/ganjifa/ganjifa_leader_3.png';
import leader_4_img from '../assets/images/ganjifa/ganjifa_leader_4.png';
import peace_1_img from '../assets/images/ganjifa/ganjifa_peace_1.png';
import peace_2_img from '../assets/images/ganjifa/ganjifa_peace_2.png';
import shuffle_img from '../assets/images/ganjifa/ganjifa_shuffle.png';
import turmoil_1_img from '../assets/images/ganjifa/ganjifa_turmoil_1.png';
import turmoil_2_img from '../assets/images/ganjifa/ganjifa_turmoil_2.png';
import turmoil_3_img from '../assets/images/ganjifa/ganjifa_turmoil_3.png';
import turmoil_4_img from '../assets/images/ganjifa/ganjifa_turmoil_4.png';
import windfall_1_img from '../assets/images/ganjifa/ganjifa_windfall_1.png';
import windfall_2_img from '../assets/images/ganjifa/ganjifa_windfall_2.png';

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

// This contains all event definitions with their effect functions
export const eventDefinitions: Record<string, EventDefinition> = {
  // WINFALL EVENTS
  'windfall_1': {
    id: 'windfall_1',
    type: 'windfall',
    title: 'Windfall',
    image: windfall_1_img,
    imageBack: bombay_img,
    description: 'Players with writers in the region and adjacent regions each receive £1.',
    regionBack: REGION_IDS.BOMBAY,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Windfall in ${currentRegion}! Writers in ${currentRegion} and adjacent regions receive money`);
      return state;
    }
  },
  'windfall_2':{
    id: 'windfall_2', 
    type: 'windfall',
    title: 'Windfall',
    image: windfall_2_img,
    imageBack: bengal_img,
    description: 'Players with writers in the region and adjacent regions each receive £1.',
    regionBack: REGION_IDS.BENGAL,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Windfall in ${currentRegion}! Writers in ${currentRegion} and adjacent regions receive money`);
      return state;
    }
  },
  'turmoil_1':{
    id: 'turmoil_1',
    type: 'turmoil',
    title: 'Turmoil',
    image: turmoil_1_img,
    imageBack: madras_img,
    description: 'Close the northernmost open order in the region. May cascade.',
    regionBack: REGION_IDS.MADRAS,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Turmoil in ${currentRegion}: Closing northernmost open order`);
      return state;
    }
  },
  'turmoil_2':{
    id: 'turmoil_2',
    type: 'turmoil',
    title: 'Turmoil',
    image: turmoil_2_img,
    imageBack: maratha_img,
    description: 'Close the northernmost open order in the region. May cascade.',
    regionBack: REGION_IDS.MARATHA,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Turmoil in ${currentRegion}: Closing northernmost open order`);
      return state;
    }
  },
  'peace_1':{
    id: 'peace_1',
    type: 'peace',
    title: 'Peace Negotiations',
    image: peace_1_img,
    imageBack: hyderabad_img,
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
  'peace_2':{
    id: 'peace_2', 
    type: 'peace',
    title: 'Peace Negotiations',
    image: peace_2_img,
    imageBack: mysore_img,
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
  'crisis_1':{
    id: 'crisis_1',
    type: 'crisis',
    title: 'Resolve Crisis',
    image: crisis_1_img,
    imageBack: punjab_img,
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
  'leader_1':{
    id: 'leader_1',
    type: 'leader',
    title: 'Leader Emerges',
    image: leader_1_img,
    imageBack: hyderabad_img,
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
  'leader_2':{
    id: 'leader_2',
    type: 'leader',
    title: 'Leader Emerges',
    image: leader_2_img,
    imageBack: bengal_img,
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
  'leader_3':{
    id: 'leader_3',
    type: 'leader',
    title: 'Leader Emerges',
    image: leader_3_img,
    imageBack: punjab_img,
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
  'leader_4':{
    id: 'leader_4',
    type: 'leader',
    title: 'Leader Emerges',
    image: leader_4_img,
    imageBack: bombay_img,
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
  'foreign_invasion_1':{
    id: 'foreign_invasion_1',
    type: 'foreign_invasion',
    title: 'Foreign Invasion',
    image: foreign_invasion_img,
    imageBack: madras_img,
    description: 'Roll storm die for invasions in east, west, south, or top region.',
    regionBack: REGION_IDS.MADRAS,
    strength: '2',
    crisisModifier: 0,
    effect: (state: GameState) => {
     console.log(`Foreign invasion event - storm die will determine affected regions`);
      // The actual resolution happens in the store's resolveForeignInvasion
     return state;
    }
  },
  'shuffle_1':{
    id: 'shuffle_1',
    type: 'shuffle',
    title: 'Deck Shuffle',
    image: shuffle_img,
    imageBack: delhi_img,
    description: 'Redirect elephant and shuffle event deck.',
    regionBack: REGION_IDS.DELHI,
    strength: undefined,
    crisisModifier: 0,
    effect: (state: GameState, currentRegion: string) => {
      console.log(`Shuffle event - moving elephant to ${currentRegion}`);
      return state;
    }
  }
};

// Helper to get an event definition by ID
export const getEventDefinition = (eventId: string): EventDefinition => {
  const definition = eventDefinitions[eventId];
  if (!definition) {
    throw new Error(`Event definition not found for ID: ${eventId}`);
  }
  return definition;
};

// Get all event IDs for initial deck
export const getAllEventIds = (): string[] => {
  return Object.keys(eventDefinitions);
};
