import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../ui';
import { authService } from '../../services/auth';
import { AuthStackParamList } from '../../types';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPasswordForEmail(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Vista de éxito
  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RECUPERAR ACCESO</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✉️</Text>
          </View>
          <Text style={styles.successTitle}>Email Enviado</Text>
          <Text style={styles.successSubtitle}>
            Revisa tu bandeja de entrada. Te hemos enviado un enlace para crear una nueva contraseña.
          </Text>
          <View style={styles.successButton}>
            <Button
              title="VOLVER AL INICIO"
              onPress={() => navigation.navigate('Onboarding')}
              size="lg"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RECUPERAR ACCESO</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>¿Problemas para entrar?</Text>
            <Text style={styles.subtitle}>
              No te preocupes. Introduce tu email y te enviaremos instrucciones para resetear tu contraseña.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.submitSection}>
              <Button
                title={isLoading ? 'Enviando...' : 'ENVIAR INSTRUCCIONES'}
                onPress={handleSubmit}
                loading={isLoading}
                size="lg"
                variant="secondary"
                style={{ width: '100%' }}
              />
            </View>
          </View>

          {/* Cancel Link */}
          <View style={styles.cancelSection}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>CANCELAR Y VOLVER</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  flex: {
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
    fontWeight: '900',
    color: '#666',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
  },
  submitSection: {
    marginTop: 24,
  },
  cancelSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#666',
    letterSpacing: 1,
  },
  // Success state styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successIconText: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: 40,
  },
  successButton: {
    width: '100%',
  },
});
