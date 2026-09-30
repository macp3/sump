import React, { useState, useRef, useEffect } from 'react';
import { PhotoItem } from '../types';
import { api } from '../api/client';

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

const isSlotVisible = (slotIdx: number, width: number) => {
  if (slotIdx < 14) return true;
  if (slotIdx < 16) return width >= 640;
  if (slotIdx < 18) return width >= 768;
  return width >= 1024;
};

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
  const activePhotos = photos
    ? photos.filter((p) => p.in_background)
    : FALLBACK_PHOTOS;

  // Maps photo.id -> assigned slotIndex in POSITION_SLOTS
  const [photoSlotMap, setPhotoSlotMap] = useState<Record<number, number>>({});
  // Temporary drag displacement offsets during pointer drag
  const [dragOffsets, setDragOffsets] = useState<Record<number, { x: number; y: number }>>({});
  // Dynamic proximity repulsion offsets on neighboring photos
  const [repelOffsets, setRepelOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);

  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dragStartRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    sourceSlotIndex: number;
    pointerId: number;
    itemStartRect: DOMRect;
  } | null>(null);

  // Initialize and synchronize slot assignments for all active photos
  useEffect(() => {
    setPhotoSlotMap((prev) => {
      const next = { ...prev };
      const taken = new Set(Object.values(next));

      activePhotos.forEach((photo, idx) => {
        if (next[photo.id] === undefined) {
          let desired = (photo.order_index ?? idx) % POSITION_SLOTS.length;
          while (taken.has(desired) && taken.size < POSITION_SLOTS.length) {
            desired = (desired + 1) % POSITION_SLOTS.length;
          }
          next[photo.id] = desired;
          taken.add(desired);
        }
      });
      return next;
    });
  }, [activePhotos]);

  const handlePointerDown = (photoId: number, e: React.PointerEvent<HTMLDivElement>) => {
    // If clicked on action button (e.g. "To Tab"), let button handle it
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const el = itemRefs.current.get(photoId);
    const startRect = el ? el.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
    const currentSlotIndex = photoSlotMap[photoId] ?? 0;

    dragStartRef.current = {
      id: photoId,
      startX: e.clientX,
      startY: e.clientY,
      sourceSlotIndex: currentSlotIndex,
      pointerId: e.pointerId,
      itemStartRect: startRect,
    };
    setDraggingId(photoId);
    setHoveredSlotIndex(currentSlotIndex);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const { id, startX, startY, sourceSlotIndex, itemStartRect } = dragStartRef.current;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Update dragged photo offset
    setDragOffsets((prev) => ({
      ...prev,
      [id]: { x: deltaX, y: deltaY },
    }));

    // Calculate current center of dragged photo
    const currentCenterX = itemStartRect.left + itemStartRect.width / 2 + deltaX;
    const currentCenterY = itemStartRect.top + itemStartRect.height / 2 + deltaY;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let bestSlotIndex = sourceSlotIndex;
    let minSlotDist = Infinity;

    POSITION_SLOTS.forEach((slot, slotIdx) => {
      if (!isSlotVisible(slotIdx, winW)) return;

      const slotLeftPx = (parseFloat(slot.left) / 100) * winW + (itemStartRect.width / 2);
      const slotTopPx = (parseFloat(slot.top) / 100) * winH + (itemStartRect.height / 2);

      const dist = Math.hypot(currentCenterX - slotLeftPx, currentCenterY - slotTopPx);
      if (dist < minSlotDist) {
        minSlotDist = dist;
        bestSlotIndex = slotIdx;
      }
    });

    setHoveredSlotIndex(bestSlotIndex);

    // Calculate fluid repulsion on other active photos
    const REPEL_RADIUS = 240;
    const MAX_PUSH = 90;
    const newRepels: Record<number, { x: number; y: number }> = {};

    activePhotos.forEach((other) => {
      if (other.id === id) return;
      const otherEl = itemRefs.current.get(other.id);
      if (!otherEl) return;

      const otherRect = otherEl.getBoundingClientRect();
      const otherCurrentRepel = repelOffsets[other.id] || { x: 0, y: 0 };
      const otherBaseCenterX = otherRect.left + otherRect.width / 2 - otherCurrentRepel.x;
      const otherBaseCenterY = otherRect.top + otherRect.height / 2 - otherCurrentRepel.y;

      const otherSlot = photoSlotMap[other.id];

      // If other photo occupies the hovered target slot, push it towards source slot as preview swap
      if (otherSlot === bestSlotIndex && bestSlotIndex !== sourceSlotIndex) {
        const srcSlot = POSITION_SLOTS[sourceSlotIndex % POSITION_SLOTS.length];
        const srcCenterX = (parseFloat(srcSlot.left) / 100) * winW + (otherRect.width / 2);
        const srcCenterY = (parseFloat(srcSlot.top) / 100) * winH + (otherRect.height / 2);

        const toSrcX = srcCenterX - otherBaseCenterX;
        const toSrcY = srcCenterY - otherBaseCenterY;
        const toSrcDist = Math.hypot(toSrcX, toSrcY);
        const previewPush = Math.min(75, toSrcDist * 0.45);
        const angle = toSrcDist === 0 ? 0 : Math.atan2(toSrcY, toSrcX);

        newRepels[other.id] = {
          x: Math.round(Math.cos(angle) * previewPush),
          y: Math.round(Math.sin(angle) * previewPush),
        };
        return;
      }

      // Otherwise standard radial repulsion
      const vx = otherBaseCenterX - currentCenterX;
      const vy = otherBaseCenterY - currentCenterY;
      const dist = Math.hypot(vx, vy);

      if (dist < REPEL_RADIUS) {
        const norm = dist / REPEL_RADIUS;
        const factor = Math.cos(norm * (Math.PI / 2));
        const force = factor * MAX_PUSH;
        const angle = dist === 0 ? 0 : Math.atan2(vy, vx);

        newRepels[other.id] = {
          x: Math.round(Math.cos(angle) * force),
          y: Math.round(Math.sin(angle) * force),
        };
      }
    });

    setRepelOffsets(newRepels);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const { id, startX, startY, sourceSlotIndex, itemStartRect, pointerId } = dragStartRef.current;

    try {
      e.currentTarget.releasePointerCapture(pointerId);
    } catch {}

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const currentCenterX = itemStartRect.left + itemStartRect.width / 2 + deltaX;
    const currentCenterY = itemStartRect.top + itemStartRect.height / 2 + deltaY;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let targetSlotIndex = sourceSlotIndex;
    let minSlotDist = Infinity;

    POSITION_SLOTS.forEach((slot, slotIdx) => {
      if (!isSlotVisible(slotIdx, winW)) return;

      const slotLeftPx = (parseFloat(slot.left) / 100) * winW + (itemStartRect.width / 2);
      const slotTopPx = (parseFloat(slot.top) / 100) * winH + (itemStartRect.height / 2);

      const dist = Math.hypot(currentCenterX - slotLeftPx, currentCenterY - slotTopPx);
      if (dist < minSlotDist) {
        minSlotDist = dist;
        targetSlotIndex = slotIdx;
      }
    });

    const srcSlot = POSITION_SLOTS[sourceSlotIndex % POSITION_SLOTS.length];
    const tgtSlot = POSITION_SLOTS[targetSlotIndex % POSITION_SLOTS.length];

    const srcSlotX = (parseFloat(srcSlot.left) / 100) * winW;
    const srcSlotY = (parseFloat(srcSlot.top) / 100) * winH;

    const tgtSlotX = (parseFloat(tgtSlot.left) / 100) * winW;
    const tgtSlotY = (parseFloat(tgtSlot.top) / 100) * winH;

    const releaseScreenX = srcSlotX + deltaX;
    const releaseScreenY = srcSlotY + deltaY;

    // Find if another photo currently occupies targetSlotIndex
    const displacedPhoto = activePhotos.find(
      (p) => p.id !== id && (photoSlotMap[p.id] ?? -1) === targetSlotIndex
    );

    // Update slot assignments
    setPhotoSlotMap((prev) => {
      const next = { ...prev };
      next[id] = targetSlotIndex;
      if (displacedPhoto) {
        next[displacedPhoto.id] = sourceSlotIndex;
      }
      return next;
    });

    // Landing offset relative to target slot so the card starts exactly where released
    const landingOffsetX = releaseScreenX - tgtSlotX;
    const landingOffsetY = releaseScreenY - tgtSlotY;

    const nextOffsets: Record<number, { x: number; y: number }> = {
      [id]: { x: landingOffsetX, y: landingOffsetY },
    };

    if (displacedPhoto) {
      // Displaced photo starts from its old location relative to its new slot
      nextOffsets[displacedPhoto.id] = {
        x: tgtSlotX - srcSlotX,
        y: tgtSlotY - srcSlotY,
      };
    }

    setDragOffsets(nextOffsets);
    setDraggingId(null);
    setHoveredSlotIndex(null);
    setRepelOffsets({});
    dragStartRef.current = null;

    // Double RAF ensures browser renders the starting position before gliding to (0, 0)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDragOffsets({});
      });
    });

    // Persist new ordering to backend API
    if (targetSlotIndex !== sourceSlotIndex) {
      try {
        api.updatePhoto(id, { order_index: targetSlotIndex }).catch(() => {});
        if (displacedPhoto) {
          api.updatePhoto(displacedPhoto.id, { order_index: sourceSlotIndex }).catch(() => {});
        }
      } catch {}
    }
  };

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
          will-change: transform;
        }

        .scattered-photo-item:hover:not(.is-dragging):not(.is-repelled) {
          z-index: 30 !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Ghost Target Slot Indicator while Dragging */}
      {draggingId !== null && hoveredSlotIndex !== null && (
        <div
          style={{
            position: 'absolute',
            top: POSITION_SLOTS[hoveredSlotIndex % POSITION_SLOTS.length].top,
            left: POSITION_SLOTS[hoveredSlotIndex % POSITION_SLOTS.length].left,
            transform: `rotate(${POSITION_SLOTS[hoveredSlotIndex % POSITION_SLOTS.length].rotate}deg)`,
            transition: 'all 0.25s ease-out',
          }}
          className={`pointer-events-none z-10 ${
            POSITION_SLOTS[hoveredSlotIndex % POSITION_SLOTS.length].widthClass
          }`}
        >
          <div className="border-2 border-dashed border-[#b58c38]/70 bg-[#b58c38]/10 rounded-xs aspect-3/4 flex items-center justify-center shadow-inner">
            <span className="text-[9px] uppercase tracking-widest font-mono text-[#b58c38] font-bold">
              Slot {hoveredSlotIndex + 1}
            </span>
          </div>
        </div>
      )}

      {/* Scattered Memory Snapshot Cards */}
      {activePhotos.map((photo, index) => {
        const slotIdx = photoSlotMap[photo.id] ?? (photo.order_index ?? index) % POSITION_SLOTS.length;
        const slot = POSITION_SLOTS[slotIdx % POSITION_SLOTS.length];
        const rot = photo.rotation || slot.rotate;

        const isDragging = draggingId === photo.id;
        const userOffset = dragOffsets[photo.id] || { x: 0, y: 0 };
        const repel = repelOffsets[photo.id] || { x: 0, y: 0 };

        const totalX = userOffset.x + (isDragging ? 0 : repel.x);
        const totalY = userOffset.y + (isDragging ? 0 : repel.y);

        return (
          <div
            key={photo.id}
            ref={(el) => {
              if (el) itemRefs.current.set(photo.id, el);
              else itemRefs.current.delete(photo.id);
            }}
            onPointerDown={(e) => handlePointerDown(photo.id, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute',
              top: slot.top,
              left: slot.left,
              transform: `translate3d(${totalX}px, ${totalY}px, 0)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.45s cubic-bezier(0.18, 0.9, 0.28, 1.15)',
              zIndex: isDragging ? 50 : (repel.x !== 0 || repel.y !== 0 ? 25 : 10),
              touchAction: 'none',
            }}
            className={`group scattered-photo-item pointer-events-auto cursor-grab active:cursor-grabbing opacity-80 sm:opacity-90 hover:opacity-100 ${
              isDragging ? 'is-dragging scale-105 !opacity-100' : ''
            } ${repel.x !== 0 || repel.y !== 0 ? 'is-repelled' : ''} ${slot.widthClass} ${slot.className || ''}`}
          >
            {/* Inner Floating Sway Wrapper */}
            <div
              style={{
                ['--base-rot' as any]: `${rot}deg`,
                animation: isDragging ? 'none' : `${slot.anim} ${slot.duration}s ease-in-out infinite`,
                animationDelay: `${slot.delay}s`,
                transform: isDragging ? 'scale(1.08) rotate(0deg)' : undefined,
                transition: isDragging ? 'transform 0.2s ease' : 'none',
              }}
            >
              <div
                className={`bg-white/95 p-1 sm:p-1.5 pb-2 sm:pb-2.5 rounded-xs shadow-sm hover:shadow-xl border border-stone-300/70 transition-all duration-300 ${
                  isDragging ? 'shadow-2xl border-[#b58c38] ring-2 ring-[#b58c38]/40' : ''
                }`}
              >
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
                {onMoveToTab && !isDragging && (
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
          </div>
        );
      })}

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#f6f4ee]/40 pointer-events-none" />
    </div>
  );
};
