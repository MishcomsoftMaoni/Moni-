import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evnwpfgcsrroiewyzmnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bndwZmdjc3Jyb2lld3l6bW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjM3OTAsImV4cCI6MjA5MzE5OTc5MH0.HtQXMh5sJPP4RaGghJWHH3XS1Z-mrk-JlNv8YeSMjQ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage
  }
});
