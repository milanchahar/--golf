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
  notification_preferences: any | null; // store as json
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

export interface PrizePool {
  id: string;
  draw_id: string;
  draw_month: string;
  total_active_subscribers: number;
  subscription_revenue: number;
  prize_pool_total: number;
  five_match_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_carry_in: number;
  jackpot_carry_out: number;
  five_match_winners: number;
  four_match_winners: number;
  three_match_winners: number;
  five_match_payout: number;
  four_match_payout: number;
  three_match_payout: number;
  created_at: string;
  updated_at: string;
}

export interface BuildPrizePoolParams {
  draw_id: string;
  draw_month: string;
  monthly_subscribers: number;
  yearly_subscribers: number;
  jackpot_carry_in: number;
  five_match_winners: number;
  four_match_winners: number;
  three_match_winners: number;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_image_url: string;
  website_url: string;
  is_featured: boolean;
  is_active: boolean;
  total_raised: number;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  contribution_month: string;
  contribution_type: 'subscription' | 'independent';
}

export interface WinnerVerification {
  id: string;
  draw_entry_id: string;
  user_id: string;
  draw_id: string;
  proof_image_url: string;
  proof_uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  payment_status: 'unpaid' | 'pending' | 'paid';
  payment_reference: string | null;
  payment_completed_at: string | null;
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
