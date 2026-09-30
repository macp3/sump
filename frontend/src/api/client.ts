import { 
  User, 
  DateProposal, 
  DateIdea, 
  CalendarEvent, 
  AppConfig,
  ClockState,
  MissYouStats,
  Trip,
  TripTransport,
  TripLodging,
  TripItineraryItem,
  FridgeItem,
  ShoppingItem,
  MealPlan,
  PhotoItem
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sump_token') || localStorage.getItem('sump_access_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('sump_token');
      localStorage.removeItem('sump_access_token');
      localStorage.removeItem('sump_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {
        errorMsg = `Server error: ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // --- Auth & Config ---
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  async getAppConfig(): Promise<AppConfig> {
    return this.request('/auth/config');
  }

  async getConfig(): Promise<AppConfig> {
    return this.getAppConfig();
  }

  // --- Users ---
  async getPairUsers(): Promise<User[]> {
    return this.request('/users/pair');
  }

  async getPair(): Promise<User[]> {
    return this.getPairUsers();
  }

  async updateMood(mood: string, avatar_color?: string): Promise<User> {
    return this.request('/users/mood', {
      method: 'PUT',
      body: JSON.stringify({ mood, avatar_color }),
    });
  }

  async changePassword(old_password: string, new_password: string): Promise<{ message: string }> {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ old_password, new_password }),
    });
  }

  // --- Dates / Itinerary ---
  async getDates(status?: string, category?: string): Promise<DateProposal[]> {
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    if (category) params.append('category_filter', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dates${query}`);
  }

  async createDate(data: Partial<DateProposal>): Promise<DateProposal> {
    return this.request('/dates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondToDate(id: number, status: 'accepted' | 'declined', response_note?: string): Promise<DateProposal> {
    return this.request(`/dates/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status, response_note }),
    });
  }

  async completeDate(id: number, rating?: number, memory_notes?: string): Promise<DateProposal> {
    return this.request(`/dates/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ rating, memory_notes }),
    });
  }

  async revealSurprise(id: number): Promise<DateProposal> {
    return this.request(`/dates/${id}/reveal`, {
      method: 'PUT',
    });
  }

  async deleteDate(id: number): Promise<{ message: string }> {
    return this.request(`/dates/${id}`, {
      method: 'DELETE',
    });
  }

  async getRandomIdea(): Promise<DateIdea> {
    return this.request('/dates/random-idea');
  }

  // --- Calendar Events ---
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.request('/calendar/events');
  }

  async createCalendarEvent(data: {
    title: string;
    description?: string;
    category?: string;
    event_date: string;
    is_all_day?: boolean;
  }): Promise<CalendarEvent> {
    return this.request('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCalendarEvent(id: number): Promise<{ message: string }> {
    return this.request(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Persistent Relationship Clock ---
  async getClockState(): Promise<ClockState> {
    return this.request('/clock');
  }

  async startClock(): Promise<ClockState> {
    return this.request('/clock/start', {
      method: 'POST',
    });
  }

  // --- Miss You Pings ---
  async getMissYouStats(): Promise<MissYouStats> {
    return this.request('/miss-you');
  }

  async sendMissYou(): Promise<MissYouStats> {
    return this.request('/miss-you', {
      method: 'POST',
    });
  }

  // --- Shared Travel Planner (Trips) ---
  async getTrips(status?: string): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/trips${query}`);
  }

  async getTrip(id: number): Promise<Trip> {
    return this.request(`/trips/${id}`);
  }

  async createTrip(data: {
    destination: string;
    title?: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: string;
    estimated_budget?: number;
    currency?: string;
    notes?: string | null;
  }): Promise<Trip> {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id: number, data: Partial<Trip>): Promise<Trip> {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrip(id: number): Promise<{ message: string }> {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Transport Options
  async addTransport(tripId: number, data: Partial<TripTransport>): Promise<TripTransport> {
    return this.request(`/trips/${tripId}/transports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransport(tripId: number, transportId: number, data: Partial<TripTransport>): Promise<TripTransport> {
    return this.request(`/trips/${tripId}/transports/${transportId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransport(tripId: number, transportId: number): Promise<{ message: string }> {
    return this.request(`/trips/${tripId}/transports/${transportId}`, {
      method: 'DELETE',
    });
  }

  // Lodging Options
  async addLodging(tripId: number, data: Partial<TripLodging>): Promise<TripLodging> {
    return this.request(`/trips/${tripId}/lodgings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLodging(tripId: number, lodgingId: number, data: Partial<TripLodging>): Promise<TripLodging> {
    return this.request(`/trips/${tripId}/lodgings/${lodgingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLodging(tripId: number, lodgingId: number): Promise<{ message: string }> {
    return this.request(`/trips/${tripId}/lodgings/${lodgingId}`, {
      method: 'DELETE',
    });
  }

  // Itinerary Items
  async addItineraryItem(tripId: number, data: Partial<TripItineraryItem>): Promise<TripItineraryItem> {
    return this.request(`/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItineraryItem(tripId: number, itemId: number, data: Partial<TripItineraryItem>): Promise<TripItineraryItem> {
    return this.request(`/trips/${tripId}/itinerary/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItineraryItem(tripId: number, itemId: number): Promise<{ message: string }> {
    return this.request(`/trips/${tripId}/itinerary/${itemId}`, {
      method: 'DELETE',
    });
  }

  // --- Cooking & Kitchen Inventory ---
  // Fridge & Pantry
  async getFridgeItems(params?: { location?: string; category?: string; status?: string }): Promise<FridgeItem[]> {
    const query = new URLSearchParams();
    if (params?.location && params.location !== 'all') query.append('location', params.location);
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/cooking/fridge${qs}`);
  }

  async createFridgeItem(data: Partial<FridgeItem>): Promise<FridgeItem> {
    return this.request('/cooking/fridge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFridgeItem(id: number, data: Partial<FridgeItem>): Promise<FridgeItem> {
    return this.request(`/cooking/fridge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFridgeItem(id: number): Promise<{ message: string }> {
    return this.request(`/cooking/fridge/${id}`, {
      method: 'DELETE',
    });
  }

  // Shopping List
  async getShoppingItems(): Promise<ShoppingItem[]> {
    return this.request('/cooking/shopping');
  }

  async createShoppingItem(data: Partial<ShoppingItem>): Promise<ShoppingItem> {
    return this.request('/cooking/shopping', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShoppingItem(id: number, data: Partial<ShoppingItem>): Promise<ShoppingItem> {
    return this.request(`/cooking/shopping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShoppingItem(id: number): Promise<{ message: string }> {
    return this.request(`/cooking/shopping/${id}`, {
      method: 'DELETE',
    });
  }

  async clearPurchasedShoppingItems(): Promise<{ message: string }> {
    return this.request('/cooking/shopping/purchased/clear', {
      method: 'DELETE',
    });
  }

  async moveShoppingItemToFridge(id: number): Promise<FridgeItem> {
    return this.request(`/cooking/shopping/${id}/move-to-fridge`, {
      method: 'POST',
    });
  }

  // Weekly Meal Planner
  async getMealPlans(): Promise<MealPlan[]> {
    return this.request('/cooking/meals');
  }

  async createMealPlan(data: Partial<MealPlan>): Promise<MealPlan> {
    return this.request('/cooking/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMealPlan(id: number, data: Partial<MealPlan>): Promise<MealPlan> {
    return this.request(`/cooking/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMealPlan(id: number): Promise<{ message: string }> {
    return this.request(`/cooking/meals/${id}`, {
      method: 'DELETE',
    });
  }

  async addMealIngredientsToShoppingList(mealId: number): Promise<ShoppingItem[]> {
    return this.request(`/cooking/meals/${mealId}/add-to-shopping-list`, {
      method: 'POST',
    });
  }

  // --- Photo Memories & Atelier Gallery ---
  async getPhotos(inBackground?: boolean): Promise<PhotoItem[]> {
    const query = inBackground !== undefined ? `?in_background=${inBackground}` : '';
    return this.request(`/photos${query}`);
  }

  async uploadPhoto(file: File, inBackground: boolean = true, caption?: string): Promise<PhotoItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('in_background', String(inBackground));
    if (caption) formData.append('caption', caption);

    return this.request('/photos/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async updatePhoto(id: number, data: { in_background?: boolean; caption?: string; rotation?: number; order_index?: number }): Promise<PhotoItem> {
    return this.request(`/photos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePhoto(id: number): Promise<{ message: string; id: number }> {
    return this.request(`/photos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
