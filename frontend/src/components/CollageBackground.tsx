import React from 'react';

interface PhotoItem {
  id: string;
  src: string;
  top: string;
  left: string;
  widthClass: string;
  rotate: number;
  anim: 'float-sway-1' | 'float-sway-2' | 'float-sway-3';
  duration: number;
  delay: number;
  className?: string;
}

const SCATTERED_PHOTOS: PhotoItem[] = [
  // Left Gutter Column
  { id: '01', src: '/collage/photo_01.jpg', top: '3%', left: '2%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: -5, anim: 'float-sway-1', duration: 18, delay: -2 },
  { id: '02', src: '/collage/photo_02.jpg', top: '15%', left: '11%', widthClass: 'w-20 sm:w-24 md:w-30', rotate: 4, anim: 'float-sway-2', duration: 22, delay: -8 },
  { id: '05', src: '/collage/photo_05.jpg', top: '29%', left: '1.5%', widthClass: 'w-22 sm:w-28 md:w-34', rotate: -7, anim: 'float-sway-3', duration: 19, delay: -11 },
  { id: '06', src: '/collage/photo_06.jpg', top: '44%', left: '10%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: 5, anim: 'float-sway-1', duration: 21, delay: -3 }, // landscape
  { id: '09', src: '/collage/photo_09.jpg', top: '59%', left: '2%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: -4, anim: 'float-sway-2', duration: 25, delay: -1 },
  { id: '10', src: '/collage/photo_10.jpg', top: '73%', left: '11%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: 6, anim: 'float-sway-3', duration: 20, delay: -13 },
  { id: '11', src: '/collage/photo_11.jpg', top: '86%', left: '2.5%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -6, anim: 'float-sway-1', duration: 23, delay: -7 },

  // Right Gutter Column
  { id: '03', src: '/collage/photo_03.jpg', top: '4%', left: '88%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: 4, anim: 'float-sway-2', duration: 20, delay: -14 },
  { id: '04', src: '/collage/photo_04.jpg', top: '17%', left: '80%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: -6, anim: 'float-sway-3', duration: 24, delay: -5 },
  { id: '07', src: '/collage/photo_07.jpg', top: '31%', left: '89%', widthClass: 'w-16 sm:w-22 md:w-26', rotate: 5, anim: 'float-sway-1', duration: 23, delay: -16 },
  { id: '08', src: '/collage/photo_08.jpg', top: '45%', left: '81%', widthClass: 'w-18 sm:w-24 md:w-28', rotate: -4, anim: 'float-sway-2', duration: 17, delay: -9 },
  { id: '12', src: '/collage/photo_12.jpg', top: '59%', left: '89%', widthClass: 'w-20 sm:w-26 md:w-32', rotate: 7, anim: 'float-sway-3', duration: 18, delay: -18 },
  { id: '13', src: '/collage/photo_13.jpg', top: '73%', left: '81%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -5, anim: 'float-sway-1', duration: 26, delay: -4 },
  { id: '14', src: '/collage/photo_14.jpg', top: '86%', left: '88%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: 3, anim: 'float-sway-2', duration: 21, delay: -15 },

  // Transitional / Accent Snapshots (visible on wider screens)
  { id: '15', src: '/collage/photo_15.jpg', top: '5%', left: '24%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: -3, anim: 'float-sway-3', duration: 23, delay: -7, className: 'hidden sm:block' },
  { id: '16', src: '/collage/photo_16.jpg', top: '6%', left: '70%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: 4, anim: 'float-sway-1', duration: 19, delay: -12, className: 'hidden sm:block' },
  { id: '17', src: '/collage/photo_17.jpg', top: '86%', left: '22%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: 3, anim: 'float-sway-2', duration: 25, delay: -10, className: 'hidden md:block' }, // landscape
  { id: '18', src: '/collage/photo_18.jpg', top: '86%', left: '72%', widthClass: 'w-22 sm:w-28 md:w-32', rotate: -5, anim: 'float-sway-3', duration: 20, delay: -17, className: 'hidden md:block' }, // square
  { id: '19', src: '/collage/photo_19.jpg', top: '2%', left: '44%', widthClass: 'w-24 sm:w-30 md:w-36', rotate: -2, anim: 'float-sway-1', duration: 22, delay: -5, className: 'hidden lg:block' }, // landscape
  { id: '20', src: '/collage/photo_20.jpg', top: '88%', left: '48%', widthClass: 'w-20 sm:w-26 md:w-30', rotate: 4, anim: 'float-sway-2', duration: 24, delay: -14, className: 'hidden lg:block' },
];

export const CollageBackground: React.FC = () => {
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
      {SCATTERED_PHOTOS.map((photo) => (
        <div
          key={photo.id}
          style={{
            position: 'absolute',
            top: photo.top,
            left: photo.left,
            ['--base-rot' as any]: `${photo.rotate}deg`,
            animation: `${photo.anim} ${photo.duration}s ease-in-out infinite`,
            animationDelay: `${photo.delay}s`,
          }}
          className={`scattered-photo-item pointer-events-auto cursor-pointer opacity-75 sm:opacity-85 hover:opacity-100 ${photo.widthClass} ${photo.className || ''}`}
        >
          <div className="bg-white/95 p-1 sm:p-1.5 pb-2.5 sm:pb-3 rounded-xs shadow-sm hover:shadow-xl border border-stone-300/70 transition-shadow duration-300">
            <img
              src={photo.src}
              alt=""
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0';
              }}
              className="block w-full h-auto object-contain rounded-[1px] select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      ))}

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#f6f4ee]/40 pointer-events-none" />
    </div>
  );
};
