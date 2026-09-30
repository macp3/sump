import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Eye, 
  EyeOff, 
  Trash2, 
  Maximize2, 
  X, 
  Plus, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { PhotoItem } from '../types';
import { api } from '../api/client';
import { format, parseISO } from 'date-fns';

interface PhotosPageProps {
  photos: PhotoItem[];
  onPhotosChange: () => void;
  onToggleBackground: (photo: PhotoItem) => Promise<void>;
}

export const PhotosPage: React.FC<PhotosPageProps> = ({
  photos,
  onPhotosChange,
  onToggleBackground,
}) => {
  const [filter, setFilter] = useState<'all' | 'background' | 'tab'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Upload modal state
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [addToBackground, setAddToBackground] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counts
  const totalCount = photos.length;
  const inBackgroundCount = photos.filter((p) => p.in_background).length;
  const inTabCount = photos.filter((p) => !p.in_background).length;

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    if (filter === 'background' && !p.in_background) return false;
    if (filter === 'tab' && p.in_background) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaption = p.caption?.toLowerCase().includes(q);
      const matchName = p.original_name?.toLowerCase().includes(q) || p.filename?.toLowerCase().includes(q);
      if (!matchCaption && !matchName) return false;
    }
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileToUpload(file);
    setUploadError('');
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setUploadError('Please choose a photo file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      await api.uploadPhoto(fileToUpload, addToBackground, caption.trim() || undefined);
      setIsUploadModalOpen(false);
      setFileToUpload(null);
      setFilePreviewUrl(null);
      setCaption('');
      setAddToBackground(true);
      onPhotosChange();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this photograph from the album?')) {
      return;
    }
    try {
      await api.deletePhoto(id);
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
      onPhotosChange();
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo');
    }
  };

  // Lightbox navigation
  const currentPhotoIndex = selectedPhoto ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) : -1;
  const hasPrev = currentPhotoIndex > 0;
  const hasNext = currentPhotoIndex >= 0 && currentPhotoIndex < filteredPhotos.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1]);
    }
  };

  // Drag and drop reordering state
  const [draggedPhotoId, setDraggedPhotoId] = useState<number | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<number | null>(null);

  const handleCardDragStart = (e: React.DragEvent, id: number) => {
    setDraggedPhotoId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedPhotoId && draggedPhotoId !== targetId && dragOverPhotoId !== targetId) {
      setDragOverPhotoId(targetId);
    }
  };

  const handleCardDragLeave = (e: React.DragEvent, targetId: number) => {
    if (dragOverPhotoId === targetId) {
      setDragOverPhotoId(null);
    }
  };

  const handleCardDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverPhotoId(null);
    if (!draggedPhotoId || draggedPhotoId === targetId) return;

    const sourceIdx = photos.findIndex((p) => p.id === draggedPhotoId);
    const targetIdx = photos.findIndex((p) => p.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return;

    try {
      await api.updatePhoto(draggedPhotoId, { order_index: targetIdx });
      onPhotosChange();
    } catch (err) {
      console.error('Failed to reorder photo:', err);
    } finally {
      setDraggedPhotoId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="arch-surface p-6 sm:p-8 border border-[#e5e0d4] shadow-xs relative">
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#9c7526] font-semibold">
              [ 05 // PHOTOGRAPHY & MEMORIES ]
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#181c24] font-medium tracking-tight">
              Our Visual Memoir
            </h1>
          </div>

          {/* Action: Upload Photo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFileToUpload(null);
                setFilePreviewUrl(null);
                setCaption('');
                setUploadError('');
                setIsUploadModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-all shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Add from Computer</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-[#e5e0d4]">
          <div className="p-3 bg-[#fcfbf7] border border-[#e5e0d4] flex items-center justify-between">
            <span className="text-xs font-mono-tech uppercase text-stone-500 tracking-wider">
              Total Photographs
            </span>
            <span className="text-lg font-serif-editorial font-semibold text-[#181c24]">
              {totalCount}
            </span>
          </div>
          <div className="p-3 bg-[#fcfbf7] border border-[#e5e0d4] flex items-center justify-between">
            <span className="text-xs font-mono-tech uppercase text-[#9c7526] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Floating in Wallpaper
            </span>
            <span className="text-lg font-serif-editorial font-semibold text-[#9c7526]">
              {inBackgroundCount}
            </span>
          </div>
          <div className="p-3 bg-[#fcfbf7] border border-[#e5e0d4] flex items-center justify-between">
            <span className="text-xs font-mono-tech uppercase text-stone-500 tracking-wider">
              Stored in Tab Only
            </span>
            <span className="text-lg font-serif-editorial font-semibold text-stone-700">
              {inTabCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-[#e5e0d4] pb-2 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all border ${
              filter === 'all'
                ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            All Photos ({totalCount})
          </button>
          <button
            onClick={() => setFilter('background')}
            className={`px-3.5 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all border ${
              filter === 'background'
                ? 'bg-[#9c7526] text-white border-[#9c7526] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            In Wallpaper ({inBackgroundCount})
          </button>
          <button
            onClick={() => setFilter('tab')}
            className={`px-3.5 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all border ${
              filter === 'tab'
                ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            In Tab Only ({inTabCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search photographs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-[#e5e0d4] text-xs font-mono-tech text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9c7526]"
          />
        </div>
      </div>

      {/* 3. Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="arch-surface p-12 text-center border border-dashed border-[#e5e0d4] space-y-3">
          <ImageIcon className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-serif-editorial text-stone-600 text-lg">
            No photographs found matching this view.
          </p>
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-mono-tech uppercase text-[#9c7526] hover:underline tracking-wider"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleCardDragStart(e, photo.id)}
              onDragOver={(e) => handleCardDragOver(e, photo.id)}
              onDragLeave={(e) => handleCardDragLeave(e, photo.id)}
              onDrop={(e) => handleCardDrop(e, photo.id)}
              onDragEnd={() => {
                setDraggedPhotoId(null);
                setDragOverPhotoId(null);
              }}
              className={`group arch-surface p-2 sm:p-2.5 pb-3 border border-[#e5e0d4] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                dragOverPhotoId === photo.id
                  ? 'translate-x-3.5 scale-95 border-[#9c7526] ring-2 ring-[#9c7526]/30 shadow-md'
                  : ''
              } ${
                draggedPhotoId === photo.id ? 'opacity-30 scale-90 border-dashed border-stone-400' : ''
              }`}
            >
              <div>
                {/* Photo Thumbnail Container */}
                <div
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-[3/4] bg-stone-100/70 border border-stone-200/60 overflow-hidden cursor-pointer mb-2.5 flex items-center justify-center group-hover:border-stone-400 transition-colors"
                >
                  <img
                    src={photo.file_url}
                    alt={photo.caption || photo.original_name || 'Photograph'}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-1.5 right-1.5">
                    {photo.in_background ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono-tech uppercase font-bold tracking-wider text-[#8c691f] bg-[#fbf7ee]/95 border border-[#d8c08a] shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#9c7526]" />
                        <span>In Wallpaper</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono-tech uppercase font-medium tracking-wider text-stone-500 bg-white/95 border border-stone-300 shadow-xs">
                        In Tab Only
                      </span>
                    )}
                  </div>

                  {/* Hover Inspect Icon */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 bg-white/90 rounded-full shadow-md text-stone-800">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Caption / Title */}
                <div className="px-0.5 mb-2">
                  <p className="text-xs font-serif-editorial text-[#181c24] font-medium line-clamp-1">
                    {photo.caption || photo.original_name || photo.filename}
                  </p>
                  <p className="text-[10px] font-mono-tech text-stone-400 mt-0.5">
                    {photo.created_at ? format(parseISO(photo.created_at), 'dd MMM yyyy') : 'Archived'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#e5e0d4]/80 flex items-center justify-between gap-1.5">
                {photo.in_background ? (
                  <button
                    onClick={() => onToggleBackground(photo)}
                    className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono-tech uppercase tracking-wider rounded flex items-center justify-center gap-1 transition-colors border border-stone-200"
                    title="Remove from floating background (keep stored in tab only)"
                  >
                    <EyeOff className="w-3 h-3 text-stone-500" />
                    <span className="truncate">To Tab Only</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleBackground(photo)}
                    className="flex-1 py-1 px-2 bg-[#181c24] hover:bg-[#b58c38] text-white text-[10px] font-mono-tech uppercase tracking-wider rounded flex items-center justify-center gap-1 transition-colors font-semibold shadow-xs"
                    title="Display in floating background wallpaper"
                  >
                    <Sparkles className="w-3 h-3 text-[#fcd34d]" />
                    <span className="truncate">To Wallpaper</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleDeletePhoto(photo.id, e)}
                  className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Delete photograph"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Upload Photograph Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full arch-surface p-6 sm:p-8 border border-[#e5e0d4] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e0d4] mb-5">
              <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#9c7526] font-semibold">
                [ ADD PHOTOGRAPH ]
              </span>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* File Picker Zone */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif,.heic"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {filePreviewUrl ? (
                  <div className="relative aspect-[4/3] bg-stone-100 border border-[#e5e0d4] rounded-sm overflow-hidden flex items-center justify-center group">
                    <img
                      src={filePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFileToUpload(null);
                        setFilePreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full shadow-md transition-colors"
                      title="Choose different photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-[#9c7526] rounded-sm p-6 text-center cursor-pointer transition-colors bg-[#fdfbf7]"
                  >
                    <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="font-serif-editorial text-lg text-stone-800 font-medium">
                      Select photo from computer
                    </p>
                    <p className="text-[10px] font-mono-tech uppercase text-stone-500 tracking-wider mt-1">
                      JPG, PNG, WEBP, GIF, HEIC
                    </p>
                  </div>
                )}
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-mono-tech uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                  Memory Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset in Positano, evening walk..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfbf7] border border-[#e5e0d4] text-xs font-serif-editorial text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              {/* Checkbox: Add to background */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addToBackground}
                  onChange={(e) => setAddToBackground(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9c7526] focus:ring-[#9c7526] border-stone-300"
                />
                <span className="text-xs font-mono-tech text-stone-700">
                  Float immediately in atmospheric wallpaper
                </span>
              </label>

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono-tech">
                  {uploadError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-mono-tech uppercase tracking-wider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !fileToUpload}
                  className="px-5 py-2 bg-[#181c24] hover:bg-[#2c323f] disabled:opacity-50 text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-all shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Snapshot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors z-10"
              title="Previous photo"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow */}
          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors z-10"
              title="Next photo"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Photo Display Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-3 sm:p-4 pb-6 rounded-xs shadow-2xl max-w-4xl max-h-[90vh] flex flex-col items-center border border-stone-200 animate-in zoom-in-95 duration-200"
          >
            <div className="max-h-[72vh] overflow-hidden flex items-center justify-center bg-stone-900/5">
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.caption || 'Full view'}
                className="max-h-[72vh] max-w-full object-contain"
              />
            </div>

            <div className="w-full flex items-center justify-between pt-3 mt-3 border-t border-stone-200 px-2">
              <div>
                <p className="font-serif-editorial text-lg text-[#181c24] font-medium">
                  {selectedPhoto.caption || selectedPhoto.original_name || selectedPhoto.filename}
                </p>
                <p className="text-[10px] font-mono-tech text-stone-400">
                  {selectedPhoto.created_at ? format(parseISO(selectedPhoto.created_at), 'MMMM dd, yyyy') : 'Archived'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleBackground(selectedPhoto)}
                  className={`px-3 py-1.5 text-[10px] font-mono-tech uppercase tracking-wider rounded font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedPhoto.in_background
                      ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                      : 'bg-[#181c24] hover:bg-[#b58c38] text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{selectedPhoto.in_background ? 'Remove from Wallpaper' : 'Put in Wallpaper'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
