/**
 * Supabase Client for Dashboard
 * Initializes Supabase connection for frontend
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Doctor {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  specialization: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  phone_number: string;
  name: string | null;
  doctor_id: string | null;
  created_at: string;
  last_seen_at: string;
  email: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: Patient;
  doctors?: Doctor;
}

export interface ExternalDoctor {
  id: string;
  name: string;
  phone_number: string;
  commission_percentage: number;
  total_commission_due: number;
  created_at: string;
}

export interface ClinicConfig {
  id: string;
  doctor_id: string;
  opening_time: string;
  closing_time: string;
  welcome_message: string;
  holidays: string[];
  created_at: string;
  updated_at: string;
}
