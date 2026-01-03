import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntitlements } from '../hooks/useEntitlements';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  trigger?: 'ai' | 'session' | 'feature' | 'general';
}

const FEATURES_PRO = [
  { icon: '🔓', text: 'Entrenamientos ilimitados' },
  { icon: '🤖', text: 'Asistente IA sin límites' },
  { icon: '📊', text: 'Estadísticas avanzadas' },
  { icon: '🏆', text: 'Tracking de PRs detallado' },
  { icon: '📈', text: 'Gráficos de progresión' },
  { icon: '💪', text: 'Ratio de fatiga (ACWR)' },
  { icon: '🔔', text: 'Recordatorios inteligentes' },
  { icon: '☁️', text: 'Sincronización en la nube' },
];

const TRIGGERS_MESSAGES: Record<string, { title: string; subtitle: string }> = {
  ai: {
    title: 'Desbloquea el Asistente IA',
    subtitle: 'Obtén recomendaciones personalizadas basadas en tu progreso y bienestar.',
  },
  session: {
    title: 'Más Entrenamientos',
    subtitle: 'Has alcanzado el límite de sesiones gratuitas. ¡Continúa tu progreso!',
  },
  feature: {
    title: 'Función Premium',
    subtitle: 'Esta característica está disponible en el plan Pro.',
  },
  general: {
    title: 'Lleva tu entrenamiento al siguiente nivel',
    subtitle: 'Desbloquea todas las funciones y maximiza tus resultados.',
  },
};

export default function PaywallModal({ visible, onClose, trigger = 'general' }: PaywallModalProps) {
  const {
    stripePrices,
    initiateCheckout,
    startTrial,
    isTrialActive,
    trialDaysRemaining,
    isTrial,
    isFree,
    getUsageStats,
  } = useEntitlements();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const usageStats = getUsageStats();
  const triggerContent = TRIGGERS_MESSAGES[trigger] || TRIGGERS_MESSAGES.general;

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await startTrial();
      onClose();
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const priceId = selectedPlan === 'monthly'
        ? stripePrices.monthly.id
        : stripePrices.yearly.id;
      await initiateCheckout(priceId);
    } catch (error) {
      console.error('Error purchasing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-[#0f0f0f]">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-zinc-800">
          <View />
          <Text className="text-xl font-bold text-white">✨ GymProgress Pro</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-2xl text-zinc-400">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="items-center px-6 py-8">
            <View className="w-20 h-20 rounded-full bg-[#FFEF0A]/20 items-center justify-center mb-4">
              <Text className="text-4xl">🚀</Text>
            </View>
            <Text className="text-2xl font-bold text-white text-center mb-2">
              {triggerContent.title}
            </Text>
            <Text className="text-zinc-400 text-center text-base">
              {triggerContent.subtitle}
            </Text>
          </View>

          {/* Usage Stats (si aplica) */}
          {(isFree || isTrial) && (
            <View className="mx-5 mb-6 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <Text className="text-zinc-400 text-sm mb-2">Tu uso actual</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-medium">
                  Sesiones: {usageStats.sessionsUsed}/{usageStats.sessionsLimit}
                </Text>
                {isTrial && (
                  <Text className="text-[#FFEF0A] font-medium">
                    {trialDaysRemaining} días restantes
                  </Text>
                )}
              </View>
              {/* Progress bar */}
              <View className="h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-full bg-[#FFEF0A] rounded-full"
                  style={{ width: `${Math.min(usageStats.percentUsed ?? 0, 100)}%` }}
                />
              </View>
            </View>
          )}

          {/* Features List */}
          <View className="px-5 mb-6">
            <Text className="text-lg font-bold text-white mb-4">Todo lo que incluye Pro:</Text>
            <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              {FEATURES_PRO.map((feature, index) => (
                <View
                  key={index}
                  className={`flex-row items-center py-3 ${index < FEATURES_PRO.length - 1 ? 'border-b border-zinc-800' : ''}`}
                >
                  <Text className="text-2xl mr-4">{feature.icon}</Text>
                  <Text className="text-white flex-1">{feature.text}</Text>
                  <Text className="text-green-500 text-lg">✓</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Plan Selection */}
          <View className="px-5 mb-6">
            <Text className="text-lg font-bold text-white mb-4">Elige tu plan:</Text>

            {/* Monthly */}
            <TouchableOpacity
              className={`flex-row items-center p-4 rounded-2xl border mb-3 ${
                selectedPlan === 'monthly'
                  ? 'border-[#FFEF0A] bg-[#FFEF0A]/10'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                selectedPlan === 'monthly' ? 'border-[#FFEF0A]' : 'border-zinc-600'
              }`}>
                {selectedPlan === 'monthly' && (
                  <View className="w-3 h-3 rounded-full bg-[#FFEF0A]" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">Mensual</Text>
                <Text className="text-zinc-400 text-sm">Facturación mensual</Text>
              </View>
              <Text className="text-white font-bold text-lg">{stripePrices.monthly.price}/mes</Text>
            </TouchableOpacity>

            {/* Yearly */}
            <TouchableOpacity
              className={`flex-row items-center p-4 rounded-2xl border ${
                selectedPlan === 'yearly'
                  ? 'border-[#FFEF0A] bg-[#FFEF0A]/10'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                selectedPlan === 'yearly' ? 'border-[#FFEF0A]' : 'border-zinc-600'
              }`}>
                {selectedPlan === 'yearly' && (
                  <View className="w-3 h-3 rounded-full bg-[#FFEF0A]" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">Anual</Text>
                <Text className="text-zinc-400 text-sm">Facturación anual</Text>
              </View>
              <View className="items-end">
                <Text className="text-white font-bold text-lg">{stripePrices.yearly.price}/año</Text>
                <View className="bg-green-500/20 px-2 py-1 rounded-full mt-1">
                  <Text className="text-green-500 text-xs font-bold">{stripePrices.yearly.savings}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Trial CTA (si es Free y no ha probado) */}
          {isFree && !isTrialActive && (
            <View className="px-5 mb-4">
              <TouchableOpacity
                className="bg-zinc-800 py-4 rounded-2xl items-center border border-zinc-700"
                onPress={handleStartTrial}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFEF0A" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg">Probar 7 días gratis</Text>
                    <Text className="text-zinc-400 text-sm mt-1">Sin tarjeta requerida</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Purchase CTA */}
          <View className="px-5 mb-8">
            <TouchableOpacity
              className="bg-[#FFEF0A] py-4 rounded-2xl items-center"
              onPress={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-bold text-lg">
                  Suscribirse a Pro
                </Text>
              )}
            </TouchableOpacity>
            <Text className="text-zinc-500 text-xs text-center mt-3">
              Cancela cuando quieras • Garantía de 30 días
            </Text>
          </View>

          {/* Social Proof */}
          <View className="px-5 pb-8">
            <View className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <View className="flex-row items-center justify-center mb-2">
                <Text className="text-yellow-500 text-lg">⭐⭐⭐⭐⭐</Text>
              </View>
              <Text className="text-zinc-400 text-center text-sm italic">
                "La mejor app de tracking que he usado. El ratio ACWR me ha ayudado a evitar lesiones."
              </Text>
              <Text className="text-zinc-500 text-center text-xs mt-2">
                — Usuario Pro desde 2024
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
