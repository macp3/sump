export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  current_mood?: string;
  last_active_at?: string;
  created_at: string;
}

export type DateCategory = 
  | 'romantic' 
  | 'food' 
  | 'movie' 
  | 'adventure' 
  | 'home' 
  | 'surprise' 
  | 'trip' 
  | 'outdoors';

export type DateStatus = 'proposed' | 'accepted' | 'declined' | 'completed';

export interface DateProposal {
  id: number;
  title: string;
  description?: string;
  category: DateCategory;
  location?: string;
  location_url?: string;
  proposed_date: string;
  dress_code?: string;
  estimated_cost?: string;
  is_surprise: boolean;
  surprise_revealed: boolean;
  status: DateStatus;
  creator_id: number;
  creator: User;
  response_note?: string;
  rating?: number;
  memory_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DateIdea {
  title: string;
  category: string;
  description: string;
  dress_code: string;
  estimated_cost: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  category: string; // date, trip, plan, general, selina, maciej
  event_date: string;
  is_all_day: boolean;
  creator_id: number;
  created_at: string;
  creator: User;
}

export interface AppConfig {
  app_name: string;
  relationship_start_date: string;
}

export interface ClockState {
  clock_started_at: string | null;
}

export interface MissYouStats {
  partner_count: number;
  my_count: number;
  partner_last_sent: string | null;
  my_last_sent: string | null;
  partner_name: string;
}
