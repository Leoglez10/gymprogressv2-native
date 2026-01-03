import "./global.css";
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider, PaywallProvider, useAuth, usePaywall } from './src/context';
import { entitlementsService } from './src/services/entitlements';
import { exerciseService } from './src/services/exercises';
import PaywallModal from './src/components/PaywallModal';
import { storage, STORAGE_KEYS } from './src/services/storage';

function AppContent() {
  const { isLoading, isAuthenticated, onboardingComplete, setOnboardingComplete, user } = useAuth();
  const { isVisible, trigger, closePaywall } = usePaywall();
  const [servicesReady, setServicesReady] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => {
    // Inicializar servicios
    const init = async () => {
      try {
        await entitlementsService.init();
        await exerciseService.syncFromCloud();
        // Cargar nombre del usuario
        const profile = await storage.get<{ alias?: string }>(STORAGE_KEYS.USER_PROFILE);
        if (profile?.alias) {
          setUserName(profile.alias);
        }
        setServicesReady(true);
      } catch (error) {
        console.error('Init error:', error);
        setServicesReady(true); // Continuar aunque falle
      }
    };
    init();
  }, []);

  // Loading screen
  if (isLoading || !servicesReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFEF0A" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator
        isAuthenticated={isAuthenticated}
        onboardingComplete={onboardingComplete}
        setOnboardingComplete={setOnboardingComplete}
        userName={userName}
      />
      <PaywallModal
        visible={isVisible}
        onClose={closePaywall}
        trigger={trigger}
      />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <PaywallProvider>
            <AppContent />
          </PaywallProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
