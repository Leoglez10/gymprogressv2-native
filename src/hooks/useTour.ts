import { useState, useEffect, useCallback, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { TourStep, Screen } from '../types';

interface TourState {
  hasSeenIntro: boolean;
  hasCompletedTour: boolean;
  dismissedTour: boolean;
  currentStepIndex: number;
}

// Configuración de pasos del tour
const TOUR_STEPS: TourStep[] = [
  {
    target: 'dashboard-stats',
    title: '📊 Tu Panel de Control',
    content: 'Aquí verás tu progreso semanal, volumen total y estado de fatiga en tiempo real.',
    position: 'bottom',
    badge: 'NUEVO',
    screen: 'Dashboard' as Screen,
  },
  {
    target: 'acwr-widget',
    title: '⚡ Ratio de Fatiga (ACWR)',
    content: 'Este indicador te dice si estás entrenando en la zona óptima o si necesitas descansar.',
    position: 'bottom',
    badge: 'PRO',
    screen: 'Dashboard' as Screen,
  },
  {
    target: 'volume-chart',
    title: '📈 Gráfico de Volumen',
    content: 'Sigue tu progresión semanal de volumen total. La consistencia es clave para resultados.',
    position: 'top',
    screen: 'Dashboard' as Screen,
  },
  {
    target: 'start-workout-btn',
    title: '💪 Iniciar Entrenamiento',
    content: 'Empieza una sesión rápida, elige una rutina predefinida o registra un entrenamiento manual.',
    position: 'top',
    screen: 'StartWorkout' as Screen,
  },
  {
    target: 'routine-cards',
    title: '📋 Tus Rutinas',
    content: 'Crea y guarda rutinas personalizadas. Las usarás para trackear cada entrenamiento.',
    position: 'bottom',
    screen: 'StartWorkout' as Screen,
  },
  {
    target: 'stats-calendar',
    title: '📅 Calendario de Entrenamientos',
    content: 'Visualiza todos tus días de entrenamiento y revisa sesiones anteriores.',
    position: 'bottom',
    screen: 'Stats' as Screen,
  },
  {
    target: 'pr-tracking',
    title: '🏆 Records Personales',
    content: 'Seguimiento automático de tus PRs. Celebra cada nuevo récord.',
    position: 'top',
    badge: 'PRO',
    screen: 'Stats' as Screen,
  },
  {
    target: 'profile-settings',
    title: '⚙️ Personalización',
    content: 'Ajusta unidades, notificaciones y sincroniza con Strava o Apple Health.',
    position: 'bottom',
    screen: 'Profile' as Screen,
  },
];

const INITIAL_STATE: TourState = {
  hasSeenIntro: false,
  hasCompletedTour: false,
  dismissedTour: false,
  currentStepIndex: 0,
};

export function useTour() {
  const [tourState, setTourState] = useState<TourState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estado inicial
  useEffect(() => {
    loadTourState();
  }, []);

  const loadTourState = async () => {
    try {
      setIsLoading(true);
      const saved = await storage.get<TourState>(STORAGE_KEYS.TOUR_STATE);
      if (saved) {
        setTourState(saved);
      }
    } catch (error) {
      console.error('Error loading tour state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTourState = async (newState: TourState) => {
    try {
      await storage.set(STORAGE_KEYS.TOUR_STATE, newState);
      setTourState(newState);
    } catch (error) {
      console.error('Error saving tour state:', error);
    }
  };

  // Estado derivado
  const isActive = useMemo(() => {
    return tourState.hasSeenIntro && 
           !tourState.hasCompletedTour && 
           !tourState.dismissedTour;
  }, [tourState]);

  const currentStep = useMemo(() => {
    return TOUR_STEPS[tourState.currentStepIndex] || null;
  }, [tourState.currentStepIndex]);

  const totalSteps = TOUR_STEPS.length;

  const progress = useMemo(() => {
    return Math.round(((tourState.currentStepIndex + 1) / totalSteps) * 100);
  }, [tourState.currentStepIndex, totalSteps]);

  // Pasos del tour filtrados por pantalla actual
  const getStepsForScreen = useCallback((screen: Screen) => {
    return TOUR_STEPS.filter(step => step.screen === screen);
  }, []);

  // Acciones
  const markIntroSeen = useCallback(async () => {
    const newState = { ...tourState, hasSeenIntro: true };
    await saveTourState(newState);
  }, [tourState]);

  const startTour = useCallback(async () => {
    const newState = {
      ...tourState,
      hasSeenIntro: true,
      hasCompletedTour: false,
      dismissedTour: false,
      currentStepIndex: 0,
    };
    await saveTourState(newState);
  }, [tourState]);

  const nextStep = useCallback(async () => {
    if (tourState.currentStepIndex < totalSteps - 1) {
      const newState = {
        ...tourState,
        currentStepIndex: tourState.currentStepIndex + 1,
      };
      await saveTourState(newState);
      return true;
    } else {
      // Último paso, completar tour
      await completeTour();
      return false;
    }
  }, [tourState, totalSteps]);

  const prevStep = useCallback(async () => {
    if (tourState.currentStepIndex > 0) {
      const newState = {
        ...tourState,
        currentStepIndex: tourState.currentStepIndex - 1,
      };
      await saveTourState(newState);
      return true;
    }
    return false;
  }, [tourState]);

  const goToStep = useCallback(async (index: number) => {
    if (index >= 0 && index < totalSteps) {
      const newState = {
        ...tourState,
        currentStepIndex: index,
      };
      await saveTourState(newState);
    }
  }, [tourState, totalSteps]);

  const completeTour = useCallback(async () => {
    const newState = {
      ...tourState,
      hasCompletedTour: true,
      currentStepIndex: totalSteps - 1,
    };
    await saveTourState(newState);
  }, [tourState, totalSteps]);

  const dismissTour = useCallback(async () => {
    const newState = {
      ...tourState,
      dismissedTour: true,
    };
    await saveTourState(newState);
  }, [tourState]);

  const resetTour = useCallback(async () => {
    await saveTourState(INITIAL_STATE);
  }, []);

  // Navegar a la pantalla del paso actual
  const getCurrentScreen = useCallback((): Screen | null => {
    return currentStep?.screen || null;
  }, [currentStep]);

  return {
    // Estado
    tourState,
    isLoading,
    isActive,
    currentStep,
    currentStepIndex: tourState.currentStepIndex,
    totalSteps,
    progress,
    
    // Estado flags
    hasSeenIntro: tourState.hasSeenIntro,
    hasCompletedTour: tourState.hasCompletedTour,
    dismissedTour: tourState.dismissedTour,
    
    // Datos
    allSteps: TOUR_STEPS,
    getStepsForScreen,
    getCurrentScreen,
    
    // Acciones
    markIntroSeen,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    completeTour,
    dismissTour,
    resetTour,
    
    // Refresh
    refresh: loadTourState,
  };
}
