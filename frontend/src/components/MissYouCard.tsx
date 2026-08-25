import React, { useState, useEffect } from 'react';
import { Heart, Check } from 'lucide-react';
import { api } from '../api/client';
import { MissYouStats } from '../types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const MissYouCard: React.FC = () => {
  const [stats, setStats] = useState<MissYouStats | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.getMissYouStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load miss you stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 15 seconds to keep counts in sync between partners
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMissYou = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      const updated = await api.sendMissYou();
      setStats(updated);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 2500);
    } catch (err) {
      console.error('Failed to send miss you ping:', err);
    } finally {
      setIsSending(false);
    }
  };

  const partnerName = stats?.partner_name || 'Partner';
  const partnerCount = stats?.partner_count ?? 0;
  const myCount = stats?.my_count ?? 0;

  const parseUtcDate = (dateStr: string) => {
    // If no timezone indicator, append Z to ensure UTC parsing
    const normalized = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
    return parseISO(normalized);
  };

  const formattedPartnerLastSent = stats?.partner_last_sent
    ? formatDistanceToNow(parseUtcDate(stats.partner_last_sent), { addSuffix: true, locale: enUS })
    : null;

  const formattedMyLastSent = stats?.my_last_sent
    ? formatDistanceToNow(parseUtcDate(stats.my_last_sent), { addSuffix: true, locale: enUS })
    : null;

  return (
    <div className="relative arch-surface p-6 sm:p-8 border border-[#e5e0d4] shadow-xs">
      {/* Corner drafting crosshairs */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#9c7526] font-semibold">
              [ 02 // I miss you counter ]
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-normal text-[#181c24] font-serif-editorial">
            Thinking of You
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-mono-tech text-stone-400">
            {formattedPartnerLastSent && (
              <span>
                Last from {partnerName}: <strong className="text-stone-700 font-medium">{formattedPartnerLastSent}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Counter Display & Action Button */}
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
          {/* Partner's Miss Counter Card */}
          <div className="bg-[#fbf9f4] border border-[#e5e0d4] px-5 py-3 text-center min-w-[130px] shadow-xs">
            <span className="text-3xl sm:text-4xl font-light text-[#9c7526] font-serif-editorial block leading-none">
              {partnerCount}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono-tech text-stone-500 mt-1.5 block font-medium">
              Missed by {partnerName}
            </span>
          </div>

          {/* Action Button: I miss you */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleSendMissYou}
              disabled={isSending}
              className={`px-5 py-3 text-xs font-mono-tech uppercase tracking-wider font-semibold flex items-center gap-2 transition-all shadow-xs ${
                justSent
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#181c24] hover:bg-[#2c323f] text-white active:scale-98'
              } disabled:opacity-50`}
            >
              {justSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Sent</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 text-[#d8b46e]" />
                  <span>I miss you</span>
                </>
              )}
            </button>

            <span className="text-[10px] font-mono-tech text-stone-400 mt-1.5">
              You clicked {myCount} {myCount === 1 ? 'time' : 'times'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
