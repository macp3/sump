import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, ArrowRight, RotateCcw } from 'lucide-react';

interface TourStep {
  title: string;
  text: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Kwa kwa! Cześć!",
    text: "Jestem Twoją kaczuszką! Przyszłam tu, żeby pokazać Ci Wasze wyjątkowe miejsce.",
  },
  {
    title: "Nasz zegar",
    text: "W sekcji 'Our clock' możecie uruchomić Wasz wspólny zegar. Raz włączony, będzie odliczał każdą wspólną sekundę na zawsze!",
  },
  {
    title: "Przycisk tęsknoty",
    text: "Widzisz 'I miss you'? Kliknij go, kiedy tylko pomyślisz o drugiej połówce. Licznik od razu pokaże to partnerowi!",
  },
  {
    title: "Wspólny kalendarz",
    text: "W zakładce Calendar możecie planować randki, podróże i plany. Wszystko synchronizuje się w czasie rzeczywistym!",
  },
  {
    title: "A teraz... zabawa!",
    text: "To wszystko! Po cichu zdradzę Ci, że strasznie lubię biegać. Spróbuj mnie teraz dogonić kursorem! Kwa kwa!",
  },
];

export const DuckGuide: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [caughtOpen, setCaughtOpen] = useState(false);

  // Position on screen
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWaddling, setIsWaddling] = useState(false);
  const [quackBubble, setQuackBubble] = useState<string | null>(null);

  const duckRef = useRef<HTMLDivElement>(null);
  const isMovingRef = useRef(false);
  const lastFleeTimeRef = useRef(0);

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
        if (Math.random() > 0.4) {
          playQuackSound(1.2);
          setQuackBubble(Math.random() > 0.5 ? "Kwa!" : "Tuptup!");
          setTimeout(() => setQuackBubble(null), 700);
        }

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
        }, 450);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pos, tourOpen, caughtOpen]);

  const handleDuckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQuackSound(0.95);
    setIsWaddling(true);
    setTimeout(() => setIsWaddling(false), 500);

    if (tourOpen) {
      // Continue tour
      handleNextTourStep();
    } else {
      // Caught the duck!
      setCaughtOpen(true);
      setQuackBubble("Złapany!");
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
      setQuackBubble("Uciekam!");
      setTimeout(() => setQuackBubble(null), 1200);
    }
  };

  const handleRestartTour = () => {
    setCaughtOpen(false);
    setCurrentStep(0);
    setTourOpen(true);
    playQuackSound(1.1);
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

      {/* Main Free-Roaming Duck Container */}
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
        {/* Little Floating Quack Bubble while running */}
        {quackBubble && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#181c24] text-[#fcd34d] px-2 py-0.5 rounded text-[11px] font-mono-tech tracking-wider font-semibold shadow-md animate-bounce">
            {quackBubble}
          </div>
        )}

        {/* Guided Tour Speech Bubble */}
        {tourOpen && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 sm:w-80 p-4 bg-[#fcfbf7] border-2 border-[#b58c38] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Speech bubble pointer */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[#b58c38]" />

            <div className="flex items-center justify-between pb-1.5 border-b border-[#e5e0d4]">
              <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#9c7526] font-semibold">
                Krok {currentStep + 1} z {TOUR_STEPS.length}
              </span>
              <button
                onClick={() => {
                  setTourOpen(false);
                  localStorage.setItem('sump_duck_tour_done', 'true');
                }}
                className="text-stone-400 hover:text-stone-700 p-0.5"
                title="Pomiń"
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
                Pomiń
              </button>

              <button
                onClick={handleNextTourStep}
                className="px-3 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>{currentStep === TOUR_STEPS.length - 1 ? "Start zabawy!" : "Dalej"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Caught Popup Bubble */}
        {caughtOpen && !tourOpen && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 bg-[#fcfbf7] border-2 border-[#e5e0d4] rounded-xl shadow-xl z-50">
            <div className="flex items-center justify-between pb-1 border-b border-[#e5e0d4]">
              <span className="text-[10px] font-mono-tech text-[#9c7526] uppercase font-semibold">
                Brawo!
              </span>
              <button
                onClick={() => setCaughtOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-stone-700 py-2 font-serif-editorial text-base">
              Kwa! Złapałeś mnie! Jestem najszybszą kaczuszką na świecie.
            </p>

            <div className="flex items-center gap-2 pt-1 border-t border-[#e5e0d4]">
              <button
                onClick={handleRestartTour}
                className="flex-1 py-1 px-2 bg-[#181c24] hover:bg-[#2c323f] text-white text-[10px] font-mono-tech uppercase tracking-wider rounded flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-[#fcd34d]" />
                <span>Przewodnik</span>
              </button>
              <button
                onClick={() => {
                  setCaughtOpen(false);
                  playQuackSound(1.2);
                }}
                className="flex-1 py-1 px-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-[10px] font-mono-tech uppercase tracking-wider rounded"
              >
                Biegnij dalej!
              </button>
            </div>
          </div>
        )}

        {/* Standalone Animated Duck Vector Graphic */}
        <div
          onClick={handleDuckClick}
          style={{
            transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
            transformOrigin: 'center center',
          }}
          className={`cursor-pointer transition-transform duration-100 ${
            isWaddling ? 'duck-body-bob-anim' : 'hover:scale-105 active:scale-95'
          }`}
          title="Kliknij kaczuszkę, by zakwakać!"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md"
          >
            {/* Animated Pattering Feet (Tuptające nóżki) */}
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
