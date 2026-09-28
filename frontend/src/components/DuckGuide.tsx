import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, ArrowRight, RotateCcw } from 'lucide-react';
import duckSide1 from '../assets/duck_side_1.png';
import duckSide2 from '../assets/duck_side_2.png';
import duckFront1 from '../assets/duck_front_1.png';
import duckFront2 from '../assets/duck_front_2.png';
import duckBack1 from '../assets/duck_back_1.png';
import duckBack2 from '../assets/duck_back_2.png';

interface TourStep {
  title: string;
  text: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Quack quack! Hello there!",
    text: "I am your duck guide! I'm here to show you around your very special place.",
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

type DuckDirection = 'side' | 'up' | 'down';

export const DuckGuide: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [caughtOpen, setCaughtOpen] = useState(false);
  const [approachMessage, setApproachMessage] = useState<string | null>(null);

  // Position and directional motion state
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [direction, setDirection] = useState<DuckDirection>('side');
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWaddling, setIsWaddling] = useState(false);
  const [walkStep, setWalkStep] = useState(0);
  const [quackBubble, setQuackBubble] = useState<string | null>(null);

  const duckRef = useRef<HTMLDivElement>(null);
  const isMovingRef = useRef(false);
  const lastFleeTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Synthesized realistic duck "Quack" sound via Web Audio API
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

      // Realistic adult duck fundamental frequency
      const startFreq = 290 * pitchMod;
      const endFreq = 185 * pitchMod;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

      // Formant filter for adult duck quack resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(920 * pitchMod, now);
      filter.Q.setValueAtTime(3.6, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.38, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Gracefully handled if browser audio policy blocks
    }
  };

  // True multi-frame walk cycle alternator (switching feet frames while walking)
  useEffect(() => {
    if (!isWaddling) {
      setWalkStep(0);
      return;
    }
    const interval = setInterval(() => {
      setWalkStep((prev) => (prev === 0 ? 1 : 0));
    }, 120);
    return () => clearInterval(interval);
  }, [isWaddling]);

  // Initial placement and first-time tour check
  useEffect(() => {
    const initX = Math.max(window.innerWidth - 150, 60);
    const initY = Math.max(window.innerHeight - 150, 60);
    setPos({ x: initX, y: initY });

    const tourDone = localStorage.getItem('sump_duck_tour_done');
    if (!tourDone) {
      setTimeout(() => {
        setTourOpen(true);
        playQuackSound(1.0);
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

  // Helper to update direction based on motion vector
  const updateDirection = (currentX: number, currentY: number, targetX: number, targetY: number) => {
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    // Check if vertical motion is dominant
    if (Math.abs(dy) > Math.abs(dx) * 0.85) {
      if (dy < 0) {
        setDirection('up'); // Moving UP: back turned to viewer
      } else {
        setDirection('down'); // Moving DOWN: facing front to viewer
      }
    } else {
      setDirection('side'); // Moving horizontally: side profile
      setFacingLeft(dx < 0);
    }
  };

  // Spontaneous behavior: Duck runs up to the user on her own occasionally
  useEffect(() => {
    const runInterval = setInterval(() => {
      if (tourOpen || caughtOpen || isMovingRef.current || approachMessage) return;

      if (Math.random() > 0.35) {
        const mouse = lastMousePosRef.current;
        isMovingRef.current = true;
        setIsWaddling(true);

        const sideOffset = Math.random() > 0.5 ? 90 : -90;
        const targetX = Math.max(30, Math.min(mouse.x + sideOffset, window.innerWidth - 100));
        const targetY = Math.max(30, Math.min(mouse.y + (Math.random() * 50 - 25), window.innerHeight - 100));

        updateDirection(pos.x, pos.y, targetX, targetY);
        setPos({ x: targetX, y: targetY });

        setQuackBubble("QUACK QUACK!");
        playQuackSound(1.1);

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
          setQuackBubble(null);
          // Return to normal default side position when stopped
          setDirection('side');

          const randomMsg = SPONTANEOUS_MESSAGES[Math.floor(Math.random() * SPONTANEOUS_MESSAGES.length)];
          setApproachMessage(randomMsg);
          playQuackSound(1.15);

          setTimeout(() => {
            setApproachMessage(null);
          }, 3500);
        }, 450);
      }
    }, 15000 + Math.random() * 8000);

    return () => clearInterval(runInterval);
  }, [pos, tourOpen, caughtOpen, approachMessage]);

  // Fleeing mouse cursor logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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

      if (distance < 115) {
        if (approachMessage) {
          setApproachMessage(null);
        }

        lastFleeTimeRef.current = now;
        isMovingRef.current = true;
        setIsWaddling(true);

        const angle = Math.atan2(dy, dx);
        const jumpDistance = 150 + Math.random() * 130;
        const jitter = (Math.random() - 0.5) * 0.7;
        const fleeAngle = angle + Math.PI + jitter;

        let targetX = pos.x + Math.cos(fleeAngle) * jumpDistance;
        let targetY = pos.y + Math.sin(fleeAngle) * jumpDistance;

        const padding = 50;
        const maxX = window.innerWidth - 110;
        const maxY = window.innerHeight - 110;

        if (targetX < padding) targetX = padding + Math.random() * 90;
        if (targetX > maxX) targetX = maxX - Math.random() * 90;
        if (targetY < padding) targetY = padding + Math.random() * 90;
        if (targetY > maxY) targetY = maxY - Math.random() * 90;

        updateDirection(pos.x, pos.y, targetX, targetY);
        setPos({ x: targetX, y: targetY });

        playQuackSound(1.1);
        setQuackBubble(Math.random() > 0.5 ? "QUACK!" : "QUACK QUACK!");
        setTimeout(() => setQuackBubble(null), 700);

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
          // Return to normal default side position when movement completes
          setDirection('side');
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
    setTimeout(() => {
      setIsWaddling(false);
      setDirection('side');
    }, 500);

    if (tourOpen) {
      handleNextTourStep();
    } else {
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
    playQuackSound(1.05);
  };

  // Helper to calculate clamped fixed coordinates for popups so they NEVER overflow the viewport
  const getClampedPopupStyle = (width = 300, height = 180) => {
    const screenPadding = 16;
    const w = Math.min(width, window.innerWidth - screenPadding * 2);

    const left = Math.max(screenPadding, Math.min(pos.x + 45 - w / 2, window.innerWidth - w - screenPadding));

    const placeAbove = pos.y > height + 24;
    const top = placeAbove
      ? Math.max(screenPadding, pos.y - height - 12)
      : Math.min(window.innerHeight - height - screenPadding, pos.y + 95);

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${w}px`,
      zIndex: 70,
    };
  };

  // Current duck image according to direction and walk cycle step
  const getCurrentDuckImage = () => {
    if (!isWaddling) {
      // Resting / normal idle pose: peaceful adult duck side profile
      return duckSide1;
    }

    if (direction === 'up') {
      // Walking UP: back view with full head, alternating stepping feet
      return walkStep === 0 ? duckBack1 : duckBack2;
    }

    if (direction === 'down') {
      // Walking DOWN: front view facing viewer, alternating stepping feet
      return walkStep === 0 ? duckFront1 : duckFront2;
    }

    // Walking SIDEWAYS: alternating side stride step frames
    return walkStep === 0 ? duckSide1 : duckSide2;
  };

  return (
    <>
      {/* Subtle bounce keyframes while walking */}
      <style>{`
        @keyframes duck-walk-hop {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .duck-walk-hop-anim {
          animation: duck-walk-hop 0.16s infinite ease-in-out;
        }
      `}</style>

      {/* 1. Clamped Guided Tour Speech Bubble */}
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

      {/* 2. Clamped Caught Popup Bubble */}
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
                playQuackSound(1.15);
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
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-serif-editorial text-stone-800 text-base font-semibold pt-1.5 leading-snug">
            {approachMessage}
          </p>
        </div>
      )}

      {/* Main Free-Roaming Adult Duck Character */}
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

        {/* Directional Photorealistic Adult Duck with True Multi-Frame Walk Cycle */}
        <div
          onClick={handleDuckClick}
          className="cursor-pointer relative hover:scale-105 active:scale-95 transition-transform duration-100"
          title="QUACK!"
        >
          {/* Soft contact shadow on ground */}
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-stone-900/15 rounded-full blur-[2px] transition-all duration-150 ${
              isWaddling ? 'scale-x-90 opacity-30' : 'scale-x-100 opacity-60'
            }`}
          />

          {/* Stepping Duck Sprite Frame */}
          <img
            src={getCurrentDuckImage()}
            alt="Adult Duck"
            style={{
              transform: direction === 'side' && facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
              transformOrigin: 'center bottom',
            }}
            className={`w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-sm pointer-events-none select-none ${
              isWaddling ? 'duck-walk-hop-anim' : ''
            }`}
            draggable={false}
          />
        </div>
      </div>
    </>
  );
};
