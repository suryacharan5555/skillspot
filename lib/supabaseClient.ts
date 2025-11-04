import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://keugczzhzfuomikwrldi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldWdjenpoemZ1b21pa3dybGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTk3NDMsImV4cCI6MjA3MzIzNTc0M30.4uNse_HQPzdfnmLLWi9ZIICB8I1h0sCnuYnOFdepFaI';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
