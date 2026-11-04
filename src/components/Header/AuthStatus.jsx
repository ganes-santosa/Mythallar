import React, { useState, useRef, useEffect } from 'react';
import { Cloud, CloudCheck, CloudOff, RefreshCw, LogIn, LogOut, ChevronDown, User } from 'lucide-react';

export default function AuthStatus({
  user,
  syncStatus = 'idle', // 'idle' | 'syncing' | 'saved' | 'error' | 'offline'
  onSignIn,
  onSignOut,
  onSyncNow,
  isCompact = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className={`flex items-center px-1.5 py-0.5 rounded-md bg-dnd-card/70 hover:bg-dnd-card text-slate-200 hover:text-dnd-gold transition-all text-xs font-normal border border-white/5 cursor-pointer shrink-0 ${className}`}
        title="Sign in with Google to sync characters across devices"
        aria-label="Sign in with Google"
      >
        <LogIn size={12} className="text-dnd-gold flex-shrink-0" />
        <span
          className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden inline-block ${
            isCompact
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[130px] opacity-100 ml-1.5'
          }`}
        >
          <span className="hidden sm:inline">Sign in with Google</span>
          <span className="sm:hidden">Sign in</span>
        </span>
      </button>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={user.email}
        className="flex items-center px-1.5 py-0.5 rounded-md bg-dnd-card/70 hover:bg-dnd-card transition-all text-xs font-normal text-slate-200 border border-white/5 cursor-pointer"
      >
        {syncStatus === 'syncing' ? (
          <RefreshCw size={12} className="text-dnd-gold animate-spin flex-shrink-0" />
        ) : syncStatus === 'error' ? (
          <CloudOff size={12} className="text-red-400 flex-shrink-0" />
        ) : (
          <Cloud size={12} className="text-emerald-400 flex-shrink-0" />
        )}
        <span
          className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden inline-block ${
            isCompact
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[110px] sm:max-w-[140px] opacity-100 ml-1.5 truncate'
          }`}
        >
          {displayName}
        </span>
        <span
          className={`transition-all duration-300 ease-in-out overflow-hidden inline-flex items-center ${
            isCompact
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[20px] opacity-100 ml-1'
          }`}
        >
          <ChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-52 rounded-lg bg-dnd-card ring-1 ring-white/10 shadow-xl py-1.5 px-1 text-xs text-slate-200 animate-in fade-in">
          <div className="px-2 py-1 border-b border-white/5 mb-1">
            <p className="text-[11px] text-slate-400 truncate">Signed in as</p>
            <p className="font-semibold text-slate-100 truncate">{user.email}</p>
          </div>

          {onSyncNow && (
            <button
              type="button"
              onClick={() => {
                onSyncNow();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-2 py-1 rounded hover:bg-white/5 text-left transition-colors text-slate-300 hover:text-dnd-gold"
            >
              <RefreshCw size={12} className="mr-2 text-slate-400" />
              Sync Now
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onSignOut();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-2 py-1 rounded hover:bg-red-950/40 text-left transition-colors text-red-400 hover:text-red-300"
          >
            <LogOut size={12} className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
