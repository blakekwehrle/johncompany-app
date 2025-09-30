import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User preferences
  email: string;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  
  // App data
  subscribedUsers: string[];
  launchDate: Date;
  
  // Actions
  setEmail: (email: string) => void;
  toggleNotifications: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addSubscribedUser: (email: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      email: '',
      notificationsEnabled: true,
      theme: 'light',
      subscribedUsers: [],
      launchDate: new Date(2025, 10, 21), // December 15, 2025
      
      // Actions
      setEmail: (email: string) => set({ email }),
      
      toggleNotifications: () => set((state) => ({ 
        notificationsEnabled: !state.notificationsEnabled 
      })),
      
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      
      addSubscribedUser: (email: string) => set((state) => ({
        subscribedUsers: [...state.subscribedUsers, email]
      })),
    }),
    {
      name: 'john-company-app-storage', // name for the persisted storage
    }
  )
);
