import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iohlttqcruswkiocashi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaGx0dHFjcnVzd2tpb2Nhc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTQ1MTEsImV4cCI6MjA3Njc5MDUxMX0.i8xRoKEZSWWspb5LKMFtFdjLkk4MsVtnxlvmCtUPcpM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
