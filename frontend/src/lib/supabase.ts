import { createClient } from '@supabase/supabase-js';

// Usa las variables de entorno de Vite o coloca tus valores de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);