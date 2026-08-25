import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { api } from '../api/client';
import { LoveCounter } from '../components/LoveCounter';
import { MissYouCard } from '../components/MissYouCard';
import { 
  Clock, 
  ArrowRight, 
  Plus, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import maciejAvatar from '../assets/Maciej.jpg';
import selinaAvatar from '../assets/Selina.jpg';

interface DashboardPageProps {
  onNavigateToCalendar: () => void;
  onOpenCreateEvent: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  date: { bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500' },
  trip: { bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  plan: { bg: 'bg-sky-50', border: 'border-sky-300', dot: 'bg-sky-500' },
  general: { bg: 'bg-stone-100', border: 'border-stone-300', dot: 'bg-stone-500' },
  selina: { bg: 'bg-rose-50', border: 'border-rose-300', dot: 'bg-rose-500' },
  maciej: { bg: 'bg-indigo-50', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  // Backward compatibility fallbacks
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', dot: 'bg-rose-500' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-300', dot: 'bg-sky-500' },
  stone: { bg: 'bg-stone-100', border: 'border-stone-300', dot: 'bg-stone-500' },
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToCalendar,
  onOpenCreateEvent,
}) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const events = await api.getCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter only upcoming (future/today) events and take the next 6
  const now = new Date();
  const upcomingEvents = calendarEvents
    .filter((evt) => {
      try {
        return new Date(evt.event_date) >= now;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Love Counter Banner */}
      <LoveCounter />

      {/* 2. Miss You Interaction Card */}
      <MissYouCard />

      {/* 3. Editorial Letter / Missive Card */}
      <section className="relative arch-surface p-8 sm:p-12 border border-[#e5e0d4] shadow-xs">
        {/* Corner drafting crosshairs */}
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0d4]/80">
            <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#9c7526] font-semibold">
              [ 03 // A LETTER ]
            </span>
            <span className="text-xs font-mono-tech text-stone-400">
              Private Atelier
            </span>
          </div>

          {/* Salutation */}
          <div className="pt-2">
            <p className="font-serif-editorial text-2xl sm:text-3xl text-[#181c24] font-medium tracking-wide">
              Dearest Selina,
            </p>
          </div>

          {/* Letter Body - Lorem Ipsum Placeholder */}
          <div className="space-y-4 font-serif-editorial text-lg sm:text-xl text-stone-700 leading-relaxed font-light">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.
            </p>
          </div>

          {/* Sign-off */}
          <div className="pt-6 text-right border-t border-[#e5e0d4]/60">
            <p className="font-serif-editorial text-xl sm:text-2xl text-[#181c24] italic">
              Always yours,
            </p>
            <p className="font-serif-editorial text-lg text-stone-800 font-medium mt-1">
              Maciej
            </p>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Events (Next 6 Future Events) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e5e0d4]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#9c7526] font-semibold">
              [ 04 // UPCOMING EVENTS ]
            </span>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="text-xs font-mono-tech uppercase tracking-wider text-stone-500 hover:text-[#9c7526] flex items-center gap-1.5 transition-colors font-medium"
          >
            Open Calendar <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-stone-500 font-mono-tech text-xs uppercase tracking-widest">
            Loading events...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="p-8 arch-card border border-dashed border-[#e5e0d4] text-center flex flex-col items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-stone-400 mb-2.5" />
            <p className="text-base font-serif-editorial text-stone-800">No upcoming events scheduled</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm font-light">
              Add a future date, trip, or plan to your calendar.
            </p>
            <button
              onClick={onOpenCreateEvent}
              className="mt-4 px-4 py-2 text-xs font-mono-tech uppercase tracking-wider font-semibold text-white bg-[#181c24] hover:bg-[#2c323f] flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-[#d8b46e]" />
              Add Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((evt) => {
              const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.date;
              const authorName = evt.creator?.display_name || 'Maciej';
              const isAuthorSelina = authorName.toLowerCase().includes('selina');
              const authorPhoto = isAuthorSelina ? selinaAvatar : maciejAvatar;

              return (
                <div
                  key={evt.id}
                  onClick={onNavigateToCalendar}
                  className={`cursor-pointer arch-card p-5 hover:border-[#b58c38] transition-all flex flex-col justify-between border ${color.border} ${color.bg}`}
                >
                  <div>
                    {/* Top Row: Author with Larger Photo & Color Dot */}
                    <div className="flex items-center justify-between gap-2 mb-2.5 font-mono-tech text-[11px]">
                      <div className="flex items-center gap-2">
                        <img
                          src={authorPhoto}
                          alt={authorName}
                          className="w-7 h-7 object-cover border border-[#e5e0d4] shadow-2xs"
                        />
                        <span className="text-stone-600 font-medium">
                          Added by: <strong className="text-stone-900 font-semibold">{authorName}</strong>
                        </span>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${color.dot} shadow-xs`} />
                    </div>

                    <h4 className="font-serif-editorial text-xl text-[#181c24] font-medium mb-1.5">
                      {evt.title}
                    </h4>

                    {evt.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 font-light mb-3">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-mono-tech text-stone-500">
                    <span className="font-medium text-stone-700">
                      {format(parseISO(evt.event_date), 'MMM d, yyyy', { locale: enUS })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9c7526]" />
                      {evt.is_all_day ? 'All-Day' : format(parseISO(evt.event_date), 'h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
