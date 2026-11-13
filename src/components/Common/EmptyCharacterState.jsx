import React from 'react';
import { Plus, Upload } from 'lucide-react';

// Single source for the "no character" screen so Spellbook and Sheet stay identical.
export default function EmptyCharacterState({ onCreate, onImport, className = '', children }) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-dnd-card flex items-center justify-center shadow-lg ring-1 ring-white/10 p-2.5">
        <div
          role="img"
          aria-label="Mythallar Logo"
          className="w-11 h-11 bg-dnd-ivory select-none pointer-events-none"
          style={{
            WebkitMaskImage: "url('/mythallar_logo.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: "url('/mythallar_logo.png')",
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-lg font-bold text-dnd-ivory font-display tracking-tight">
          No Character Selected
        </h3>
        <p className="text-xs text-slate-400">
          Begin your journey by creating your first character profile to manage spell slots and maintain your spellbook.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          <Plus size={15} />
          <span>Create First Character</span>
        </button>
        {children}
        <button
          type="button"
          onClick={onImport}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dnd-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold text-xs border border-white/5 transition-all shadow-sm"
        >
          <Upload size={15} />
          <span>Import Character</span>
        </button>
      </div>
    </div>
  );
}
