import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import maciejAvatar from '../assets/Maciej.jpg';
import selinaAvatar from '../assets/Selina.jpg';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, uploadAvatar, removeAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const isSelina = user?.username?.toLowerCase().includes('selina') || user?.display_name?.toLowerCase().includes('selina');
  const defaultAvatar = isSelina ? selinaAvatar : maciejAvatar;
  const currentAvatar = previewUrl || user?.avatar_url || defaultAvatar;
  const hasCustomAvatar = !!user?.avatar_url;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await uploadAvatar(selectedFile);
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await removeAvatar();
      setPreviewUrl(null);
      setSelectedFile(null);
      setSuccess('Restored default portrait photo');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to restore default photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e5e0d4] p-6 md:p-8 max-w-md w-full shadow-2xl relative font-mono-tech text-xs select-none">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9c7526] block mb-1 font-semibold">
            [ IDENTITY // AVATAR ]
          </span>
          <h3 className="text-2xl font-normal text-[#181c24] tracking-tight font-serif-editorial">
            Profile Picture
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-6 font-light font-sans leading-relaxed">
          Update your personal portrait or upload a photograph from your device.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-4 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Live Photo Preview */}
        <div className="flex flex-col items-center justify-center py-3 mb-5 border-b border-[#e5e0d4]/70">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#b58c38] shadow-md bg-stone-100 flex items-center justify-center">
              <img
                src={currentAvatar}
                alt={user?.display_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] uppercase tracking-wider font-semibold cursor-pointer gap-1"
            >
              <Camera className="w-5 h-5 text-[#fcd34d]" />
              <span>Browse</span>
            </button>
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-[11px] font-sans text-stone-700 font-medium">
              {user?.display_name}
            </span>
            <span className="block text-[9px] text-stone-400 uppercase tracking-widest mt-0.5">
              {selectedFile ? 'New Image Selected' : hasCustomAvatar ? 'Custom Photo Active' : 'Default Portrait'}
            </span>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed p-4 text-center cursor-pointer transition-all duration-150 mb-5 ${
            isDraggingOver
              ? 'border-[#9c7526] bg-[#fbf7ee]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-[#d5cfc0] bg-[#fcfbf7] hover:border-[#b58c38] hover:bg-[#fbf7ee]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className={`w-5 h-5 mx-auto mb-1.5 ${selectedFile ? 'text-emerald-600' : 'text-stone-400'}`} />
          {selectedFile ? (
            <p className="text-xs text-stone-800 font-sans truncate font-medium">
              {selectedFile.name}
            </p>
          ) : (
            <>
              <p className="text-xs text-stone-700 font-sans">
                Click to browse or drop photograph here
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Supports JPG, PNG, WebP up to 10 MB
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-[#e5e0d4]/80">
          {hasCustomAvatar && !selectedFile && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleResetToDefault}
              className="w-full sm:w-auto px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-300 text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Default</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:ml-auto justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-stone-500 hover:text-stone-800 text-[11px] uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>

            {selectedFile && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-[11px] uppercase tracking-wider font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Photo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
