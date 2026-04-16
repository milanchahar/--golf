export type UserRole = 'subscriber' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed';
export type SubscriptionPlan = 'monthly' | 'yearly';

export interface Profile {
  id: string; // references auth.users(id)
  full_name: string | null;
  email: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  subscription_renewal_date: string | null; // ISO 8601 string
  selected_charity_id: string | null; // uuid
  charity_contribution_percent: number;
  created_at: string; // ISO 8601 string
}

// Supabase generated types (simplified for this structure)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, 'id' | 'created_at'>> & { id: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
