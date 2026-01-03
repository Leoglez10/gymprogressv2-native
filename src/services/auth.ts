import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

export const authService = {
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw mapAuthError(error);
    return data;
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw mapAuthError(error);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error);
  },

  async resetPasswordForEmail(email: string) {
    // En RN usamos deep linking para el redirect
    const redirectUrl = Linking.createURL('reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw mapAuthError(error);
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw mapAuthError(error);
  },

  // OAuth nativo se implementará después con librerías específicas
  // Por ahora dejamos un placeholder
  async signInWithOAuth(provider: 'google' | 'apple') {
    // TODO: Implementar con @react-native-google-signin y apple-auth
    throw new Error(`OAuth con ${provider} será implementado próximamente`);
  },

  // Helper para escuchar cambios de sesión
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Obtener sesión actual
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw mapAuthError(error);
    return data.session;
  },

  // Obtener usuario actual
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },
};

const mapAuthError = (error: any) => {
  const msg = error.message || '';
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Por favor confirma tu correo electrónico.';
  if (msg.includes('User already registered')) return 'Este correo ya está registrado.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  return 'Ocurrió un error. Intenta de nuevo.';
};
