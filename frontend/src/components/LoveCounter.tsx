import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { api } from '../api/client';

export const LoveCounter: React.FC = () => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch clock state from the database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchClockState = async () => {
      try {
        const state = await api.getClockState();
        if (isMounted && state.clock_started_at) {
          setStartTime(state.clock_started_at);
        }
      } catch (err) {
        console.error('Failed to fetch clock state:', err);
      }
    };

    fetchClockState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update real-time ticker when startTime is available from the database
  useEffect(() => {
    if (!startTime) {
      setTimeTogether({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const startDate = new Date(startTime);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();

      if (diffMs < 0) {
        setTimeTogether({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeTogether({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleStartClock = async () => {
    setIsStarting(true);
    try {
      const response = await api.startClock();
      if (response.clock_started_at) {
        setStartTime(response.clock_started_at);
      }
    } catch (err) {
      console.error('Failed to start clock in database:', err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="relative arch-surface p-6 md:p-8 border border-[#e5e0d4]">
      {/* Corner drafting crosshairs */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono-tech text-[#9c7526] uppercase tracking-[0.25em] font-semibold">
              [ 01 // Our Clock ]
            </span>
          </div>

          {/* Description text - only visible before starting the clock */}
          {!startTime && (
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md font-light">
              One day maybe we will put here our time together. Its up to u to start the clock but be careful, once you start it, it will never stop.
            </p>
          )}

          {/* Start Clock Button - only visible before starting the clock */}
          {!startTime && (
            <button
              onClick={handleStartClock}
              disabled={isStarting}
              className="mt-4 px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-white text-xs font-mono-tech uppercase tracking-wider font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-[#d8b46e] fill-[#d8b46e]" />
              <span>{isStarting ? 'Starting...' : 'Start Clock'}</span>
            </button>
          )}
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full lg:w-auto font-mono-tech">
          <div className="bg-[#fbf9f4] border border-[#e5e0d4] p-4 text-center min-w-[75px] sm:min-w-[95px] shadow-xs">
            <span className="text-3xl sm:text-4xl font-light text-[#181c24] font-serif-editorial block">
              {timeTogether.days}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 mt-1 block font-medium">
              Days
            </span>
          </div>

          <div className="bg-[#fbf9f4] border border-[#e5e0d4] p-4 text-center min-w-[75px] sm:min-w-[95px] shadow-xs">
            <span className="text-3xl sm:text-4xl font-light text-[#181c24] font-serif-editorial block">
              {timeTogether.hours}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 mt-1 block font-medium">
              Hours
            </span>
          </div>

          <div className="bg-[#fbf9f4] border border-[#e5e0d4] p-4 text-center min-w-[75px] sm:min-w-[95px] shadow-xs">
            <span className="text-3xl sm:text-4xl font-light text-[#181c24] font-serif-editorial block">
              {timeTogether.minutes}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 mt-1 block font-medium">
              Minutes
            </span>
          </div>

          <div className="bg-[#fbf9f4] border border-[#e5e0d4] p-4 text-center min-w-[75px] sm:min-w-[95px] shadow-xs">
            <span className="text-3xl sm:text-4xl font-light text-[#9c7526] font-serif-editorial block">
              {timeTogether.seconds}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 mt-1 block font-medium">
              Seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
