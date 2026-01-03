import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper de AsyncStorage que imita la API de localStorage
 * para facilitar la migracion desde web
 */
export const storageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading ' + key + ':', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing ' + key + ':', error);
    }
  },

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error writing ' + key + ':', error);
    }
  },

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        // If JSON parse fails, return the raw value
        return value as any;
      }
    } catch (error) {
      console.error('Error getting ' + key + ':', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing ' + key + ':', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },

  async getJSON<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.getItem(key);
    if (value === null) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },
};

// Alias para compatibilidad
export const storage = storageService;

// Constantes de keys
export const STORAGE_KEYS = {
  WORKOUT_HISTORY: 'gymProgress_workout_history',
  USER_PROFILE: 'gymProgress_user_profile',
  EXERCISES: 'gymProgress_exercises',
  CUSTOM_ROUTINES: 'gymProgress_custom_routines',
  ACTIVE_SESSION_STATE: 'gymProgress_active_session_state',
  DASHBOARD_WIDGETS: 'gymProgress_dashboard_widgets_v3',
  DAILY_WELLNESS: 'gymProgress_daily_wellness',
  SETUP_COMPLETE: 'gymProgress_setup_complete',
  ENTITLEMENTS: 'gym_entitlements_v1',
  TOUR_STATE: 'gym_tour_state',
  ACC_CONTRAST: 'gym_acc_contrast',
  ACC_MOTION: 'gym_acc_motion',
  ACC_HIGHLIGHT: 'gym_acc_highlight',
  ONBOARDING_COMPLETE: 'gymProgress_onboarding_complete',
} as const;
