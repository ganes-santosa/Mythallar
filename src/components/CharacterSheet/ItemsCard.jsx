import React, { useState } from 'react';
import { Sparkles, Plus, X, Trash2 } from 'lucide-react';

export default function ItemsCard({ items = [], maxAttunement = 3, onUpdateItems }) {
  const [isAttuneMode, setIsAttuneMode] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // New item form state
  const [name, setName] = useState('');
  const [requiresAttunement, setRequiresAttunement] = useState(false);
  const [category, setCategory] = useState('magic'); // 'magic' | 'consumable' | 'general'
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const safeItems = Array.isArray(items) ? items : [];
  const attunedCount = safeItems.filter((i) => i.requiresAttunement && i.attuned).length;

  const toggleAttune = (itemId) => {
    if (!isAttuneMode) return;
    const updated = safeItems.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        attuned: !item.attuned,
      };
    });
    onUpdateItems?.(updated);
  };

  const handleDeleteItem = (itemId, e) => {
    e.stopPropagation();
    const updated = safeItems.filter((i) => i.id !== itemId);
    onUpdateItems?.(updated);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem = {
      id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      requiresAttunement: Boolean(requiresAttunement),
      attuned: false,
      category,
      quantity: Math.max(1, Number(quantity) || 1),
      note: note.trim(),
    };

    onUpdateItems?.([...safeItems, newItem]);
    setName('');
    setRequiresAttunement(false);
    setCategory('magic');
    setQuantity(1);
    setNote('');
    setIsAdding(false);
  };

  const magicItems = safeItems.filter((i) => i.category === 'magic' || i.requiresAttunement);
  const consumables = safeItems.filter((i) => i.category === 'consumable');
  const generalItems = safeItems.filter(
    (i) => i.category === 'general' || (!i.category && !i.requiresAttunement)
  );

  return (
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2.5">
      {/* Header with Attunement mode toggle & Slot counter */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-dnd-pewter uppercase tracking-wider">
            Items & Inventory
          </span>
        </div>

        {/* Attunement Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-dnd-panel border border-white/5 text-xs">
            <span className="text-slate-400">Attuned:</span>
            <span
              className={`font-bold ${
                attunedCount > maxAttunement ? 'text-red-400' : 'text-dnd-gold'
              }`}
            >
              {attunedCount} / {maxAttunement}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAttuneMode(!isAttuneMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
              isAttuneMode
                ? 'bg-dnd-gold text-slate-950 border-dnd-gold-light shadow-sm'
                : 'bg-dnd-panel hover:bg-dnd-hover text-dnd-gold border-dnd-gold/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAttuneMode ? 'bg-slate-950 animate-pulse' : 'bg-dnd-gold'
              }`}
            />
            <span>{isAttuneMode ? 'Finish Attuning' : 'Manage Attunement'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-2 py-1 rounded bg-dnd-panel hover:bg-dnd-hover text-slate-300 text-xs font-medium"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Attunement Mode Banner */}
      {isAttuneMode && (
        <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <span>⚡ Attunement Mode Active: Click any attunable item chip below to attune/unattune.</span>
          <button
            type="button"
            onClick={() => setIsAttuneMode(false)}
            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-[11px]"
          >
            Done
          </button>
        </div>
      )}

      {/* Inline Add Item Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveItem}
          className="p-2.5 rounded bg-dnd-panel/95 border border-dnd-gold/30 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">Add New Item</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <label htmlFor="itm-name" className="block text-[10px] text-slate-400 mb-0.5">
                Item Name
              </label>
              <input
                id="itm-name"
                aria-label="Item Name"
                type="text"
                placeholder="e.g. Ring of Spell Storing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
              />
            </div>

            <div>
              <label htmlFor="itm-cat" className="block text-[10px] text-slate-400 mb-0.5">
                Category
              </label>
              <select
                id="itm-cat"
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
              >
                <option value="magic">Magic Item</option>
                <option value="consumable">Consumable / Scroll</option>
                <option value="general">Mundane / General</option>
              </select>
            </div>

            <div>
              <label htmlFor="itm-qty" className="block text-[10px] text-slate-400 mb-0.5">
                Quantity
              </label>
              <input
                id="itm-qty"
                aria-label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-slate-300 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                aria-label="Requires Attunement"
                checked={requiresAttunement}
                onChange={(e) => setRequiresAttunement(e.target.checked)}
                className="rounded border-white/20 bg-black/30 text-dnd-gold focus:ring-0"
              />
              <span>Requires Attunement</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
              >
                Save Item
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Section 1: Magic Items & Attunables */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Magic Items & Curios</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {magicItems.map((item) => {
            const isAttuned = Boolean(item.attuned && item.requiresAttunement);
            return (
              <div
                key={item.id}
                data-testid={`item-chip-${item.id}`}
                onClick={() => toggleAttune(item.id)}
                className={`group relative flex items-center pr-2 py-1 rounded-md text-xs select-none border transition-all ${
                  item.requiresAttunement ? 'pl-3.5 cursor-pointer' : 'px-2.5'
                } ${
                  isAttuned
                    ? 'bg-dnd-panel/90 text-amber-300 border-white/10 ring-1 ring-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                    : 'bg-dnd-panel/70 text-slate-300 border-white/5 hover:bg-dnd-hover'
                }`}
              >
                {/* Glowing Bookmark Strip (Spellbook prepared card style) */}
                {item.requiresAttunement && (
                  <div
                    data-testid="attunement-bookmark-strip"
                    aria-hidden="true"
                    className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md transition-all duration-300 ${
                      isAttuned
                        ? 'bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]'
                        : 'bg-white/10'
                    }`}
                  />
                )}

                <span className="font-semibold">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="ml-1 text-[10px] text-slate-400 font-bold">
                    x{item.quantity}
                  </span>
                )}
                {item.requiresAttunement && (
                  <span
                    className={`ml-1.5 text-[9px] px-1 py-0.2 rounded font-medium ${
                      isAttuned
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {isAttuned ? 'Attuned' : '(attunable)'}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 ml-1.5 text-slate-500 hover:text-red-400 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Consumables & Scrolls */}
      {consumables.length > 0 && (
        <div className="space-y-1.5 pt-1.5 border-t border-white/5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Potions, Scrolls & Charges</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {consumables.map((item) => (
              <div
                key={item.id}
                data-testid={`item-chip-${item.id}`}
                className="group flex items-center px-2.5 py-1 rounded-md bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200"
              >
                <span className="font-medium">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="ml-1.5 px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                    x{item.quantity}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 ml-1.5 text-slate-400 hover:text-red-400 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Mundane & General Items */}
      {generalItems.length > 0 && (
        <div className="space-y-1.5 pt-1.5 border-t border-white/5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>General Inventory & Valuables</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {generalItems.map((item) => (
              <div
                key={item.id}
                data-testid={`item-chip-${item.id}`}
                className="group flex items-center px-2 py-0.5 rounded bg-dnd-panel/60 border border-white/5 text-[11px] text-slate-300"
              >
                <span>{item.name}</span>
                {item.quantity > 1 && (
                  <span className="ml-1 font-bold text-slate-400">x{item.quantity}</span>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 ml-1 text-slate-500 hover:text-red-400 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
