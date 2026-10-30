import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Palette, Feather } from 'lucide-react';
import {
  THEMES,
  getCustomThemeConfig,
  saveCustomThemeConfig,
  applyTheme,
} from '../../utils/themeService';
import MythallarLogo from '../Common/MythallarLogo';
import { APP_VERSION } from '../../version';

const CUSTOM_COLOR_FIELDS = [
  { key: 'bg', label: 'Background' },
  { key: 'panel', label: 'Panel' },
  { key: 'card', label: 'Card' },
  { key: 'gold', label: 'Accent' },
  { key: 'ivory', label: 'Text' },
  { key: 'border', label: 'Border' },
];

const TEXTURE_OPTIONS = [
  { value: 'none', label: 'None (Solid)' },
  { value: 'celestial', label: 'Celestial Chart' },
  { value: 'stars', label: 'Starfield' },
  { value: 'limewash', label: 'Limewash Plaster' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  onUpdateCustomTheme,
  skipCopying = false,
  onToggleSkipCopying,
}) {
  const [customTheme, setCustomTheme] = useState(() => getCustomThemeConfig());

  useEffect(() => {
    if (isOpen) {
      setCustomTheme(getCustomThemeConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomColorChange = (key, value) => {
    const nextColors = { [key]: value };
    if (key === 'gold') {
      nextColors.goldLight = value;
      nextColors.goldDark = value;
      nextColors.stars = value;
    }
    if (key === 'card') {
      nextColors.hover = value;
    }
    const updated = saveCustomThemeConfig({ colors: nextColors });
    setCustomTheme(updated);
    if (activeThemeId === 'custom') {
      applyTheme('custom');
    }
    if (onUpdateCustomTheme) {
      onUpdateCustomTheme(updated);
    }
  };

  const handleCustomTextureChange = (texture) => {
    const updated = saveCustomThemeConfig({ texture });
    setCustomTheme(updated);
    if (activeThemeId === 'custom') {
      applyTheme('custom');
    }
    if (onUpdateCustomTheme) {
      onUpdateCustomTheme(updated);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-dnd-card rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 flex-shrink-0">
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

        {/* Modal Body: Preferences & Palette Grid */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2 -mx-2">
          {/* Spellbook Preferences */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              <Feather size={13} className="text-dnd-gold" />
              <span>Spellbook Preferences</span>
            </div>

            <div className="p-3 rounded-xl bg-dnd-panel/40 border border-white/5 flex items-center justify-between gap-3">
              <div className="pr-2">
                <label
                  htmlFor="skip-copying-toggle"
                  className="font-bold text-xs sm:text-sm text-dnd-ivory block cursor-pointer"
                >
                  Skip Copying State
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Immediately ready wizard spells, skipping copying state.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                id="skip-copying-toggle"
                aria-checked={skipCopying}
                aria-label="Skip Copying State"
                onClick={() => onToggleSkipCopying?.(!skipCopying)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  skipCopying ? 'bg-dnd-gold' : 'bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    skipCopying ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <Palette size={13} className="text-dnd-gold" />
            <span>Color Palettes</span>
          </div>

          <div
            data-testid="theme-palette-grid"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1"
          >
            {THEMES.map((baseTheme) => {
              const theme = baseTheme.id === 'custom' ? customTheme : baseTheme;
              const isActive = theme.id === activeThemeId;
              const isCustom = theme.id === 'custom';

              return (
                <div
                  key={theme.id}
                  className={isCustom ? 'sm:col-span-2 flex flex-col' : 'flex flex-col'}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTheme(theme.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex flex-col justify-between group ${
                      isActive
                        ? 'bg-dnd-panel/90 shadow-[0_0_16px_rgba(255,255,255,0.08)] ring-1 ring-white/25'
                        : 'bg-dnd-panel/40 hover:bg-dnd-panel/70'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2.5">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-dnd-ivory flex items-center space-x-1.5">
                          {isCustom && <Sliders size={13} className="text-dnd-gold" />}
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

                  {isCustom && isActive && (
                    <div className="mt-2 p-3 rounded-xl bg-dnd-panel/70 ring-1 ring-white/10 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CUSTOM_COLOR_FIELDS.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex items-center justify-between bg-dnd-card/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 cursor-pointer"
                          >
                            <span>{label}</span>
                            <input
                              type="color"
                              aria-label={`Custom ${label} color`}
                              value={customTheme.colors[key] || '#000000'}
                              onChange={(e) => handleCustomColorChange(key, e.target.value)}
                              className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <label
                          htmlFor="custom-texture-select"
                          className="text-xs text-slate-300 font-medium"
                        >
                          Background Texture
                        </label>
                        <select
                          id="custom-texture-select"
                          aria-label="Custom Background Texture"
                          value={customTheme.texture || 'none'}
                          onChange={(e) => handleCustomTextureChange(e.target.value)}
                          className="bg-dnd-card text-xs text-slate-200 rounded-lg px-2.5 py-1.5 ring-1 ring-white/10 focus:outline-none"
                        >
                          {TEXTURE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with version info */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-400">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
