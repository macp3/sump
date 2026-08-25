import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { api } from '../api/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO,
  isToday
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import maciejAvatar from '../assets/Maciej.jpg';
import selinaAvatar from '../assets/Selina.jpg';

interface CalendarPageProps {
  onOpenCreateEventForDay: (dateStr?: string) => void;
  refreshKey?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  date: { bg: 'bg-amber-50', text: 'text-amber-950', border: 'border-amber-300', dot: 'bg-amber-500' },
  trip: { bg: 'bg-emerald-50', text: 'text-emerald-950', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  plan: { bg: 'bg-sky-50', text: 'text-sky-950', border: 'border-sky-300', dot: 'bg-sky-500' },
  general: { bg: 'bg-stone-100', text: 'text-stone-900', border: 'border-stone-300', dot: 'bg-stone-500' },
  selina: { bg: 'bg-rose-50', text: 'text-rose-950', border: 'border-rose-300', dot: 'bg-rose-500' },
  maciej: { bg: 'bg-indigo-50', text: 'text-indigo-950', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  // Backward compatibility fallbacks
  amber: { bg: 'bg-amber-50', text: 'text-amber-950', border: 'border-amber-300', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-950', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-950', border: 'border-rose-300', dot: 'bg-rose-500' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-950', border: 'border-sky-300', dot: 'bg-sky-500' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-900', border: 'border-stone-300', dot: 'bg-stone-500' },
};

export const CalendarPage: React.FC<CalendarPageProps> = ({
  onOpenCreateEventForDay,
  refreshKey,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const eventsData = await api.getCalendarEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCalendarEvent(eventToDelete.id);
      setEventToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calendar Grid generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      try {
        return isSameDay(parseISO(e.event_date), day);
      } catch {
        return false;
      }
    });
  };

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dayEvents = getEventsForDay(cloneDay);
      const isSelected = isSameDay(cloneDay, selectedDate);
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isCurrentDay = isToday(cloneDay);

      days.push(
        <div
          key={cloneDay.toISOString()}
          onClick={() => setSelectedDate(cloneDay)}
          className={`min-h-[90px] sm:min-h-[110px] p-2 border-b border-r border-[#e5e0d4] transition-all cursor-pointer flex flex-col justify-between ${
            !isCurrentMonth ? 'bg-[#faf8f4] text-stone-300' : 'bg-white text-stone-800'
          } ${isSelected ? 'ring-2 ring-inset ring-[#9c7526] bg-[#fcf9f2]' : 'hover:bg-[#fbf9f4]'}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-mono-tech ${
                isCurrentDay
                  ? 'w-6 h-6 bg-[#181c24] text-white flex items-center justify-center font-bold'
                  : isSelected
                  ? 'text-[#9c7526] font-bold'
                  : !isCurrentMonth
                  ? 'text-stone-300'
                  : 'text-stone-700'
              }`}
            >
              {format(cloneDay, 'd')}
            </span>

            {dayEvents.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#9c7526]" />
            )}
          </div>

          {/* Event Snippets on Grid cell (with color dot & title) */}
          <div className="space-y-1 mt-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((e) => {
              const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.date;
              return (
                <div
                  key={`event-${e.id}`}
                  className={`text-[10px] px-1.5 py-0.5 truncate border flex items-center gap-1.5 ${color.bg} ${color.text} ${color.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />
                  <span className="truncate font-medium">{e.title}</span>
                </div>
              );
            })}

            {dayEvents.length > 2 && (
              <span className="text-[9px] font-mono-tech text-stone-400 block text-right">
                +{dayEvents.length - 2} more
              </span>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  const selectedDayEvents = getEventsForDay(selectedDate);
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

  return (
    <div className="space-y-6 pb-16">
      {/* Calendar View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix (2 cols) */}
        <div className="lg:col-span-2 arch-surface border border-[#e5e0d4]">
          {/* Top Bar with Navigation & Add Event Button */}
          <div className="p-4 sm:p-5 border-b border-[#e5e0d4] flex items-center justify-between font-mono-tech bg-[#fcfbf8]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 border border-[#e5e0d4] hover:bg-stone-100 text-stone-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 border border-[#e5e0d4] hover:bg-stone-100 text-stone-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now);
                  setSelectedDate(now);
                }}
                className="px-3 py-1.5 border border-[#e5e0d4] text-xs uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-4">
              <h3 className="font-serif-editorial text-2xl text-[#181c24] font-medium tracking-wide">
                {format(currentMonth, 'MMMM yyyy', { locale: enUS })}
              </h3>

              <button
                onClick={() => onOpenCreateEventForDay(formattedSelectedDate)}
                className="hidden sm:flex px-3.5 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-white text-xs font-mono-tech uppercase tracking-wider font-semibold items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#d8b46e]" />
                Add Event
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-[#f6f4ee] border-b border-[#e5e0d4] font-mono-tech text-[10px] uppercase tracking-widest text-stone-500 py-2.5 text-center font-semibold">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Day Cells */}
          <div className="border-l border-t border-[#e5e0d4]">
            {rows}
          </div>
        </div>

        {/* Selected Day Details Panel (1 col) */}
        <div className="arch-surface p-6 border border-[#e5e0d4] flex flex-col justify-between space-y-6">
          <div>
            <div className="pb-4 border-b border-[#e5e0d4]">
              <h3 className="text-2xl font-normal text-[#181c24] font-serif-editorial">
                {format(selectedDate, 'EEEE, MMMM d', { locale: enUS })}
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'yyyy')}
              </p>
            </div>

            {/* List of events on selected date */}
            <div className="mt-4 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="p-8 text-center bg-[#fbf9f4] border border-dashed border-[#e5e0d4]">
                  <CalendarIcon className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    No events scheduled on this day
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((e) => {
                  const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.date;
                  const author = e.creator?.display_name || 'Maciej';
                  const isAuthorSelina = author.toLowerCase().includes('selina');
                  const authorPhoto = isAuthorSelina ? selinaAvatar : maciejAvatar;

                  return (
                    <div
                      key={`sel-event-${e.id}`}
                      className={`p-4 border relative ${color.bg} ${color.border}`}
                    >
                      {/* Top Header: Author with Larger Photo & Color Swatch (No Category Name) */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={authorPhoto}
                            alt={author}
                            className="w-8 h-8 object-cover border border-[#e5e0d4] shadow-2xs"
                          />
                          <div>
                            <span className="text-xs font-mono-tech text-stone-600 block leading-tight">
                              Added by: <strong className="text-stone-900 font-semibold">{author}</strong>
                            </span>
                          </div>
                          <span className={`w-3 h-3 rounded-full ${color.dot} ml-1 shadow-xs`} title="Category color" />
                        </div>

                        <button
                          onClick={() => setEventToDelete(e)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-serif-editorial text-xl text-[#181c24] mb-1 font-medium">{e.title}</h4>
                      {e.description && (
                        <p className="text-xs text-stone-700 font-light mb-2">{e.description}</p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono-tech mt-2 pt-2 border-t border-stone-200/60">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{format(parseISO(e.event_date), 'h:mm a')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Single Add Event Button */}
          <div className="pt-4 border-t border-[#e5e0d4]">
            <button
              onClick={() => onOpenCreateEventForDay(formattedSelectedDate)}
              className="w-full py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#d8b46e]" />
              Add Event for This Day
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Event Deletion */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e0d4] p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-2xl font-normal text-[#181c24] mb-2 font-serif-editorial">
              Delete Event
            </h4>
            <p className="text-xs text-stone-600 mb-6 font-light leading-relaxed">
              Are you sure you want to remove <strong>"{eventToDelete.title}"</strong> from the shared calendar?
            </p>

            <div className="flex justify-end gap-2 font-mono-tech text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-stone-600 hover:text-stone-900"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
