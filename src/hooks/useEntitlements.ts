import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { entitlementsService } from '../services/entitlements';
import { EntitlementsState } from '../types';

interface StripePrices {
  monthly: { id: string; price: string };
  yearly: { id: string; price: string; savings: string };
}

// Precios de Stripe (se obtendrían del backend en producción)
const STRIPE_PRICES: StripePrices = {
  monthly: { id: 'price_monthly_placeholder', price: '$9.99' },
  yearly: { id: 'price_yearly_placeholder', price: '$79.99', savings: 'Ahorra 33%' },
};

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<EntitlementsState>(entitlementsService.getState());
  const [isLoading, setIsLoading] = useState(true);
  const [stripePrices] = useState<StripePrices>(STRIPE_PRICES);

  // Cargar estado inicial y suscribirse a cambios
  useEffect(() => {
    const loadState = async () => {
      try {
        setIsLoading(true);
        await entitlementsService.init();
        setEntitlements(entitlementsService.getState());
      } catch (error) {
        console.error('Error loading entitlements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();

    // Suscribirse a cambios
    const unsubscribe = entitlementsService.subscribe(() => {
      setEntitlements(entitlementsService.getState());
    });

    return () => unsubscribe();
  }, []);

  // Estados derivados
  const isPro = entitlements.plan === 'pro';
  const isTrial = entitlements.plan === 'trial';
  const isFree = entitlements.plan === 'free';
  const limits = entitlementsService.getLimits();

  const isTrialActive = useCallback(() => {
    if (entitlements.plan !== 'trial' || !entitlements.trialStartDate) return false;
    const trialEnd = entitlements.trialStartDate + (entitlements.trialDurationDays * 24 * 60 * 60 * 1000);
    return Date.now() < trialEnd;
  }, [entitlements]);

  const getTrialDaysRemaining = useCallback(() => {
    if (!entitlements.trialStartDate) return 0;
    const trialEnd = entitlements.trialStartDate + (entitlements.trialDurationDays * 24 * 60 * 60 * 1000);
    const diff = trialEnd - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [entitlements]);

  // Verificar si puede usar una función
  const checkAI = useCallback((): boolean => {
    if (isPro) return true;

    if (isTrial && isTrialActive()) {
      return entitlements.usage.aiCalls < limits.trial.maxAICalls;
    }

    return false; // Free no tiene acceso a AI
  }, [isPro, isTrial, isTrialActive, entitlements.usage.aiCalls, limits]);

  const checkSession = useCallback((): boolean => {
    if (isPro) return true;

    if (isTrial && isTrialActive()) {
      return entitlements.usage.sessionsCompleted < limits.trial.maxSessions;
    }

    // Free tiene sesiones limitadas
    if (isFree) {
      return entitlements.usage.sessionsCompleted < limits.free.maxSessions;
    }

    return false;
  }, [isPro, isTrial, isFree, isTrialActive, entitlements.usage.sessionsCompleted, limits]);

  // Registrar uso
  const recordUse = useCallback(async (type: 'ai' | 'session') => {
    await entitlementsService.recordUsage(type);
  }, []);

  // Iniciar trial
  const startTrial = useCallback(async () => {
    await entitlementsService.startTrial();
    return true;
  }, []);

  // Activar Pro (después de compra exitosa)
  const activatePro = useCallback(async () => {
    await entitlementsService.activatePro();
    return true;
  }, []);

  // Estadísticas de uso
  const getUsageStats = useCallback(() => {
    if (isPro) {
      return {
        sessionsUsed: 'Ilimitadas',
        sessionsLimit: '∞',
        aiCallsUsed: 'Ilimitadas',
        aiCallsLimit: '∞',
        percentUsed: 0,
      };
    }

    if (isTrial && isTrialActive()) {
      return {
        sessionsUsed: entitlements.usage.sessionsCompleted,
        sessionsLimit: limits.trial.maxSessions,
        aiCallsUsed: entitlements.usage.aiCalls,
        aiCallsLimit: limits.trial.maxAICalls,
        percentUsed: Math.round((entitlements.usage.sessionsCompleted / limits.trial.maxSessions) * 100),
        daysRemaining: getTrialDaysRemaining(),
      };
    }

    // Free
    return {
      sessionsUsed: entitlements.usage.sessionsCompleted,
      sessionsLimit: limits.free.maxSessions,
      aiCallsUsed: 0,
      aiCallsLimit: 0,
      percentUsed: Math.round((entitlements.usage.sessionsCompleted / limits.free.maxSessions) * 100),
    };
  }, [isPro, isTrial, isFree, isTrialActive, entitlements, limits, getTrialDaysRemaining]);

  // Iniciar checkout (en móvil esto conectaría a IAP o abre web)
  const initiateCheckout = useCallback(async (priceId: string) => {
    // TODO: Integrar con react-native-iap o expo-in-app-purchases
    Alert.alert(
      'Suscripción Pro',
      '¿Deseas continuar con la suscripción Pro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async () => {
            // En producción, esto abriría el flujo de IAP
            const success = await activatePro();
            if (success) {
              Alert.alert('¡Éxito!', 'Tu suscripción Pro ha sido activada.');
            }
          },
        },
      ]
    );
  }, [activatePro]);

  // Abrir portal de cliente
  const openCustomerPortal = useCallback(async () => {
    Alert.alert(
      'Gestionar Suscripción',
      'Para gestionar tu suscripción, ve a la configuración de tu tienda de aplicaciones.',
      [
        { text: 'OK' },
        {
          text: 'Abrir Configuración',
          onPress: () => {
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          },
        },
      ]
    );
  }, []);

  // Evento para abrir paywall
  const openPaywall = useCallback(() => {
    return true;
  }, []);

  // Refresh state
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await entitlementsService.init();
      setEntitlements(entitlementsService.getState());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Estado
    entitlements,
    isLoading,

    // Estados derivados
    isPro,
    isTrial,
    isFree,
    isTrialActive: isTrialActive(),
    trialDaysRemaining: getTrialDaysRemaining(),

    // Verificaciones
    checkAI,
    checkSession,

    // Acciones
    recordUse,
    startTrial,
    activatePro,
    getUsageStats,

    // Checkout
    stripePrices,
    initiateCheckout,
    openCustomerPortal,
    openPaywall,

    // Refresh
    refresh,
  };
}
