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

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string; // ISO date string "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}

export interface ScoreFormData {
  score: number;
  score_date: string;
}

export interface Draw {
  id: string;
  draw_month: string; // "YYYY-MM"
  status: 'pending' | 'simulated' | 'published';
  draw_type: 'random' | 'algorithmic';
  drawn_numbers: number[];
  jackpot_carried_over: boolean;
  jackpot_carry_from_draw_id: string | null;
  created_at: string;
  published_at: string | null;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  user_scores: number[];
  match_count: number;
  is_winner: boolean;
  prize_tier: '5-match' | '4-match' | '3-match' | null;
  prize_amount: number | null;
  created_at: string;
}

export interface DrawResult {
  user_id: string;
  match_count: number;
  prize_tier: '5-match' | '4-match' | '3-match' | null;
  prize_amount: number | null;
}

export interface SimulationPreview {
  drawn_numbers: number[];
  five_match_winners: string[];
  four_match_winners: string[];
  three_match_winners: string[];
  prize_breakdown: { fiveMatch: number; fourMatch: number; threeMatch: number };
  total_eligible_users: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, 'id' | 'created_at'>> & { id: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      golf_scores: {
        Row: GolfScore;
        Insert: Omit<GolfScore, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<GolfScore, 'score' | 'updated_at'>>;
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
