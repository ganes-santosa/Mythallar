import React from 'react';
import { X, Check, Sliders, Palette, Sparkles } from 'lucide-react';
import { THEMES } from '../../utils/themeService';
import MythallarLogo from '../Common/MythallarLogo';
import { APP_VERSION } from '../../version';

export default function SettingsModal({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-dnd-card rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-dnd-panel/80 flex items-center justify-center">
              <MythallarLogo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                Settings & Themes
              </h3>
              <p className="text-xs text-slate-400">
                Personalize your spellbook interface
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-slate-400 hover:text-dnd-ivory rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Palette Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Palette size={13} className="text-dnd-gold" />
            <span>Color Palettes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEMES.map((theme) => {
              const isActive = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between group ${
                    isActive
                      ? 'bg-dnd-panel/90 shadow-[0_0_16px_rgba(255,255,255,0.08)] ring-1 ring-white/25'
                      : 'bg-dnd-panel/40 hover:bg-dnd-panel/70'
                  }`}
                >
                  <div className="flex items-start justify-between w-full mb-2.5">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-dnd-ivory flex items-center space-x-1.5">
                        <span>{theme.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-dnd-gold" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {theme.subtitle}
                      </p>
                    </div>

                    {isActive && (
                      <span className="p-1 rounded-full bg-dnd-gold text-slate-950">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Swatch preview dots */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    {theme.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full shadow-inner ring-1 ring-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with version info */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-400">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
