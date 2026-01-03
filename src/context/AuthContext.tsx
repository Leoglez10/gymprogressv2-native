import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth';
import { storage, STORAGE_KEYS } from '../services/storage';
import { UserProfile } from '../types';

interface AuthContextType {
  // Estado de autenticación
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Perfil de usuario
  profile: UserProfile | null;

  // Estado de onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;

  // Acciones de autenticación
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Perfil
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    initializeAuth();
  }, []);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOnboardingCompleteState(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Verificar sesión existente
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        await loadProfile();
      }

      // Cargar estado de onboarding
      const setupComplete = await storage.get<boolean>(STORAGE_KEYS.SETUP_COMPLETE);
      setOnboardingCompleteState(setupComplete ?? false);

    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (savedProfile) {
        // Asegurar que tenga todas las propiedades requeridas
        const completeProfile: UserProfile = {
          ...savedProfile,
          goalSettings: savedProfile.goalSettings || {
            targetSessionsPerMonth: 12,
            targetVolumePerWeek: 15000,
            targetPRsPerMonth: 2,
            activeGoals: ['sessions', 'volume'],
          },
          notificationSettings: savedProfile.notificationSettings || {
            workoutReminders: true,
            weeklySummaries: true,
            aiTips: true,
          },
        };
        setProfile(completeProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const setOnboardingComplete = useCallback(async (value: boolean) => {
    setOnboardingCompleteState(value);
    await storage.set(STORAGE_KEYS.SETUP_COMPLETE, value);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authService.signInWithPassword(email, password);
    // El listener de onAuthStateChange manejará el resto
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    await authService.signUp(email, password, fullName);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOnboardingCompleteState(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPasswordForEmail(email);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates } as UserProfile;
    await storage.set(STORAGE_KEYS.USER_PROFILE, newProfile);
    setProfile(newProfile);
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    profile,
    onboardingComplete,
    setOnboardingComplete,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
