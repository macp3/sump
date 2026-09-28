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

export type TripStatus = 'idea' | 'planning' | 'booked' | 'completed';
export type TransportType = 'flight' | 'train' | 'car' | 'bus' | 'ferry' | 'other';
export type LodgingType = 'hotel' | 'airbnb' | 'apartment' | 'resort' | 'hostel' | 'other';

export interface TripTransport {
  id: number;
  trip_id: number;
  type: TransportType;
  title: string;
  departure_location?: string;
  arrival_location?: string;
  departure_time?: string;
  arrival_time?: string;
  cost: number;
  booking_reference?: string;
  booking_url?: string;
  is_selected: boolean;
  notes?: string;
  creator_id: number;
  created_at: string;
  creator?: User;
}

export interface TripLodging {
  id: number;
  trip_id: number;
  type: LodgingType;
  name: string;
  location?: string;
  check_in?: string;
  check_out?: string;
  cost: number;
  booking_url?: string;
  is_selected: boolean;
  notes?: string;
  creator_id: number;
  created_at: string;
  creator?: User;
}

export interface TripItineraryItem {
  id: number;
  trip_id: number;
  day_number: number;
  item_date?: string;
  time_of_day?: string;
  title: string;
  description?: string;
  location?: string;
  location_url?: string;
  cost: number;
  category: string;
  is_completed: boolean;
  creator_id: number;
  created_at: string;
  creator?: User;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: TripStatus;
  estimated_budget: number;
  currency: string;
  notes?: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  transports: TripTransport[];
  lodgings: TripLodging[];
  itinerary_items: TripItineraryItem[];
}
