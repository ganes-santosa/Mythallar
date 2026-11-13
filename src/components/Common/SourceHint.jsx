import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

// ponytail: static map; add a code here when update-spells brings a new source (unknown codes fall back to the code itself)
export const SOURCE_NAMES = {
  PHB: "Player's Handbook (2014)",
  XPHB: "Player's Handbook (2024)",
  XGE: "Xanathar's Guide to Everything",
  TCE: "Tasha's Cauldron of Everything",
  AAG: "Astral Adventurer's Guide",
  AI: 'Acquisitions Incorporated',
  'AitFR-AVT': 'Adventures in the Forgotten Realms: A Verdant Tomb',
  AU: 'Unearthed Arcana (third-party)',
  UA: 'Unearthed Arcana (third-party)',
  BMT: 'The Book of Many Things',
  EFA: 'Eberron: Forge of the Artificer',
  EGW: "Explorer's Guide to Wildemount",
  FRHoF: 'Forgotten Realms: Heroes of Faerûn',
  FTD: "Fizban's Treasury of Dragons",
  GGR: "Guildmasters' Guide to Ravnica",
  IDRotF: 'Icewind Dale: Rime of the Frostmaiden',
  LLK: 'Lost Laboratory of Kwalish',
  SatO: 'Sigil and the Outlands',
  SCC: 'Strixhaven: A Curriculum of Chaos',
  WoW: 'World of Warcraft',
  Homebrew: 'Homebrew',
  Custom: 'Homebrew',
};

const POPUP_W = 224; // matches w-56

// ponytail: portaled + fixed so the expanded spell card's overflow clipping can't cut it; closes on scroll/resize instead of tracking
export default function SourceHint({ source }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const code = source || 'PHB';

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e) => {
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos]);

  const toggle = (e) => {
    e.stopPropagation();
    if (pos) return setPos(null);
    const r = btnRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POPUP_W - 8));
    setPos({ left, top: r.bottom + 6 });
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-dnd-gold font-semibold">{code}</span>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Full name of source ${code}`}
        title="Show full source name"
        onClick={toggle}
        className="p-0.5 text-slate-400 hover:text-dnd-gold transition-colors"
      >
        <HelpCircle size={11} />
      </button>
      {pos &&
        createPortal(
          <div
            ref={popRef}
            style={{ position: 'fixed', left: pos.left, top: pos.top, width: POPUP_W }}
            className="z-[60] max-w-[calc(100vw-1rem)] p-2.5 rounded-lg bg-dnd-card shadow-xl text-[11px] text-slate-200 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5">
              <span className="font-semibold text-dnd-gold">Source</span>
              <button type="button" aria-label="Close source name" onClick={() => setPos(null)}>
                <X size={11} />
              </button>
            </div>
            <div className="font-semibold text-slate-200">{code}</div>
            <p className="text-slate-400">{SOURCE_NAMES[code] || code}</p>
          </div>,
          document.body
        )}
    </span>
  );
}
