import React from 'react';
import { PhotoItem } from '../types';

interface CollageBackgroundProps {
  photos?: PhotoItem[];
  onMoveToTab?: (photo: PhotoItem) => void;
}

const POSITION_SLOTS = [
  // Left Gutter Column
  { top: '3%', left: '2%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: -5, anim: 'float-sway-1', duration: 18, delay: -2 },
  { top: '15%', left: '11%', widthClass: 'w-20 sm:w-24 md:w-30', rotate: 4, anim: 'float-sway-2', duration: 22, delay: -8 },
  { top: '29%', left: '1.5%', widthClass: 'w-22 sm:w-28 md:w-34', rotate: -7, anim: 'float-sway-3', duration: 19, delay: -11 },
  { top: '44%', left: '10%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: 5, anim: 'float-sway-1', duration: 21, delay: -3 },
  { top: '59%', left: '2%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: -4, anim: 'float-sway-2', duration: 25, delay: -1 },
  { top: '73%', left: '11%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: 6, anim: 'float-sway-3', duration: 20, delay: -13 },
  { top: '86%', left: '2.5%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -6, anim: 'float-sway-1', duration: 23, delay: -7 },

  // Right Gutter Column
  { top: '4%', left: '88%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: 4, anim: 'float-sway-2', duration: 20, delay: -14 },
  { top: '17%', left: '80%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: -6, anim: 'float-sway-3', duration: 24, delay: -5 },
  { top: '31%', left: '89%', widthClass: 'w-16 sm:w-22 md:w-26', rotate: 5, anim: 'float-sway-1', duration: 23, delay: -16 },
  { top: '45%', left: '81%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: -4, anim: 'float-sway-2', duration: 17, delay: -9 },
  { top: '59%', left: '89%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: 7, anim: 'float-sway-3', duration: 18, delay: -18 },
  { top: '73%', left: '81%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -5, anim: 'float-sway-1', duration: 26, delay: -4 },
  { top: '86%', left: '88%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: 3, anim: 'float-sway-2', duration: 21, delay: -15 },

  // Transitional / Accent Snapshots
  { top: '5%', left: '24%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -3, anim: 'float-sway-3', duration: 23, delay: -7, className: 'hidden sm:block' },
  { top: '6%', left: '70%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: 4, anim: 'float-sway-1', duration: 19, delay: -12, className: 'hidden sm:block' },
  { top: '86%', left: '22%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: 3, anim: 'float-sway-2', duration: 25, delay: -10, className: 'hidden md:block' },
  { top: '86%', left: '72%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: -5, anim: 'float-sway-3', duration: 20, delay: -17, className: 'hidden md:block' },
  { top: '2%', left: '44%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: -2, anim: 'float-sway-1', duration: 22, delay: -5, className: 'hidden lg:block' },
  { top: '88%', left: '48%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: 4, anim: 'float-sway-2', duration: 24, delay: -14, className: 'hidden lg:block' },
];

// Fallback initial photos if API is loading
const FALLBACK_PHOTOS: PhotoItem[] = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    id: i + 1,
    filename: `photo_${num}.jpg`,
    file_url: `/collage/photo_${num}.jpg`,
    caption: `Memory ${num}`,
    in_background: true,
    aspect_ratio: 0.75,
    rotation: POSITION_SLOTS[i % POSITION_SLOTS.length].rotate,
    order_index: i,
    created_at: new Date().toISOString(),
  };
});

export const CollageBackground: React.FC<CollageBackgroundProps> = ({
  photos,
  onMoveToTab,
}) => {
  // If photos list is passed, use photos that have in_background === true; otherwise fallback
  const activePhotos = photos
    ? photos.filter((p) => p.in_background)
    : FALLBACK_PHOTOS;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#f6f4ee]"
      aria-hidden="true"
    >
      <style>{`
        @keyframes float-sway-1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(var(--base-rot));
          }
          33% {
            transform: translate3d(7px, -9px, 0) rotate(calc(var(--base-rot) + 2deg));
          }
          66% {
            transform: translate3d(-6px, 8px, 0) rotate(calc(var(--base-rot) - 1.5deg));
          }
        }

        @keyframes float-sway-2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(var(--base-rot));
          }
          40% {
            transform: translate3d(-8px, -7px, 0) rotate(calc(var(--base-rot) - 2deg));
          }
          75% {
            transform: translate3d(6px, 9px, 0) rotate(calc(var(--base-rot) + 1.8deg));
          }
        }

        @keyframes float-sway-3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(var(--base-rot));
          }
          50% {
            transform: translate3d(8px, 8px, 0) rotate(calc(var(--base-rot) + 2.2deg));
          }
        }

        .scattered-photo-item {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, opacity 0.35s ease;
          will-change: transform;
        }

        .scattered-photo-item:hover {
          animation-play-state: paused !important;
          transform: scale(1.15) rotate(0deg) !important;
          z-index: 30 !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Scattered Memory Snapshot Cards */}
      {activePhotos.map((photo, index) => {
        const slot = POSITION_SLOTS[index % POSITION_SLOTS.length];
        const rot = photo.rotation || slot.rotate;

        return (
          <div
            key={photo.id}
            style={{
              position: 'absolute',
              top: slot.top,
              left: slot.left,
              ['--base-rot' as any]: `${rot}deg`,
              animation: `${slot.anim} ${slot.duration}s ease-in-out infinite`,
              animationDelay: `${slot.delay}s`,
            }}
            className={`group scattered-photo-item pointer-events-auto cursor-pointer opacity-75 sm:opacity-85 hover:opacity-100 ${slot.widthClass} ${slot.className || ''}`}
          >
            <div className="bg-white/95 p-1 sm:p-1.5 pb-2 sm:pb-2.5 rounded-xs shadow-sm hover:shadow-xl border border-stone-300/70 transition-shadow duration-300">
              <img
                src={photo.file_url}
                alt={photo.caption || ''}
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0';
                }}
                className="block w-full h-auto object-contain rounded-[1px] select-none pointer-events-none"
                draggable={false}
              />

              {/* Action Button on Hover: Move photo to Tab (take it out of wallpaper) */}
              {onMoveToTab && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToTab(photo);
                  }}
                  className="mt-1 w-full text-center py-0.5 bg-[#181c24] hover:bg-[#9c7526] text-white text-[9px] font-mono-tech uppercase tracking-wider rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs flex items-center justify-center gap-1"
                  title="Move photo to Photos tab (hide from background)"
                >
                  <span>To Tab</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#f6f4ee]/40 pointer-events-none" />
    </div>
  );
};
