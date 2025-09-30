import { create } from 'zustand';

interface AppState {
  launchDate: Date;
}

export const useStore = create<AppState>(() => ({
  launchDate: new Date(2025, 10, 21), 
}));
