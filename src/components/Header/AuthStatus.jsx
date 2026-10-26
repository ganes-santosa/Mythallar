import React, { useState, useRef, useEffect } from 'react';
import { Cloud, CloudCheck, CloudOff, RefreshCw, LogIn, LogOut, ChevronDown, User } from 'lucide-react';

export default function AuthStatus({
  user,
  syncStatus = 'idle', // 'idle' | 'syncing' | 'saved' | 'error' | 'offline'
  onSignIn,
  onSignOut,
  onSyncNow,
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
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel text-slate-200 hover:text-dnd-gold transition-colors text-xs font-medium"
        title="Sign in with Google to sync characters across devices"
        aria-label="Sign in with Google"
      >
        <LogIn size={13} className="text-dnd-gold" />
        <span className="hidden sm:inline">Sign in with Google</span>
        <span className="sm:hidden">Sign in</span>
      </button>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={user.email}
        className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-dnd-panel/60 hover:bg-dnd-panel transition-colors text-xs text-slate-200"
      >
        {syncStatus === 'syncing' ? (
          <RefreshCw size={12} className="text-dnd-gold animate-spin" />
        ) : syncStatus === 'error' ? (
          <CloudOff size={12} className="text-red-400" />
        ) : (
          <Cloud size={12} className="text-emerald-400" />
        )}
        <span className="max-w-[110px] sm:max-w-[140px] truncate font-medium">
          {displayName}
        </span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
