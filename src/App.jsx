import React from 'react';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-dnd-bg text-slate-200">
      <header className="h-14 border-b border-dnd-border bg-dnd-panel flex items-center px-4">
        <h1 className="text-xl font-bold text-dnd-gold">D&D 5e Spellbook</h1>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/2 border-r border-dnd-border p-4 overflow-y-auto">
          <p>Spell Catalog</p>
        </section>
        <section className="w-1/2 p-4 overflow-y-auto">
          <p>Character Spellbook</p>
        </section>
      </main>
    </div>
  );
}
