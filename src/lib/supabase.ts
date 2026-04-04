import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vutrvjdynhfcpicfzmlg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dHJ2amR5bmhmY3BpY2Z6bWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODEyMjUsImV4cCI6MjA5MDg1NzIyNX0.GlzxBk3j26WV8cIeHHLGyNPMNLS06Pe-IQsLZofLQOk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
