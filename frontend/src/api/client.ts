import { 
  User, 
  DateProposal, 
  DateIdea, 
  CalendarEvent, 
  AppConfig,
  ClockState
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
      'Content-Type': 'application/json',
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
}

export const api = new ApiClient();
