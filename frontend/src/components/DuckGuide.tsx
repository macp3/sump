import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, ArrowRight, RotateCcw } from 'lucide-react';

interface TourStep {
  title: string;
  text: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Quack quack! Hello there!",
    text: "I am your little duck! I'm here to show you around your very special place.",
  },
  {
    title: "Our clock",
    text: "In 'Our clock', you can start your shared time counter. Once started, it will tick every second forever and cannot be reset!",
  },
  {
    title: "Miss you button",
    text: "See 'I miss you'? Click it anytime you think of your partner. The counter will instantly let them know!",
  },
  {
    title: "Shared calendar",
    text: "In the Calendar tab, you can plan dates, trips, and future adventures together in real time.",
  },
  {
    title: "QUACK!",
    text: "QUACK QUACK QUACK QUACK QUACK",
  },
];

const SPONTANEOUS_MESSAGES = [
  "QUACK! QUACK QUACK!",
  "QUACK QUACK QUACK!",
  "QUACK!",
  "QUACK QUACK!",
];

export const DuckGuide: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [caughtOpen, setCaughtOpen] = useState(false);
  const [approachMessage, setApproachMessage] = useState<string | null>(null);

  // Position on screen
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWaddling, setIsWaddling] = useState(false);
  const [quackBubble, setQuackBubble] = useState<string | null>(null);

  const duckRef = useRef<HTMLDivElement>(null);
  const isMovingRef = useRef(false);
  const lastFleeTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Synthesized realistic and sweet duck "Quack" sound via Web Audio API
  const playQuackSound = (pitchMod = 1) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Pitch sweep
      const startFreq = 350 * pitchMod;
      const endFreq = 220 * pitchMod;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

      // Formant nasal resonance filter
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1050 * pitchMod, now);
      filter.Q.setValueAtTime(3.8, now);

      // Volume envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Gracefully handled if browser audio policy blocks
    }
  };

  // Initial placement and first-time tour check
  useEffect(() => {
    // Set initial position in the bottom right corner
    const initX = Math.max(window.innerWidth - 140, 60);
    const initY = Math.max(window.innerHeight - 140, 60);
    setPos({ x: initX, y: initY });

    // Check if tour was already shown
    const tourDone = localStorage.getItem('sump_duck_tour_done');
    if (!tourDone) {
      setTimeout(() => {
        setTourOpen(true);
        playQuackSound(1.1);
      }, 700);
    }
  }, []);

  // Track user mouse position
  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', trackMouse);
    return () => window.removeEventListener('mousemove', trackMouse);
  }, []);

  // Spontaneous behavior: Duck runs up to the user on her own occasionally
  useEffect(() => {
    const runInterval = setInterval(() => {
      // Only approach if tour and popups are closed and duck isn't currently moving
      if (tourOpen || caughtOpen || isMovingRef.current || approachMessage) return;

      // 60% chance to run up to the user when interval fires
      if (Math.random() > 0.4) {
        const mouse = lastMousePosRef.current;
        isMovingRef.current = true;
        setIsWaddling(true);

        // Calculate offset near cursor (around 85px to the side)
        const sideOffset = Math.random() > 0.5 ? 85 : -85;
        const targetX = Math.max(30, Math.min(mouse.x + sideOffset, window.innerWidth - 90));
        const targetY = Math.max(30, Math.min(mouse.y + (Math.random() * 40 - 20), window.innerHeight - 90));

        setFacingLeft(targetX < pos.x);
        setPos({ x: targetX, y: targetY });

        // Little patter bubble while rushing over
        setQuackBubble("QUACK QUACK!");
        playQuackSound(1.15);

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
          setQuackBubble(null);

          // Say QUACK upon arriving
          const randomMsg = SPONTANEOUS_MESSAGES[Math.floor(Math.random() * SPONTANEOUS_MESSAGES.length)];
          setApproachMessage(randomMsg);
          playQuackSound(1.2);

          // Hide after 3.5 seconds
          setTimeout(() => {
            setApproachMessage(null);
          }, 3500);
        }, 450);
      }
    }, 16000 + Math.random() * 8000); // Every 16-24 seconds

    return () => clearInterval(runInterval);
  }, [pos, tourOpen, caughtOpen, approachMessage]);

  // Fleeing mouse cursor logic (runs when tour is not actively open)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Do not flee while reading the tour or caught bubble
      if (tourOpen || caughtOpen || isMovingRef.current) return;

      const now = Date.now();
      if (now - lastFleeTimeRef.current < 250) return;

      const duckEl = duckRef.current;
      if (!duckEl) return;

      const rect = duckEl.getBoundingClientRect();
      const duckCenterX = rect.left + rect.width / 2;
      const duckCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - duckCenterX;
      const dy = e.clientY - duckCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Proximity threshold: 110px
      if (distance < 110) {
        // If an approach message was displayed, close it as duck flees
        if (approachMessage) {
          setApproachMessage(null);
        }

        lastFleeTimeRef.current = now;
        isMovingRef.current = true;
        setIsWaddling(true);

        // Vector away from cursor
        const angle = Math.atan2(dy, dx);
        const jumpDistance = 140 + Math.random() * 120;

        // Flee in opposite direction with slight random jitter
        const jitter = (Math.random() - 0.5) * 0.8;
        const fleeAngle = angle + Math.PI + jitter;

        let targetX = pos.x + Math.cos(fleeAngle) * jumpDistance;
        let targetY = pos.y + Math.sin(fleeAngle) * jumpDistance;

        // Keep inside screen boundaries
        const padding = 50;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        if (targetX < padding) targetX = padding + Math.random() * 100;
        if (targetX > maxX) targetX = maxX - Math.random() * 100;
        if (targetY < padding) targetY = padding + Math.random() * 100;
        if (targetY > maxY) targetY = maxY - Math.random() * 100;

        // Flip duck facing direction based on movement
        setFacingLeft(targetX < pos.x);
        setPos({ x: targetX, y: targetY });

        // Little quick quack while fleeing
        playQuackSound(1.2);
        setQuackBubble(Math.random() > 0.5 ? "QUACK!" : "QUACK QUACK!");
        setTimeout(() => setQuackBubble(null), 700);

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
        }, 450);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pos, tourOpen, caughtOpen, approachMessage]);

  const handleDuckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQuackSound(0.95);
    setIsWaddling(true);
    setApproachMessage(null);
    setTimeout(() => setIsWaddling(false), 500);

    if (tourOpen) {
      handleNextTourStep();
    } else {
      // Caught the duck!
      setCaughtOpen(true);
      setQuackBubble("QUACK!");
      setTimeout(() => setQuackBubble(null), 1000);
    }
  };

  const handleNextTourStep = () => {
    playQuackSound(1.05);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finished tour
      setTourOpen(false);
      localStorage.setItem('sump_duck_tour_done', 'true');
      setQuackBubble("QUACK!");
      setTimeout(() => setQuackBubble(null), 1200);
    }
  };

  const handleRestartTour = () => {
    setCaughtOpen(false);
    setApproachMessage(null);
    setCurrentStep(0);
    setTourOpen(true);
    playQuackSound(1.1);
  };

  // Helper to calculate clamped fixed coordinates for popups so they NEVER overflow the viewport
  const getClampedPopupStyle = (width = 300, height = 180) => {
    const screenPadding = 16;
    const w = Math.min(width, window.innerWidth - screenPadding * 2);

    // Center horizontally on duck, clamped to viewport
    const left = Math.max(screenPadding, Math.min(pos.x + 32 - w / 2, window.innerWidth - w - screenPadding));

    // Place above duck if there is room; otherwise place below duck
    const placeAbove = pos.y > height + 24;
    const top = placeAbove
      ? Math.max(screenPadding, pos.y - height - 12)
      : Math.min(window.innerHeight - height - screenPadding, pos.y + 70);

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${w}px`,
      zIndex: 70,
    };
  };

  return (
    <>
      {/* Dynamic Keyframes for waddling feet & wing flapping */}
      <style>{`
        @keyframes duck-waddle-left {
          0% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-25deg) translateY(-4px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        @keyframes duck-waddle-right {
          0% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(25deg) translateY(-4px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        @keyframes duck-body-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes duck-wing-flap {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-28deg); }
        }
        .duck-foot-left-anim {
          animation: duck-waddle-left 0.18s infinite ease-in-out;
          transform-origin: 22px 50px;
        }
        .duck-foot-right-anim {
          animation: duck-waddle-right 0.18s infinite ease-in-out;
          transform-origin: 38px 50px;
        }
        .duck-body-bob-anim {
          animation: duck-body-bob 0.18s infinite ease-in-out;
        }
        .duck-wing-flap-anim {
          animation: duck-wing-flap 0.15s infinite ease-in-out;
          transform-origin: 24px 30px;
        }
      `}</style>

      {/* 1. Clamped Guided Tour Speech Bubble (Always 100% on screen) */}
      {tourOpen && (
        <div
          style={getClampedPopupStyle(320, 210)}
          className="p-4 bg-[#fcfbf7] border-2 border-[#b58c38] rounded-xl shadow-xl select-none animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#e5e0d4]">
            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#9c7526] font-semibold">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={() => {
                setTourOpen(false);
                localStorage.setItem('sump_duck_tour_done', 'true');
              }}
              className="text-stone-400 hover:text-stone-700 p-0.5"
              title="Skip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5">
            <h4 className="font-serif-editorial text-xl text-[#181c24] font-medium leading-snug">
              {TOUR_STEPS[currentStep].title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-1 leading-relaxed">
              {TOUR_STEPS[currentStep].text}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e5e0d4]/80">
            <button
              onClick={() => {
                setTourOpen(false);
                localStorage.setItem('sump_duck_tour_done', 'true');
              }}
              className="text-[11px] font-mono-tech text-stone-400 hover:text-stone-600"
            >
              Skip
            </button>

            <button
              onClick={handleNextTourStep}
              className="px-3 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "QUACK!" : "Next"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Clamped Caught Popup Bubble (Always 100% on screen) */}
      {caughtOpen && !tourOpen && (
        <div
          style={getClampedPopupStyle(270, 150)}
          className="p-3.5 bg-[#fcfbf7] border-2 border-[#e5e0d4] rounded-xl shadow-xl select-none animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#e5e0d4]">
            <span className="text-[10px] font-mono-tech text-[#9c7526] uppercase font-semibold">
              QUACK!
            </span>
            <button
              onClick={() => setCaughtOpen(false)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-stone-700 py-2 font-serif-editorial text-base font-semibold tracking-wide">
            QUACK! QUACK QUACK!
          </p>

          <div className="flex items-center gap-2 pt-1 border-t border-[#e5e0d4]">
            <button
              onClick={handleRestartTour}
              className="flex-1 py-1 px-2 bg-[#181c24] hover:bg-[#2c323f] text-white text-[10px] font-mono-tech uppercase tracking-wider rounded flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-[#fcd34d]" />
              <span>Guide</span>
            </button>
            <button
              onClick={() => {
                setCaughtOpen(false);
                playQuackSound(1.2);
              }}
              className="flex-1 py-1 px-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-[10px] font-mono-tech uppercase tracking-wider rounded font-semibold"
            >
              QUACK!
            </button>
          </div>
        </div>
      )}

      {/* 3. Clamped Spontaneous Approach Speech Bubble */}
      {approachMessage && !tourOpen && !caughtOpen && (
        <div
          style={getClampedPopupStyle(220, 90)}
          className="p-3 bg-[#fcfbf7] border-2 border-[#d8b46e] rounded-xl shadow-lg select-none animate-in fade-in slide-in-from-bottom-2 duration-200 text-center"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#e5e0d4]">
            <span className="text-[9px] font-mono-tech text-[#9c7526] uppercase tracking-wider font-semibold">
              QUACK
            </span>
            <button
              onClick={() => setApproachMessage(null)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="font-serif-editorial text-stone-800 text-base font-semibold pt-1.5 leading-snug">
            {approachMessage}
          </p>
        </div>
      )}

      {/* Main Free-Roaming Duck Character */}
      <div
        ref={duckRef}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: isWaddling ? 'left 0.35s ease-out, top 0.35s ease-out' : 'none',
          zIndex: 60,
        }}
        className="select-none pointer-events-auto"
      >
        {/* Floating Quack indicator badge */}
        {quackBubble && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#181c24] text-[#fcd34d] px-2 py-0.5 rounded text-[11px] font-mono-tech tracking-wider font-bold shadow-md animate-bounce">
            {quackBubble}
          </div>
        )}

        {/* Animated Duck Graphic */}
        <div
          onClick={handleDuckClick}
          style={{
            transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
            transformOrigin: 'center center',
          }}
          className={`cursor-pointer transition-transform duration-100 ${
            isWaddling ? 'duck-body-bob-anim' : 'hover:scale-105 active:scale-95'
          }`}
          title="QUACK!"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md"
          >
            {/* Animated Pattering Feet */}
            <g className={isWaddling ? 'duck-foot-left-anim' : ''}>
              {/* Left Foot */}
              <ellipse cx="22" cy="54" rx="6" ry="2.5" fill="#FF781F" stroke="#D45A00" strokeWidth="1" />
              <line x1="22" y1="46" x2="22" y2="53" stroke="#FF781F" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            <g className={isWaddling ? 'duck-foot-right-anim' : ''}>
              {/* Right Foot */}
              <ellipse cx="36" cy="54" rx="6" ry="2.5" fill="#E65C00" stroke="#B84500" strokeWidth="1" />
              <line x1="36" y1="46" x2="36" y2="53" stroke="#E65C00" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Duck Tail Feather */}
            <path
              d="M12 36 C 8 32, 6 26, 10 22 C 14 26, 16 32, 18 36 Z"
              fill="#FDB813"
              stroke="#D49A00"
              strokeWidth="1.5"
            />

            {/* Duck Round Body */}
            <ellipse
              cx="28"
              cy="36"
              rx="18"
              ry="13"
              fill="#FEC827"
              stroke="#D49A00"
              strokeWidth="1.5"
            />

            {/* Flapping Wing */}
            <g className={isWaddling ? 'duck-wing-flap-anim' : ''}>
              <path
                d="M20 34 C 20 28, 28 26, 33 32 C 30 38, 22 39, 20 34 Z"
                fill="#FDB813"
                stroke="#D49A00"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>

            {/* Duck Head */}
            <circle
              cx="44"
              cy="23"
              r="11"
              fill="#FEC827"
              stroke="#D49A00"
              strokeWidth="1.5"
            />

            {/* Sweet Big Eye with reflection */}
            <ellipse cx="46.5" cy="20" rx="2.5" ry="3" fill="#181C24" />
            <circle cx="47.2" cy="19" r="1.1" fill="#FFFFFF" />
            <circle cx="45.8" cy="21.5" r="0.5" fill="#FFFFFF" />

            {/* Rosy Cheek */}
            <ellipse cx="42" cy="26" rx="2.8" ry="1.8" fill="#FCA5A5" opacity="0.75" />

            {/* Duck Beak */}
            <path
              d="M52 23 C 58 21, 62 23, 62 25.5 C 57 28, 52 27, 52 27 Z"
              fill="#FF781F"
              stroke="#D45A00"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
};
