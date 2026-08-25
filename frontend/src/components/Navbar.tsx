import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  KeyRound, 
  Menu, 
  X, 
  Layers, 
  CalendarRange 
} from 'lucide-react';
import maciejAvatar from '../assets/Maciej.jpg';
import selinaAvatar from '../assets/Selina.jpg';

interface NavbarProps {
  activeTab: 'dashboard' | 'calendar';
  setActiveTab: (tab: 'dashboard' | 'calendar') => void;
  onOpenPasswordChange: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPasswordChange,
}) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isSelina = user?.username?.toLowerCase().includes('selina') || user?.display_name?.toLowerCase().includes('selina');
  const userPhoto = isSelina ? selinaAvatar : maciejAvatar;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f6f4ee]/95 backdrop-blur-md border-b border-[#e5e0d4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand: JUST "SUMP" */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center cursor-pointer select-none py-2"
        >
          <span className="font-serif-editorial text-2xl sm:text-3xl tracking-widest text-[#181c24] font-medium uppercase hover:text-[#b58c38] transition-colors">
            SUMP
          </span>
        </div>

        {/* Navigation: 01 Overview, 02 Calendar */}
        <nav className="hidden md:flex items-center gap-1 border-l border-r border-[#e5e0d4] px-6 h-full font-mono-tech text-xs uppercase tracking-[0.15em]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 transition-all flex items-center gap-2 relative ${
              activeTab === 'dashboard'
                ? 'text-[#9c7526] font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <span className="text-[10px] text-stone-400">01 /</span>
            Overview
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 transition-all flex items-center gap-2 relative ${
              activeTab === 'calendar'
                ? 'text-[#9c7526] font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <span className="text-[10px] text-stone-400">02 /</span>
            Calendar
            {activeTab === 'calendar' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
            )}
          </button>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-3.5">
          {/* Profile Dropdown with User Photo */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-11 h-11 bg-white border border-[#e5e0d4] hover:border-stone-400 flex items-center justify-center overflow-hidden transition-colors shadow-xs"
              title={user?.display_name || 'Profile'}
            >
              <img
                src={userPhoto}
                alt={user?.display_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e0d4] shadow-xl p-1 z-50 text-xs font-mono-tech animate-in fade-in zoom-in duration-100">
                <div className="px-3 py-3 border-b border-stone-100 mb-1 flex items-center gap-3">
                  <img
                    src={userPhoto}
                    alt={user?.display_name || 'Profile'}
                    className="w-12 h-12 object-cover border border-[#e5e0d4]"
                  />
                  <div>
                    <p className="font-semibold text-stone-900 text-sm font-sans leading-none">{user?.display_name}</p>
                    <p className="text-[10px] text-stone-400 font-mono-tech uppercase tracking-wider mt-1.5">Logged In</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onOpenPasswordChange();
                  }}
                  className="w-full text-left px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center gap-2 transition-colors uppercase tracking-wider text-[11px]"
                >
                  <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                  Change Password
                </button>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors uppercase tracking-wider text-[11px] mt-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-b border-[#e5e0d4] space-y-1 font-mono-tech text-xs uppercase tracking-wider">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 ${
              activeTab === 'dashboard' ? 'bg-[#fcf7ec] text-[#9c7526] border-l-2 border-[#9c7526] font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            01 / Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('calendar');
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 ${
              activeTab === 'calendar' ? 'bg-[#fcf7ec] text-[#9c7526] border-l-2 border-[#9c7526] font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            02 / Calendar
          </button>
        </div>
      )}
    </header>
  );
};
