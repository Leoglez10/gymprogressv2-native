import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useTour } from '../hooks/useTour';
import { TourOverlay, WelcomeTourModal } from '../components/ui';
import { TourStep, Screen } from '../types';

interface TourContextType {
  // Estado
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  hasSeenIntro: boolean;
  hasCompletedTour: boolean;
  
  // Acciones
  startTour: () => Promise<void>;
  nextStep: () => Promise<boolean>;
  prevStep: () => Promise<boolean>;
  dismissTour: () => Promise<void>;
  resetTour: () => Promise<void>;
  
  // Registrar layouts de targets
  registerTarget: (id: string, layout: { x: number; y: number; width: number; height: number }) => void;
  
  // Para navegación
  getCurrentScreen: () => Screen | null;
  getStepsForScreen: (screen: Screen) => TourStep[];
}

const TourContext = createContext<TourContextType | null>(null);

interface TourProviderProps {
  children: ReactNode;
  userName?: string;
}

export function TourProvider({ children, userName }: TourProviderProps) {
  const tour = useTour();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [targetLayouts, setTargetLayouts] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});
  
  // Mostrar welcome modal si no ha visto el intro
  useEffect(() => {
    if (!tour.isLoading && !tour.hasSeenIntro && !tour.hasCompletedTour) {
      // Pequeño delay para que la app cargue primero
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tour.isLoading, tour.hasSeenIntro, tour.hasCompletedTour]);
  
  const handleStartTour = useCallback(async () => {
    setShowWelcomeModal(false);
    await tour.startTour();
  }, [tour]);
  
  const handleSkipTour = useCallback(async () => {
    setShowWelcomeModal(false);
    await tour.markIntroSeen();
    await tour.dismissTour();
  }, [tour]);
  
  const handleNextStep = useCallback(async () => {
    const hasMore = await tour.nextStep();
    return hasMore;
  }, [tour]);
  
  const handlePrevStep = useCallback(async () => {
    const hasPrev = await tour.prevStep();
    return hasPrev;
  }, [tour]);
  
  const handleDismissTour = useCallback(async () => {
    await tour.dismissTour();
  }, [tour]);
  
  const registerTarget = useCallback((id: string, layout: { x: number; y: number; width: number; height: number }) => {
    setTargetLayouts(prev => ({
      ...prev,
      [id]: layout,
    }));
  }, []);
  
  // Obtener layout del target actual
  const currentTargetLayout = tour.currentStep 
    ? targetLayouts[tour.currentStep.target] || null 
    : null;

  const value: TourContextType = {
    isActive: tour.isActive,
    currentStep: tour.currentStep,
    currentStepIndex: tour.currentStepIndex,
    totalSteps: tour.totalSteps,
    progress: tour.progress,
    hasSeenIntro: tour.hasSeenIntro,
    hasCompletedTour: tour.hasCompletedTour,
    startTour: handleStartTour,
    nextStep: handleNextStep,
    prevStep: handlePrevStep,
    dismissTour: handleDismissTour,
    resetTour: tour.resetTour,
    registerTarget,
    getCurrentScreen: tour.getCurrentScreen,
    getStepsForScreen: tour.getStepsForScreen,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      
      {/* Welcome Tour Modal */}
      <WelcomeTourModal
        visible={showWelcomeModal}
        userName={userName}
        onStartTour={handleStartTour}
        onSkip={handleSkipTour}
      />
      
      {/* Tour Overlay */}
      <TourOverlay
        visible={tour.isActive}
        step={tour.currentStep}
        stepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        progress={tour.progress}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onDismiss={handleDismissTour}
        targetLayout={currentTargetLayout}
      />
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}
