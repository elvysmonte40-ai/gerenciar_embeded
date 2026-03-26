import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg0NDksImV4cCI6MjA4NTYxNDQ0OX0.FEKh7ZkqLFHw45jwEowiIfQrTdK7okmzTdf4Lzk8nfA";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
