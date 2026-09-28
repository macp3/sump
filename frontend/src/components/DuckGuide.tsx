import React, { useState } from 'react';
import { Volume2, X, MessageCircle, ArrowRight } from 'lucide-react';

const GUIDE_TIPS = [
  "Quack! Welcome to SUMP. I am your quiet companion and atelier guide.",
  "Quack! In the 'Our clock' section, you can start tracking your shared time together permanently.",
  "Quack! Click 'I miss you' whenever you want your partner to know you are thinking of them.",
  "Quack! Hop over to the Calendar tab to add dates, trips, or romantic plans.",
  "Quack! The letter in the Overview is your private parchment space for heartfelt words.",
  "Quack! Every event and interaction is synchronized across both accounts in real time.",
  "Quack! Don't forget to check Upcoming Events so you never miss a special date.",
];

export const DuckGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isWaddling, setIsWaddling] = useState(false);

  // Play synthesized duck "quack" using native Web Audio API
  const playQuackSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Formant synthesis for a classic duck quack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Frequency envelope: rapid downward pitch bend
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.18);

      // Bandpass formant filter for duck resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(3.5, now);

      // Amplitude envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio playback silently gracefully handled if browser policy restricts
    }
  };

  const handleDuckClick = () => {
    playQuackSound();
    setIsWaddling(true);
    setTimeout(() => setIsWaddling(false), 350);

    if (!isOpen) {
      setIsOpen(true);
    } else {
      // Cycle to next tip if already open
      setTipIndex((prev) => (prev + 1) % GUIDE_TIPS.length);
    }
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQuackSound();
    setTipIndex((prev) => (prev + 1) % GUIDE_TIPS.length);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Speech Bubble / Guide Card */}
      {isOpen && (
        <div className="relative mb-3 w-72 sm:w-80 p-4 arch-card border border-[#e5e0d4] shadow-lg bg-[#fcfbf7] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Corner drafting crosshairs */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#b58c38]" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#b58c38]" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#b58c38]" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#b58c38]" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0d4]">
            <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-wider text-[#9c7526] font-semibold">
              <MessageCircle className="w-3 h-3" />
              <span>[ GUIDE // ATELIER COMPANION ]</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
              title="Close guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="py-3">
            <h4 className="font-serif-editorial text-xl text-[#181c24] font-medium mb-1">
              Quack!
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              {GUIDE_TIPS[tipIndex]}
            </p>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e5e0d4]/80 text-[11px] font-mono-tech">
            <span className="text-stone-400">
              Tip {tipIndex + 1}/{GUIDE_TIPS.length}
            </span>
            <button
              onClick={handleNextTip}
              className="flex items-center gap-1 text-[#9c7526] hover:text-[#735213] font-medium transition-colors"
            >
              <span>Next Quack</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* The Interactive Duck */}
      <button
        onClick={handleDuckClick}
        aria-label="Atelier Duck Guide - click to Quack"
        className={`group relative flex items-center justify-center cursor-pointer transition-transform duration-200 outline-none ${
          isWaddling ? 'scale-110 -rotate-6' : 'hover:scale-105 active:scale-95'
        }`}
        title="Click me for a Quack!"
      >
        {/* Subtle glow / badge behind duck */}
        <div className="absolute inset-0 bg-[#d8b46e]/20 rounded-full blur-md group-hover:bg-[#d8b46e]/30 transition-colors" />

        {/* Small floating prompt indicator if closed */}
        {!isOpen && (
          <span className="absolute -top-2 -left-2 bg-[#181c24] text-[#d8b46e] border border-[#e5e0d4] text-[9px] font-mono-tech uppercase tracking-widest px-1.5 py-0.5 shadow-xs">
            Quack
          </span>
        )}

        {/* Custom Clean Editorial Duck SVG */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 p-1.5 bg-[#fbf9f4] border border-[#e5e0d4] rounded-full shadow-md flex items-center justify-center group-hover:border-[#b58c38] transition-colors">
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full drop-shadow-2xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Duck Body */}
            <path
              d="M16 38 C 16 28, 28 26, 38 28 C 42 22, 50 20, 56 26 C 58 28, 58 34, 52 38 C 50 44, 42 50, 28 50 C 18 50, 16 44, 16 38 Z"
              fill="#F5C542"
              stroke="#D49E24"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Duck Tail Wing */}
            <path
              d="M16 38 C 12 36, 8 32, 10 28 C 14 30, 18 34, 20 36 Z"
              fill="#E5B028"
              stroke="#D49E24"
              strokeWidth="1.5"
            />
            {/* Duck Wing */}
            <path
              d="M26 36 C 26 32, 34 32, 38 36 C 36 42, 28 42, 26 36 Z"
              fill="#E5B028"
              stroke="#D49E24"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Duck Head */}
            <circle
              cx="44"
              cy="22"
              r="10"
              fill="#F5C542"
              stroke="#D49E24"
              strokeWidth="2"
            />
            {/* Duck Eye */}
            <circle cx="46" cy="20" r="1.8" fill="#181C24" />
            <circle cx="46.6" cy="19.4" r="0.6" fill="#FFFFFF" />
            {/* Duck Beak */}
            <path
              d="M52 22 C 58 21, 62 23, 62 25 C 58 27, 52 26, 52 26 Z"
              fill="#E07A3C"
              stroke="#C45E20"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Water Ripple Details */}
            <path
              d="M20 54 C 28 56, 36 56, 44 54"
              stroke="#B58C38"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};
