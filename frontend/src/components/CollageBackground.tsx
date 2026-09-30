import React from 'react';

const COLLAGE_PHOTOS = [
  '/collage/photo_01.jpg',
  '/collage/photo_02.jpg',
  '/collage/photo_03.jpg',
  '/collage/photo_04.jpg',
  '/collage/photo_05.jpg',
  '/collage/photo_06.jpg',
  '/collage/photo_07.jpg',
  '/collage/photo_08.jpg',
  '/collage/photo_09.jpg',
  '/collage/photo_10.jpg',
  '/collage/photo_11.jpg',
  '/collage/photo_12.jpg',
  '/collage/photo_13.jpg',
  '/collage/photo_14.jpg',
  '/collage/photo_15.jpg',
  '/collage/photo_16.jpg',
  '/collage/photo_17.jpg',
  '/collage/photo_18.jpg',
  '/collage/photo_19.jpg',
  '/collage/photo_20.jpg',
];

export const CollageBackground: React.FC = () => {
  // Repeating array ensures full coverage across tall or ultrawide screens
  const displayPhotos = [...COLLAGE_PHOTOS, ...COLLAGE_PHOTOS];

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Photo Mosaic Grid */}
      <div className="absolute -inset-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3 p-4 opacity-[0.09] filter contrast-[1.08] saturate-[0.85] brightness-[1.02]">
        {displayPhotos.map((src, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-md overflow-hidden bg-stone-200/40 shadow-2xs"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Atmospheric Atelier Paper Tone Overlay */}
      <div className="absolute inset-0 bg-[#f6f4ee]/70 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#f6f4ee]/30 to-[#f6f4ee]/80" />
    </div>
  );
};
