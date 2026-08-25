import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { CreateCalendarEventModal } from './components/CreateCalendarEventModal';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { api } from './api/client';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar'>('dashboard');

  // Modals state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

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
    return <LoginPage />;
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
    <div className="min-h-screen bg-[#f6f4ee] text-[#181c24] flex flex-col selection:bg-[#b58c38]/20 selection:text-[#735213]">
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPasswordChange={() => setIsPasswordChangeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigateToCalendar={() => setActiveTab('calendar')}
            onOpenCreateEvent={() => {
              setSelectedCalendarDate(null);
              setIsCreateEventOpen(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarPage
            onOpenCreateEventForDay={handleOpenEventForDay}
            refreshKey={calendarRefreshKey}
          />
        )}
      </main>

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
