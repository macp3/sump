import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import maciejAvatar from '../assets/Maciej.jpg';
import selinaAvatar from '../assets/Selina.jpg';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('maciej');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError('');
    setIsLoading(true);
    try {
      await login(username.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f4ee]">
      <div className="max-w-sm w-full arch-surface p-8 border border-[#e5e0d4] shadow-md">
        {/* Title: Only SUMP */}
        <div className="text-center mb-8 pb-4 border-b border-[#e5e0d4]">
          <h1 className="text-4xl font-normal text-[#181c24] tracking-widest font-serif-editorial uppercase">
            SUMP
          </h1>
        </div>

        {/* Member Selector with Larger Profile Avatars */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setUsername('maciej');
                setError('');
              }}
              className={`p-3 flex items-center gap-3 transition-all border ${
                username.toLowerCase() === 'maciej'
                  ? 'bg-[#181c24] text-white border-[#181c24] shadow-xs'
                  : 'bg-white text-stone-700 border-[#e5e0d4] hover:border-stone-400'
              }`}
            >
              <img
                src={maciejAvatar}
                alt="Maciej"
                className="w-12 h-12 object-cover border border-white/20"
              />
              <span className="text-sm font-semibold font-serif-editorial">Maciej</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('selina');
                setError('');
              }}
              className={`p-3 flex items-center gap-3 transition-all border ${
                username.toLowerCase() === 'selina'
                  ? 'bg-[#181c24] text-white border-[#181c24] shadow-xs'
                  : 'bg-white text-stone-700 border-[#e5e0d4] hover:border-stone-400'
              }`}
            >
              <img
                src={selinaAvatar}
                alt="Selina"
                className="w-12 h-12 object-cover border border-white/20"
              />
              <span className="text-sm font-semibold font-serif-editorial">Selina</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4 font-light">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-8 pr-8 py-2 bg-white border border-[#e5e0d4] text-[#181c24] text-xs focus:outline-none focus:border-[#b58c38]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-2.5 px-4 font-semibold text-xs text-white bg-[#181c24] hover:bg-[#2c323f] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              'Logging in...'
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d8b46e]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
