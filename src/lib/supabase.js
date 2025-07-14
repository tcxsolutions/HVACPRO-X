import { createClient } from '@supabase/supabase-js'

// Project credentials
const SUPABASE_URL = 'https://wxjtuvpsffesbudeffxa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4anR1dnBzZmZlc2J1ZGVmZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjI1MTcsImV4cCI6MjA2NzkzODUxN30.y6-VjQzUPyrA_WROj7IQswZm9c0S9skw1W8Xr6EqVdQ'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase