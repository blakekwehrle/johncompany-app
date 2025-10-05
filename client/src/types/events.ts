import type { Event } from '../types/game';

export const events: Event[] = [
  {
    id: 'windfall',
    title: 'Windfall',
    description: '',
    imageUrl: '/assets/images/events/event1.jpg',
    effect: (state) => {
      // effect logic here. small example
      return { ...state, regions: { ...state.regions, bengal: { ...state.regions.bengal, unrest: state.regions.bengal.unrest + 2 } } };
    }
  },
];
