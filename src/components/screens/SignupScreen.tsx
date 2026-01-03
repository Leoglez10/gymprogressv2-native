import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, PasswordInput } from '../ui';
import { authService } from '../../services/auth';
import { AuthStackParamList } from '../../types';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!name || !email || !password) {
        throw new Error('Por favor completa todos los campos.');
      }
      await authService.signUp(email, password, name);
      // Después de signup exitoso, navegar a completar perfil
      navigation.navigate('GoalSelection');
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      await authService.signInWithOAuth(provider);
    } catch (err: any) {
      Alert.alert('OAuth', err?.message || 'Próximamente disponible');
    }
  };

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
          <Text style={styles.headerTitle}>REGISTRARSE</Text>
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
            <Text style={styles.title}>Hecho para la constancia.</Text>
            <Text style={styles.subtitle}>
              Entrena, analiza tu forma y mantente libre de lesiones. Únete a la comunidad hoy.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* OAuth Buttons */}
          <View style={styles.oauthSection}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => handleOAuth('apple')}
              activeOpacity={0.8}
            >
              <Text style={styles.appleButtonText}> Continuar con Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => handleOAuth('google')}
              activeOpacity={0.8}
            >
              <Text style={styles.googleButtonText}>G  Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CON EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre Completo"
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Crea una contraseña"
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.submitSection}>
              <Button
                title={isLoading ? 'Creando cuenta...' : 'CREAR CUENTA'}
                onPress={handleSignup}
                loading={isLoading}
                size="lg"
                style={{ width: '100%' }}
              />
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>¿Ya eres miembro? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
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
    paddingBottom: 24,
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
  oauthSection: {
    marginBottom: 24,
  },
  appleButton: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    letterSpacing: 2,
  },
  form: {
  },
  submitSection: {
    marginTop: 24,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#888',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
});
