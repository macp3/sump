import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface CreateCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    category?: string;
    event_date: string;
    is_all_day?: boolean;
  }) => Promise<void>;
  defaultDate?: string;
}

const CATEGORIES = [
  { id: 'date', label: 'Date', colorClass: 'bg-amber-100 text-amber-950 border-amber-300' },
  { id: 'trip', label: 'Trip', colorClass: 'bg-emerald-100 text-emerald-950 border-emerald-300' },
  { id: 'plan', label: 'Plan', colorClass: 'bg-sky-100 text-sky-950 border-sky-300' },
  { id: 'general', label: 'General', colorClass: 'bg-stone-100 text-stone-900 border-stone-300' },
  { id: 'selina', label: 'Selina', colorClass: 'bg-rose-100 text-rose-950 border-rose-300' },
  { id: 'maciej', label: 'Maciej', colorClass: 'bg-indigo-100 text-indigo-950 border-indigo-300' },
];

export const CreateCalendarEventModal: React.FC<CreateCalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
}) => {
  const getDefaultDateTime = () => {
    if (defaultDate) {
      return `${defaultDate}T19:00`;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(19, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('date');
  const [eventDate, setEventDate] = useState(getDefaultDateTime());
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultDate) {
      setEventDate(`${defaultDate}T19:00`);
    }
  }, [defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        event_date: new Date(eventDate).toISOString(),
        is_all_day: false,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#e5e0d4] p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-2xl font-normal text-[#181c24] mb-1 font-serif-editorial">
          Add Event
        </h3>
        <p className="text-xs text-stone-500 mb-6 font-light">
          Add an event or plan to your shared calendar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dinner reservation, Weekend getaway, Dentist..."
              className="w-full px-3.5 py-2 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38]"
              autoFocus
            />
          </div>

          {/* Category with color */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 text-xs transition-all border text-center ${
                    category === cat.id
                      ? `${cat.colorClass} font-semibold ring-2 ring-[#181c24]`
                      : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38] font-mono-tech"
            />
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details or notes..."
              className="w-full px-3.5 py-2 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38] resize-none font-light"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-white bg-[#181c24] hover:bg-[#2c323f] transition-all flex items-center gap-1.5"
            >
              <Send className="w-3 h-3 text-[#d8b46e]" />
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
