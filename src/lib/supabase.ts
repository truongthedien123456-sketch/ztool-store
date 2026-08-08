import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quvqnmihlzelepgkrwco.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dnFubWlobHplbGVwZ2tyd2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNTE2ODUsImV4cCI6MjEwMTcyNzY4NX0.6-VIUelzqzGsQIft8mMY83FerJjW_ScB6erCbgitK70';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);