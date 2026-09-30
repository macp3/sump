import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { TripsPage } from './pages/TripsPage';
import { CookingPage } from './pages/CookingPage';
import { PhotosPage } from './pages/PhotosPage';
import { CreateCalendarEventModal } from './components/CreateCalendarEventModal';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { DuckGuide } from './components/DuckGuide';
import { CollageBackground } from './components/CollageBackground';
import { api } from './api/client';
import { CalendarEvent, PhotoItem } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'trips' | 'cooking' | 'photos'>('dashboard');

  // Photo memories state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const loadPhotos = async () => {
    try {
      const list = await api.getPhotos();
      setPhotos(list);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPhotos();
    }
  }, [isAuthenticated]);

  const handleTogglePhotoBackground = async (photo: PhotoItem) => {
    try {
      const updated = await api.updatePhoto(photo.id, { in_background: !photo.in_background });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
    } catch (err) {
      console.error('Failed to toggle photo background:', err);
    }
  };

  // Modals state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  // Target event navigation from Dashboard to Calendar
  const [targetCalendarEventId, setTargetCalendarEventId] = useState<number | null>(null);
  const [targetCalendarDate, setTargetCalendarDate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4ee] text-[#181c24]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-[#9c7526] rounded-none animate-spin" />
          <p className="text-[10px] font-mono-tech text-stone-500 uppercase tracking-[0.25em]">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CollageBackground photos={photos} />
        <LoginPage />
      </div>
    );
  }

  const handleCreateCalendarEventSubmit = async (data: any) => {
    await api.createCalendarEvent(data);
    setSelectedCalendarDate(null);
    setCalendarRefreshKey((k) => k + 1);
  };

  const handleOpenEventForDay = (dateStr?: string) => {
    setSelectedCalendarDate(dateStr || null);
    setIsCreateEventOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#181c24] flex flex-col selection:bg-[#b58c38]/20 selection:text-[#735213] relative">
      <CollageBackground
        photos={photos}
        onMoveToTab={handleTogglePhotoBackground}
      />
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPasswordChange={() => setIsPasswordChangeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateToCalendar={(evt) => {
                if (evt) {
                  setTargetCalendarEventId(evt.id);
                  setTargetCalendarDate(evt.event_date);
                } else {
                  setTargetCalendarEventId(null);
                  setTargetCalendarDate(null);
                }
                setActiveTab('calendar');
              }}
              onOpenCreateEvent={() => {
                setSelectedCalendarDate(null);
                setIsCreateEventOpen(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarPage
              onOpenCreateEventForDay={handleOpenEventForDay}
              onNavigateToTrips={() => setActiveTab('trips')}
              targetEventId={targetCalendarEventId}
              initialDate={targetCalendarDate}
              onClearTargetEvent={() => {
                setTargetCalendarEventId(null);
                setTargetCalendarDate(null);
              }}
              refreshKey={calendarRefreshKey}
            />
          )}

          {activeTab === 'trips' && (
            <TripsPage />
          )}

          {activeTab === 'cooking' && (
            <CookingPage />
          )}

          {activeTab === 'photos' && (
            <PhotosPage
              photos={photos}
              onPhotosChange={loadPhotos}
              onToggleBackground={handleTogglePhotoBackground}
            />
          )}
        </div>
      </main>

      {/* Persistent Atelier Companion Duck Guide */}
      <DuckGuide activeTab={activeTab} />

      {/* Modals */}
      <CreateCalendarEventModal
        isOpen={isCreateEventOpen}
        onClose={() => {
          setIsCreateEventOpen(false);
          setSelectedCalendarDate(null);
        }}
        onSubmit={handleCreateCalendarEventSubmit}
        defaultDate={selectedCalendarDate || undefined}
      />

      <PasswordChangeModal
        isOpen={isPasswordChangeOpen}
        onClose={() => setIsPasswordChangeOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
