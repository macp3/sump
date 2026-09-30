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
    text: "In the Calendar tab, you can plan dates, milestones, and shared events together in real time.",
  },
  {
    title: "Travel planner",
    text: "In the Trips tab, you can propose romantic getaways, compare flights and hotels, budget expenses, and build day-by-day itineraries!",
  },
  {
    title: "Culinary Atelier",
    text: "In the Cooking tab, you can track fridge & pantry inventory, manage your shared grocery shopping list, and plan delicious meals together for the week!",
  },
  {
    title: "Visual Memoir",
    text: "In the Photos tab, you can add snapshots from your computer, choose which photos float in the background, or keep them stored in this memory album!",
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

interface DuckGuideProps {
  activeTab?: 'dashboard' | 'calendar' | 'trips' | 'cooking' | 'photos';
}

// 1. Chef Costume for Cooking Tab (Toque Blanche, Red Scarf, Wooden Spoon)
const ChefCostume: React.FC<{ direction: DuckDirection }> = ({ direction }) => {
  if (direction === 'side') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Chef Hat (Toque) */}
        <svg
          className="absolute -top-[16%] left-[64%] w-[36%] h-[40%] drop-shadow-md"
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hat band */}
          <path
            d="M20 85 L82 82 L84 100 L22 103 Z"
            fill="#f4f1ea"
            stroke="#d5cfc0"
            strokeWidth="2.5"
          />
          {/* Hat pleats and cloud puff */}
          <path
            d="M18 85 C10 65 12 40 30 25 C45 12 65 10 78 20 C92 30 96 55 84 82 C72 84 32 86 18 85 Z"
            fill="#ffffff"
            stroke="#d8d2c4"
            strokeWidth="2.5"
          />
          <path d="M38 28 C34 50 35 75 36 84" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 18 C52 45 53 72 54 83" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
          <path d="M70 24 C68 48 68 70 69 82" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Red French Chef Neckerchief */}
        <svg
          className="absolute top-[31%] left-[69%] w-[22%] h-[20%] drop-shadow-xs"
          viewBox="0 0 60 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 12 C20 8 40 8 50 14 C46 26 32 38 28 42 C24 36 14 24 10 12 Z"
            fill="#c92a2a"
            stroke="#a61e1e"
            strokeWidth="1.5"
          />
          <circle cx="28" cy="20" r="5" fill="#e03131" stroke="#a61e1e" strokeWidth="1" />
          <path d="M28 24 L24 38 M30 24 L34 36" stroke="#a61e1e" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Mini Wooden Spoon tucked in wing */}
        <svg
          className="absolute top-[38%] left-[28%] w-[32%] h-[32%] -rotate-25 drop-shadow-xs"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="20" cy="22" rx="14" ry="18" transform="rotate(-30 20 22)" fill="#d4a373" stroke="#bc8a5f" strokeWidth="2" />
          <path d="M28 32 L68 72" stroke="#b07d4f" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (direction === 'down') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Chef Hat Frontal */}
        <svg
          className="absolute -top-[18%] left-[34%] w-[32%] h-[40%] drop-shadow-md"
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="22" y="80" width="56" height="18" rx="2" fill="#f4f1ea" stroke="#d5cfc0" strokeWidth="2.5" />
          <path
            d="M20 80 C8 55 14 25 32 15 C42 10 58 10 68 15 C86 25 92 55 80 80 Z"
            fill="#ffffff"
            stroke="#d8d2c4"
            strokeWidth="2.5"
          />
          <path d="M36 22 C34 45 35 68 36 80" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 16 C50 42 50 68 50 80" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 22 C66 45 65 68 64 80" stroke="#e8e2d5" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Red Chef Neckerchief Frontal */}
        <svg
          className="absolute top-[32%] left-[41%] w-[20%] h-[18%] drop-shadow-xs"
          viewBox="0 0 60 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10 C20 18 40 18 52 10 C46 28 35 38 30 42 C25 38 14 28 8 10 Z"
            fill="#c92a2a"
            stroke="#a61e1e"
            strokeWidth="1.5"
          />
          <circle cx="30" cy="18" r="4.5" fill="#e03131" stroke="#a61e1e" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // Back View
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <svg
        className="absolute -top-[10%] left-[34%] w-[32%] h-[38%] drop-shadow-md"
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="24" y="80" width="52" height="18" rx="2" fill="#eae5d8" stroke="#ccc5b4" strokeWidth="2.5" />
        <path
          d="M22 80 C10 58 16 28 34 18 C44 12 56 12 66 18 C84 28 90 58 78 80 Z"
          fill="#fbf9f5"
          stroke="#d8d2c4"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
};

// 2. Traveler Costume for Trips Tab (Safari Fedora, Leather Crossbody Satchel / Compass)
const TravelerCostume: React.FC<{ direction: DuckDirection }> = ({ direction }) => {
  if (direction === 'side') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Safari Pith Helmet / Explorer Fedora */}
        <svg
          className="absolute -top-[1%] left-[58%] w-[42%] h-[30%] drop-shadow-md"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 46 C30 24 45 10 65 10 C85 10 98 24 96 46 Z"
            fill="#d8c59a"
            stroke="#b59f71"
            strokeWidth="2.5"
          />
          <path
            d="M31 46 C50 44 80 44 97 46 L98 52 C80 50 50 50 30 52 Z"
            fill="#5c3818"
            stroke="#3d240f"
            strokeWidth="1"
          />
          <rect x="62" y="45" width="8" height="6" fill="#fcd34d" stroke="#b45309" strokeWidth="1" rx="1" />
          <ellipse
            cx="64"
            cy="53"
            rx="54"
            ry="14"
            fill="#e2d4af"
            stroke="#baa373"
            strokeWidth="2.5"
          />
        </svg>

        {/* Leather Crossbody Satchel */}
        <svg
          className="absolute top-[38%] left-[26%] w-[38%] h-[36%] drop-shadow-sm"
          viewBox="0 0 90 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M78 8 C65 24 45 42 28 54"
            stroke="#633918"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect
            x="14"
            y="42"
            width="28"
            height="24"
            rx="4"
            fill="#854d0e"
            stroke="#54300a"
            strokeWidth="2"
          />
          <path d="M14 42 C22 52 34 52 42 42 Z" fill="#6d3e0b" stroke="#54300a" strokeWidth="1.5" />
          <circle cx="28" cy="49" r="2.5" fill="#fcd34d" stroke="#b45309" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  if (direction === 'down') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Safari Hat Frontal */}
        <svg
          className="absolute -top-[5%] left-[28%] w-[44%] h-[32%] drop-shadow-md"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M36 44 C34 22 46 8 60 8 C74 8 86 22 84 44 Z"
            fill="#d8c59a"
            stroke="#b59f71"
            strokeWidth="2.5"
          />
          <path d="M34 44 C50 42 70 42 86 44 L87 50 C70 48 50 48 33 50 Z" fill="#5c3818" />
          <rect x="56" y="44" width="8" height="6" fill="#fcd34d" rx="1" />
          <ellipse cx="60" cy="51" rx="56" ry="13" fill="#e2d4af" stroke="#baa373" strokeWidth="2.5" />
        </svg>

        {/* Crossbody Leather Strap with Compass Frontal */}
        <svg
          className="absolute top-[34%] left-[34%] w-[32%] h-[34%] drop-shadow-xs"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 10 L64 62" stroke="#633918" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="44" cy="38" r="9" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
          <circle cx="44" cy="38" r="7" fill="#fffbeb" stroke="#d97706" strokeWidth="0.8" />
          <path d="M44 32 L46 38 L44 44 L42 38 Z" fill="#b91c1c" />
          <circle cx="44" cy="38" r="1.5" fill="#451a03" />
        </svg>
      </div>
    );
  }

  // Back View
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <svg
        className="absolute top-[2%] left-[28%] w-[44%] h-[32%] drop-shadow-md"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M36 44 C34 22 46 8 60 8 C74 8 86 22 84 44 Z" fill="#c7b386" stroke="#9e885a" strokeWidth="2" />
        <ellipse cx="60" cy="51" rx="56" ry="13" fill="#d2c39d" stroke="#a38e60" strokeWidth="2" />
      </svg>
      <svg
        className="absolute top-[40%] left-[32%] w-[36%] h-[34%] drop-shadow-md"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="24" width="40" height="36" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <rect x="16" y="14" width="48" height="14" rx="7" fill="#365314" stroke="#1a2e05" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// 3. Photographer Costume for Photos Tab (Black Wool Beret, Rangefinder Camera on strap)
const PhotographerCostume: React.FC<{ direction: DuckDirection }> = ({ direction }) => {
  if (direction === 'side') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Parisian Atelier Wool Beret */}
        <svg
          className="absolute -top-[3%] left-[60%] w-[38%] h-[26%] -rotate-6 drop-shadow-md"
          viewBox="0 0 100 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M52 14 L50 6" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M14 42 C12 28 32 14 54 14 C78 14 94 26 92 40 C88 52 70 54 50 52 C30 50 16 48 14 42 Z"
            fill="#27272a"
            stroke="#09090b"
            strokeWidth="2"
          />
          <path d="M26 47 C40 50 62 49 76 45" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Vintage Rangefinder Camera with Leather Strap */}
        <svg
          className="absolute top-[34%] left-[58%] w-[34%] h-[32%] drop-shadow-md"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M36 6 C42 16 46 26 44 38"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="22" y="38" width="34" height="24" rx="3" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
          <rect x="22" y="35" width="34" height="7" rx="1.5" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" />
          <rect x="44" y="37" width="5" height="3" fill="#38bdf8" />
          <circle cx="28" cy="40" r="1.8" fill="#dc2626" />
          <circle cx="38" cy="50" r="8" fill="#27272a" stroke="#d4d4d8" strokeWidth="2" />
          <circle cx="38" cy="50" r="4.5" fill="#0284c7" />
          <circle cx="36" cy="48" r="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (direction === 'down') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Beret Frontal tilted */}
        <svg
          className="absolute -top-[6%] left-[30%] w-[40%] h-[28%] rotate-4 drop-shadow-md"
          viewBox="0 0 100 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50 14 L50 6" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M12 40 C10 24 30 14 52 14 C76 14 94 24 90 40 C86 50 68 52 50 50 C28 48 14 46 12 40 Z"
            fill="#27272a"
            stroke="#09090b"
            strokeWidth="2"
          />
          <path d="M24 45 C40 48 64 47 78 43" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Camera hanging around neck frontal */}
        <svg
          className="absolute top-[34%] left-[33%] w-[34%] h-[34%] drop-shadow-md"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 6 L32 36 M58 6 L48 36" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="22" y="36" width="36" height="24" rx="3" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
          <rect x="22" y="33" width="36" height="7" rx="1.5" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" />
          <rect x="26" y="30.5" width="4" height="3" fill="#a1a1aa" rx="0.5" />
          <circle cx="28" cy="42" r="1.8" fill="#dc2626" />
          <circle cx="40" cy="48" r="8.5" fill="#27272a" stroke="#d4d4d8" strokeWidth="2" />
          <circle cx="40" cy="48" r="5" fill="#0284c7" />
          <circle cx="38" cy="46" r="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // Back View
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <svg
        className="absolute top-[0%] left-[30%] w-[40%] h-[28%] drop-shadow-md"
        viewBox="0 0 100 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 14 L50 6" stroke="#18181b" strokeWidth="2" />
        <ellipse cx="50" cy="38" rx="42" ry="18" fill="#27272a" stroke="#09090b" strokeWidth="2" />
      </svg>
      <svg
        className="absolute top-[28%] left-[38%] w-[24%] h-[20%]"
        viewBox="0 0 60 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 10 C24 16 36 16 48 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const DuckGuide: React.FC<DuckGuideProps> = ({ activeTab = 'dashboard' }) => {
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
  const lastMouseMoveTimeRef = useRef(Date.now());
  const [moveDuration, setMoveDuration] = useState(0.4);
  const anticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runNextAnticRef = useRef<() => void>(() => {});

  // Touch and pointer dragging state for mobile & desktop
  const [isDraggingDuck, setIsDraggingDuck] = useState(false);
  const isDraggingRef = useRef(false);
  const justDraggedRef = useRef(false);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    hasMoved: boolean;
  } | null>(null);

  // Mischievous antics states (pecking cards, glass edges, shoving background photos)
  const [isPecking, setIsPecking] = useState(false);
  const [nibbleCrumbs, setNibbleCrumbs] = useState<Array<{ id: number; x: number; y: number; dx: number; dy: number }>>([]);
  const [glassRipple, setGlassRipple] = useState<{ x: number; y: number } | null>(null);
  const isBusyAnticRef = useRef(false);

  // Tab switch reaction quack
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      if (activeTab === 'cooking') {
        setQuackBubble('Chef Quack!');
        playQuackSound(1.15);
        const t = setTimeout(() => setQuackBubble(null), 2500);
        return () => clearTimeout(t);
      } else if (activeTab === 'trips') {
        setQuackBubble('Explorer Quack!');
        playQuackSound(1.1);
        const t = setTimeout(() => setQuackBubble(null), 2500);
        return () => clearTimeout(t);
      } else if (activeTab === 'photos') {
        setQuackBubble('Say Cheese! Quack!');
        playQuackSound(1.2);
        const t = setTimeout(() => setQuackBubble(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [activeTab]);

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

  // Synthesized realistic wooden/beak peck sound
  const playPeckSound = (pitchMod = 1) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime((850 + Math.random() * 200) * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(320 * pitchMod, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100 * pitchMod, now);
      filter.Q.setValueAtTime(4.5, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  };

  // Synthesized crystalline glass tap sound
  const playGlassTapSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.045);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  };

  const triggerNibbleCrumbs = (originX: number, originY: number) => {
    const crumbs = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: originX,
      y: originY,
      dx: (Math.random() - 0.5) * 40,
      dy: -15 - Math.random() * 25,
    }));
    setNibbleCrumbs(crumbs);
    setTimeout(() => setNibbleCrumbs([]), 450);
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

  // Track user mouse position and activity timestamp
  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      lastMouseMoveTimeRef.current = Date.now();
    };
    window.addEventListener('mousemove', trackMouse);
    return () => window.removeEventListener('mousemove', trackMouse);
  }, []);

  // Helper to update direction based on motion vector
  const updateDirection = (currentX: number, currentY: number, targetX: number, targetY: number) => {
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    // Always update facingLeft whenever there is noticeable horizontal motion
    if (Math.abs(dx) > 3) {
      setFacingLeft(dx < 0);
    }

    // Check if vertical motion is dominant
    if (Math.abs(dy) > Math.abs(dx) * 1.25) {
      if (dy < 0) {
        setDirection('up'); // Moving UP: back turned to viewer
      } else {
        setDirection('down'); // Moving DOWN: facing front to viewer
      }
    } else {
      setDirection('side'); // Moving horizontally: side profile
    }
  };

  // Fleeing mouse cursor logic (desktop only, disabled during antics and touch drag)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Do not flee on touch-only devices to avoid phantom touch flee
      if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
      if (
        tourOpen ||
        caughtOpen ||
        isMovingRef.current ||
        isDraggingRef.current ||
        isBusyAnticRef.current
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastFleeTimeRef.current < 280) return;

      const duckEl = duckRef.current;
      if (!duckEl) return;

      const rect = duckEl.getBoundingClientRect();
      const duckCenterX = rect.left + rect.width / 2;
      const duckCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - duckCenterX;
      const dy = e.clientY - duckCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 80) {
        if (approachMessage) {
          setApproachMessage(null);
        }

        lastFleeTimeRef.current = now;
        isMovingRef.current = true;
        setIsWaddling(true);

        const angle = Math.atan2(dy, dx);
        const jumpDistance = 130 + Math.random() * 110;
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

        const fleeDist = Math.hypot(targetX - pos.x, targetY - pos.y);
        const fleeDuration = Math.max(0.32, Math.min(0.75, fleeDist / 270));
        setMoveDuration(fleeDuration);

        updateDirection(pos.x, pos.y, targetX, targetY);
        setPos({ x: targetX, y: targetY });

        playQuackSound(1.1);
        setQuackBubble(Math.random() > 0.5 ? "QUACK!" : "QUACK QUACK!");
        setTimeout(() => setQuackBubble(null), 700);

        setTimeout(() => {
          setIsWaddling(false);
          isMovingRef.current = false;
          setDirection('side');
        }, fleeDuration * 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pos, tourOpen, caughtOpen, approachMessage]);

  // Autonomous mischievous antics engine
  useEffect(() => {
    const runNextAntic = () => {
      if (
        tourOpen ||
        caughtOpen ||
        isMovingRef.current ||
        isDraggingRef.current ||
        isBusyAnticRef.current ||
        document.hidden
      ) {
        // Retry soon if temporarily busy
        anticTimerRef.current = setTimeout(runNextAntic, 3500);
        return;
      }

      // Check available floating background photos
      const photoEls = Array.from(
        document.querySelectorAll<HTMLElement>('.scattered-photo-item[data-photo-id]')
      ).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 20 && rect.top > 0 && rect.bottom < window.innerHeight && rect.left > 0 && rect.right < window.innerWidth;
      });

      // Assemble candidates pool
      const anticPool: Array<'approach_cursor' | 'card' | 'photo' | 'edge' | 'nip_cursor'> = ['card', 'edge'];
      if (photoEls.length > 0) {
        anticPool.push('photo', 'photo');
      }

      // Add cursor interaction if desktop and mouse is active
      const recentMouseMove = Date.now() - lastMouseMoveTimeRef.current < 35000;
      const isHoverCapable = window.matchMedia && window.matchMedia('(hover: hover)').matches;
      if (isHoverCapable && recentMouseMove) {
        // Friendly approach to cursor (as requested by user)
        anticPool.push('approach_cursor', 'approach_cursor');
        anticPool.push('nip_cursor');
      }

      const chosen = anticPool[Math.floor(Math.random() * anticPool.length)];

      if (chosen === 'approach_cursor') {
        const mouse = lastMousePosRef.current;
        const sideOffset = Math.random() > 0.5 ? 85 : -85;
        const approachX = Math.max(30, Math.min(mouse.x + sideOffset, window.innerWidth - 100));
        const approachY = Math.max(60, Math.min(mouse.y + (Math.random() * 40 - 20), window.innerHeight - 100));

        const dist = Math.hypot(approachX - pos.x, approachY - pos.y);
        const walkDuration = Math.max(0.5, Math.min(2.4, dist / 190));
        setMoveDuration(walkDuration);

        isBusyAnticRef.current = true;
        isMovingRef.current = true;
        setIsWaddling(true);
        updateDirection(pos.x, pos.y, approachX, approachY);
        setPos({ x: approachX, y: approachY });

        playQuackSound(1.05);

        setTimeout(() => {
          if (!isBusyAnticRef.current) return;
          setIsWaddling(false);
          isMovingRef.current = false;
          setFacingLeft(pos.x > mouse.x);
          setDirection('side');

          const randomMsg = SPONTANEOUS_MESSAGES[Math.floor(Math.random() * SPONTANEOUS_MESSAGES.length)];
          setApproachMessage(randomMsg);
          playQuackSound(1.15);

          setTimeout(() => {
            if (!isBusyAnticRef.current) return;
            setApproachMessage(null);
            isBusyAnticRef.current = false;
            anticTimerRef.current = setTimeout(runNextAntic, 22000 + Math.random() * 16000);
          }, 3500);
        }, walkDuration * 1000);

      } else if (chosen === 'photo' && photoEls.length > 0) {
        const targetEl = photoEls[Math.floor(Math.random() * photoEls.length)];
        const photoId = Number(targetEl.dataset.photoId);
        const currentSlot = Number(targetEl.dataset.slotIdx || 0);
        if (!photoId) {
          anticTimerRef.current = setTimeout(runNextAntic, 5000);
          return;
        }

        const rect = targetEl.getBoundingClientRect();
        const approachLeft = Math.random() > 0.5;
        const approachX = approachLeft
          ? Math.max(10, rect.left - 60)
          : Math.min(window.innerWidth - 90, rect.right - 20);
        const approachY = Math.max(60, Math.min(rect.top + 20, window.innerHeight - 95));

        const dist = Math.hypot(approachX - pos.x, approachY - pos.y);
        const walkDuration = Math.max(0.45, Math.min(2.0, dist / 210));
        setMoveDuration(walkDuration);

        isBusyAnticRef.current = true;
        isMovingRef.current = true;
        setIsWaddling(true);
        updateDirection(pos.x, pos.y, approachX, approachY);
        setPos({ x: approachX, y: approachY });

        setTimeout(() => {
          if (!isBusyAnticRef.current) return;
          setIsWaddling(false);
          isMovingRef.current = false;
          setFacingLeft(!approachLeft);
          setDirection('side');

          setIsPecking(true);
          targetEl.classList.add('duck-nibbled-item');

          playPeckSound(1.05);
          setTimeout(() => playPeckSound(1.15), 160);
          setTimeout(() => playPeckSound(1.1), 320);

          const crumbX = approachX + (approachLeft ? 70 : 10);
          const crumbY = approachY + 35;
          triggerNibbleCrumbs(crumbX, crumbY);

          setTimeout(() => {
            if (!isBusyAnticRef.current) return;
            setIsPecking(false);
            targetEl.classList.remove('duck-nibbled-item');

            const isMobile = window.innerWidth < 640;
            const validSlots = isMobile
              ? [0, 2, 4, 7, 9, 11]
              : Array.from({ length: 20 }, (_, i) => i);
            const otherSlots = validSlots.filter((s) => s !== currentSlot);
            const newSlot = otherSlots[Math.floor(Math.random() * otherSlots.length)];

            window.dispatchEvent(
              new CustomEvent('duck-move-photo', {
                detail: { photoId, targetSlotIndex: newSlot },
              })
            );

            setQuackBubble('*shove!*');
            playQuackSound(1.2);

            setTimeout(() => {
              if (!isBusyAnticRef.current) return;
              setQuackBubble('QUACK!');
              setTimeout(() => {
                if (!isBusyAnticRef.current) return;
                setQuackBubble(null);
                isBusyAnticRef.current = false;
                anticTimerRef.current = setTimeout(runNextAntic, 22000 + Math.random() * 16000);
              }, 700);
            }, 600);
          }, 750);
        }, walkDuration * 1000);

      } else if (chosen === 'card') {
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.arch-surface, .arch-card, .love-counter-card, h1, h2, h3, button:not([disabled])'
          )
        ).filter((el) => {
          const rect = el.getBoundingClientRect();
          return (
            rect.width > 60 &&
            rect.height > 25 &&
            rect.top >= 60 &&
            rect.bottom <= window.innerHeight - 50 &&
            rect.left >= 0 &&
            rect.right <= window.innerWidth
          );
        });

        if (candidates.length === 0) {
          anticTimerRef.current = setTimeout(runNextAntic, 5000);
          return;
        }

        const targetEl = candidates[Math.floor(Math.random() * candidates.length)];
        const rect = targetEl.getBoundingClientRect();

        const approachLeft = Math.random() > 0.5;
        const approachX = approachLeft
          ? Math.max(10, rect.left - 65)
          : Math.min(window.innerWidth - 90, rect.right - 15);
        const approachY = Math.max(60, Math.min(rect.top + Math.min(rect.height * 0.35, 45), window.innerHeight - 95));

        const dist = Math.hypot(approachX - pos.x, approachY - pos.y);
        const walkDuration = Math.max(0.45, Math.min(2.0, dist / 210));
        setMoveDuration(walkDuration);

        isBusyAnticRef.current = true;
        isMovingRef.current = true;
        setIsWaddling(true);
        updateDirection(pos.x, pos.y, approachX, approachY);
        setPos({ x: approachX, y: approachY });

        setTimeout(() => {
          if (!isBusyAnticRef.current) return;
          setIsWaddling(false);
          isMovingRef.current = false;
          setFacingLeft(!approachLeft);
          setDirection('side');

          setIsPecking(true);
          targetEl.classList.add('duck-nibbled-item');

          playPeckSound(0.95);
          setTimeout(() => playPeckSound(1.05), 150);
          setTimeout(() => playPeckSound(1.0), 300);
          setTimeout(() => playPeckSound(1.15), 450);

          const crumbX = approachX + (approachLeft ? 70 : 10);
          const crumbY = approachY + 35;
          triggerNibbleCrumbs(crumbX, crumbY);
          setQuackBubble('*nom nom!*');

          setTimeout(() => {
            if (!isBusyAnticRef.current) return;
            setIsPecking(false);
            targetEl.classList.remove('duck-nibbled-item');
            setQuackBubble('QUACK!');
            playQuackSound(1.1);

            setTimeout(() => {
              if (!isBusyAnticRef.current) return;
              setQuackBubble(null);
              isBusyAnticRef.current = false;
              anticTimerRef.current = setTimeout(runNextAntic, 22000 + Math.random() * 16000);
            }, 700);
          }, 850);
        }, walkDuration * 1000);

      } else if (chosen === 'nip_cursor') {
        const mouse = lastMousePosRef.current;
        const sneakLeft = mouse.x > pos.x;
        const approachX = sneakLeft
          ? Math.max(10, mouse.x - 70)
          : Math.min(window.innerWidth - 90, mouse.x + 10);
        const approachY = Math.max(60, Math.min(mouse.y - 25, window.innerHeight - 95));

        const dist = Math.hypot(approachX - pos.x, approachY - pos.y);
        const walkDuration = Math.max(0.4, Math.min(1.8, dist / 220));
        setMoveDuration(walkDuration);

        isBusyAnticRef.current = true;
        isMovingRef.current = true;
        setIsWaddling(true);
        updateDirection(pos.x, pos.y, approachX, approachY);
        setPos({ x: approachX, y: approachY });

        setTimeout(() => {
          if (!isBusyAnticRef.current) return;
          setIsWaddling(false);
          isMovingRef.current = false;
          setFacingLeft(!sneakLeft);
          setDirection('side');

          setIsPecking(true);
          playPeckSound(1.15);
          setTimeout(() => playPeckSound(1.25), 150);

          const crumbX = approachX + (sneakLeft ? 70 : 10);
          const crumbY = approachY + 35;
          triggerNibbleCrumbs(crumbX, crumbY);
          setQuackBubble('*nip!*');

          setTimeout(() => {
            if (!isBusyAnticRef.current) return;
            setIsPecking(false);

            // Surprised little hop back
            const hopX = sneakLeft
              ? Math.max(10, approachX - 65)
              : Math.min(window.innerWidth - 90, approachX + 65);
            setMoveDuration(0.3);
            setIsWaddling(true);
            setPos({ x: hopX, y: approachY });

            setQuackBubble('QUACK!');
            playQuackSound(1.25);

            setTimeout(() => {
              setIsWaddling(false);
              setQuackBubble(null);
              isBusyAnticRef.current = false;
              anticTimerRef.current = setTimeout(runNextAntic, 22000 + Math.random() * 16000);
            }, 600);
          }, 450);
        }, walkDuration * 1000);

      } else {
        // Window edge pecking
        isBusyAnticRef.current = true;
        const edges = ['left', 'right', 'bottom', 'top'] as const;
        const edge = edges[Math.floor(Math.random() * edges.length)];

        let edgeX = 8;
        let edgeY = 150;

        if (edge === 'left') {
          edgeX = 6;
          edgeY = 100 + Math.random() * (window.innerHeight - 220);
        } else if (edge === 'right') {
          edgeX = window.innerWidth - 85;
          edgeY = 100 + Math.random() * (window.innerHeight - 220);
        } else if (edge === 'bottom') {
          edgeX = 50 + Math.random() * (window.innerWidth - 150);
          edgeY = window.innerHeight - 85;
        } else {
          edgeX = 50 + Math.random() * (window.innerWidth - 150);
          edgeY = 70;
        }

        const dist = Math.hypot(edgeX - pos.x, edgeY - pos.y);
        const walkDuration = Math.max(0.45, Math.min(2.0, dist / 210));
        setMoveDuration(walkDuration);

        isMovingRef.current = true;
        setIsWaddling(true);
        updateDirection(pos.x, pos.y, edgeX, edgeY);
        setPos({ x: edgeX, y: edgeY });

        setTimeout(() => {
          if (!isBusyAnticRef.current) return;
          setIsWaddling(false);
          isMovingRef.current = false;
          if (edge === 'left') setFacingLeft(true);
          if (edge === 'right') setFacingLeft(false);
          setDirection('side');

          setIsPecking(true);
          setGlassRipple({
            x: edge === 'left' ? 10 : edge === 'right' ? window.innerWidth - 12 : edgeX + 40,
            y: edge === 'top' ? 70 : edge === 'bottom' ? window.innerHeight - 15 : edgeY + 38,
          });

          playGlassTapSound();
          setTimeout(() => playGlassTapSound(), 170);
          setTimeout(() => playGlassTapSound(), 340);
          setQuackBubble('*tap tap!*');

          setTimeout(() => {
            if (!isBusyAnticRef.current) return;
            setIsPecking(false);
            setGlassRipple(null);
            setQuackBubble('QUACK?!');
            playQuackSound(1.15);

            setTimeout(() => {
              if (!isBusyAnticRef.current) return;
              setQuackBubble(null);
              isBusyAnticRef.current = false;
              anticTimerRef.current = setTimeout(runNextAntic, 22000 + Math.random() * 16000);
            }, 700);
          }, 800);
        }, walkDuration * 1000);
      }
    };

    runNextAnticRef.current = runNextAntic;

    // Peaceful initial delay (10-14 seconds after mount)
    anticTimerRef.current = setTimeout(runNextAntic, 10000 + Math.random() * 4000);

    return () => {
      if (anticTimerRef.current) {
        clearTimeout(anticTimerRef.current);
      }
    };
  }, [pos, tourOpen, caughtOpen]);

  // Pointer drag event handlers (enables smooth touch dragging on phones as well as mouse dragging on desktop)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (isBusyAnticRef.current) {
      isBusyAnticRef.current = false;
      setIsPecking(false);
      setQuackBubble(null);
      setApproachMessage(null);
      setGlassRipple(null);
      setNibbleCrumbs([]);
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      hasMoved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const dist = Math.hypot(dx, dy);

    // If moved more than 6px, treat as active drag
    if (dist > 6 || dragStartRef.current.hasMoved) {
      if (!dragStartRef.current.hasMoved) {
        dragStartRef.current.hasMoved = true;
        isDraggingRef.current = true;
        setIsDraggingDuck(true);
        setIsWaddling(true);
        if (approachMessage) {
          setApproachMessage(null);
        }
      }

      const duckEl = duckRef.current;
      const duckWidth = duckEl?.offsetWidth || 80;
      const duckHeight = duckEl?.offsetHeight || 80;
      const padding = 8;
      const maxX = Math.max(10, window.innerWidth - duckWidth - padding);
      const maxY = Math.max(10, window.innerHeight - duckHeight - padding);

      const targetX = Math.max(padding, Math.min(dragStartRef.current.startPosX + dx, maxX));
      const targetY = Math.max(padding, Math.min(dragStartRef.current.startPosY + dy, maxY));

      updateDirection(pos.x, pos.y, targetX, targetY);
      setPos({ x: targetX, y: targetY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const hasMoved = dragStartRef.current.hasMoved;
    dragStartRef.current = null;

    if (hasMoved) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 300);

      setIsDraggingDuck(false);
      setTimeout(() => {
        isDraggingRef.current = false;
        setIsWaddling(false);
        setDirection('side');
      }, 150);

      playQuackSound(1.05);
      setQuackBubble('QUACK!');
      setTimeout(() => setQuackBubble(null), 800);

      // Reschedule next autonomous antic after user finishes moving duck
      if (anticTimerRef.current) clearTimeout(anticTimerRef.current);
      anticTimerRef.current = setTimeout(() => {
        runNextAnticRef.current();
      }, 18000 + Math.random() * 8000);
    } else {
      setIsDraggingDuck(false);
      isDraggingRef.current = false;
    }
  };

  const handleDuckClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (justDraggedRef.current || isDraggingRef.current) return;

    if (isBusyAnticRef.current) {
      isBusyAnticRef.current = false;
      setIsPecking(false);
      setQuackBubble(null);
      setGlassRipple(null);
      setNibbleCrumbs([]);
    }

    playQuackSound(0.95);
    setIsWaddling(true);
    setApproachMessage(null);
    setTimeout(() => {
      setIsWaddling(false);
      setDirection('side');
    }, 450);

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
      {/* Subtle bounce keyframes while walking and pecking */}
      <style>{`
        @keyframes duck-walk-hop {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .duck-walk-hop-anim {
          animation: duck-walk-hop 0.16s infinite ease-in-out;
        }
        @keyframes duck-peck-action {
          0% { transform: translateY(0px) rotate(0deg); }
          22% { transform: translate(10px, 12px) rotate(24deg); }
          40% { transform: translate(2px, 3px) rotate(6deg); }
          62% { transform: translate(14px, 16px) rotate(28deg); }
          80% { transform: translate(3px, 4px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .duck-peck-anim {
          animation: duck-peck-action 0.38s infinite ease-in-out;
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: isWaddling && !isDraggingDuck ? `left ${moveDuration}s linear, top ${moveDuration}s linear` : 'none',
          zIndex: 60,
          touchAction: 'none',
        }}
        className="select-none pointer-events-auto cursor-grab active:cursor-grabbing"
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

          {/* Waddling Hop & Direction Flip Wrapper */}
          <div className={isWaddling ? 'duck-walk-hop-anim' : ''}>
            <div
              style={{
                transform: direction === 'side' && facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
                transformOrigin: 'center bottom',
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
            >
              {/* Pecking animation nested inside direction container so rotation drives beak forward into target */}
              <div
                className={`w-full h-full relative ${isPecking ? 'duck-peck-anim' : ''}`}
                style={{
                  transformOrigin: '35% 85%',
                }}
              >
                {/* Stepping Duck Sprite Frame */}
                <img
                  src={getCurrentDuckImage()}
                  alt="Adult Duck"
                  className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none select-none"
                  draggable={false}
                />

                {/* Dynamic Costume Accessories based on current active tab */}
                {activeTab === 'cooking' && <ChefCostume direction={direction} />}
                {activeTab === 'trips' && <TravelerCostume direction={direction} />}
                {activeTab === 'photos' && <PhotographerCostume direction={direction} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playful bite crumb sparks */}
      {nibbleCrumbs.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {nibbleCrumbs.map((crumb) => (
            <span
              key={crumb.id}
              style={{
                position: 'fixed',
                left: `${crumb.x}px`,
                top: `${crumb.y}px`,
                transform: `translate(${crumb.dx}px, ${crumb.dy}px)`,
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: 0.9,
              }}
              className="w-1.5 h-1.5 rounded-full bg-[#b58c38] shadow-xs"
            />
          ))}
        </div>
      )}

      {/* Glass edge impact ripple */}
      {glassRipple && (
        <div
          style={{
            position: 'fixed',
            left: `${glassRipple.x - 20}px`,
            top: `${glassRipple.y - 20}px`,
            zIndex: 65,
          }}
          className="w-10 h-10 rounded-full border-2 border-[#9c7526]/70 duck-glass-ripple"
        />
      )}
    </>
  );
};
