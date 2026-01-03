import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quvcoalbfdlxluxwgbjb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmNvYWxiZmRseGx1eHdnYmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTU3MTAsImV4cCI6MjA4MjA5MTcxMH0.I6jL2JZ_pSfI9-5WUawRUozCaJG5pWvYOypl1gx5b4E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
