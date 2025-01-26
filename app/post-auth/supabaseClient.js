import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjdsrtgezbdaoltvleor.supabase.co';
const supabaseAnonKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZHNydGdlemJkYW9sdHZsZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NTU5NTQsImV4cCI6MjA1MzMzMTk1NH0.nDod1j69Emsn1fytyuERIP_qimAiRIMhAoZ_iiqMN_o'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: AsyncStorage,
  },
});

export default supabase;