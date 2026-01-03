import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { storageService, STORAGE_KEYS } from '../../services/storage';

type AliasSettingScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AliasSetting'>;
  route: RouteProp<OnboardingStackParamList, 'AliasSetting'>;
  setOnboardingComplete?: (value: boolean) => void;
};

export const AliasSettingScreen: React.FC<AliasSettingScreenProps> = ({
  navigation,
  route,
  setOnboardingComplete
}) => {
  const params = (route.params as any) || {};

  const [alias, setAlias] = useState('');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_LENGTH = 15;

  const handleInputChange = (val: string) => {
    const regex = /^[a-zA-Z0-9\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1 ]*$/;

    if (regex.test(val)) {
      if (val.length <= MAX_LENGTH) {
        setAlias(val);
        setShowError(false);
      }
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const isInvalid = useMemo(() => alias.trim().length < 2, [alias]);

  const handleFinish = async () => {
    if (isInvalid || isLoading) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Preparar datos del perfil completo para storage local
      const profileData = {
        goal: params.goal || 'Hypertrophy',
        gender: params.gender || 'Male',
        age: params.age || 25,
        weight: params.weight || 75,
        height: params.height || 175,
        alias: alias.trim(),
        weightUnit: 'kg',
        id: user.id,
        email: user.email,
      };

      // Guardar localmente (siempre funciona)
      await storageService.setJSON(STORAGE_KEYS.USER_PROFILE, profileData);

      // Marcar onboarding como completado
      await storageService.set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');

      Alert.alert(
        'Bienvenido!',
        'Todo listo, ' + alias.trim() + '. Es hora de entrenar!',
        [
          {
            text: 'Vamos!',
            onPress: () => {
              if (setOnboardingComplete) {
                setOnboardingComplete(true);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error en onboarding:', error);
      Alert.alert('Error', error.message || 'Hubo un problema al guardar tu perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>{'<-'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ULTIMO PASO</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{'B-)'}</Text>
            </View>
            <Text style={styles.title}>Como te llamas?</Text>
            <Text style={styles.subtitle}>Tu entrenador IA te saludara asi.</Text>
          </View>

          <View style={styles.inputSection}>
            <View>
              <TextInput
                style={[
                  styles.input,
                  showError && styles.inputError,
                ]}
                value={alias}
                onChangeText={handleInputChange}
                placeholder="Tu apodo o nombre"
                placeholderTextColor="#444"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <View style={styles.inputFooter}>
                <Text style={[styles.helperText, showError && styles.helperTextError]}>
                  {showError ? 'SOLO LETRAS Y NUMEROS' : 'SIN CARACTERES ESPECIALES'}
                </Text>
                <Text style={[styles.counterText, alias.length >= MAX_LENGTH && styles.counterTextMax]}>
                  {alias.length}/{MAX_LENGTH}
                </Text>
              </View>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleFinish}
                disabled={isInvalid || isLoading}
                style={[styles.button, (isInvalid || isLoading) && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'GUARDANDO...' : isInvalid ? 'ESCRIBE TU NOMBRE' : 'TODO LISTO!'}
                </Text>
              </TouchableOpacity>

              {isInvalid && alias.length > 0 && (
                <Text style={styles.validationText}>MINIMO 2 CARACTERES</Text>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 48,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: '#FFEF0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  helperText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },
  helperTextError: {
    color: '#ef4444',
  },
  counterText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#444',
  },
  counterTextMax: {
    color: '#ef4444',
  },
  actionContainer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: '#FFEF0A',
    paddingVertical: 22,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
  validationText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 16,
  },
});
