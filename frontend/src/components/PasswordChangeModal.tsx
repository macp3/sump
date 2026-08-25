import React, { useState } from 'react';
import { api } from '../api/client';
import { X, KeyRound, Check, AlertCircle } from 'lucide-react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#e5e0d4] p-6 md:p-8 max-w-md w-full shadow-2xl relative font-mono-tech text-xs">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9c7526] block mb-1 font-semibold">
            [ SECURITY // CREDENTIALS ]
          </span>
          <h3 className="text-2xl font-normal text-[#181c24] tracking-tight font-serif-editorial">
            Update Authentication Key
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-6 font-light font-sans">
          Enter current authentication key and establish a new secure credential.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 mb-4">
            <Check className="w-4 h-4 shrink-0" />
            <span>Authentication key successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-1.5 font-semibold">
              Current Key
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-1.5 font-semibold">
              New Key
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-1.5 font-semibold">
              Confirm New Key
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#e5e0d4] uppercase tracking-wider">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-white bg-[#181c24] hover:bg-[#2c323f] transition-all"
            >
              {isSubmitting ? 'Updating...' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
