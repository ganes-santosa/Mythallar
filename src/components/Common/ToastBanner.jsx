import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const SWIPE_THRESHOLD = 60;

export default function ToastBanner({ toast, onDismiss, className = '' }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const dragOffsetRef = useRef(0);

  if (!toast) return null;

  const handlePointerDown = (e) => {
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId ?? 0;
    startXRef.current = typeof e.clientX === 'number' ? e.clientX : 0;
    dragOffsetRef.current = 0;
    isDraggingRef.current = true;
    setDragOffset(0);
    setIsDragging(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore in environments where pointer capture is unsupported
      }
    }
  };

  const handlePointerMove = (e) => {
    const pointerId = e.pointerId ?? 0;
    if (!isDraggingRef.current || startXRef.current === null || pointerId !== activePointerIdRef.current) return;
    const currentX = typeof e.clientX === 'number' ? e.clientX : startXRef.current;
    const diff = currentX - startXRef.current;
    dragOffsetRef.current = diff;
    setDragOffset(diff);
  };

  const handlePointerUp = (e) => {
    const pointerId = e.pointerId ?? 0;
    if (pointerId !== activePointerIdRef.current) return;
    const currentX = typeof e.clientX === 'number' ? e.clientX : undefined;
    const finalDiff = (currentX !== undefined && startXRef.current !== null)
      ? (currentX - startXRef.current)
      : dragOffsetRef.current;

    isDraggingRef.current = false;
    setIsDragging(false);
    startXRef.current = null;
    activePointerIdRef.current = null;
    dragOffsetRef.current = 0;

    if (Math.abs(finalDiff) >= SWIPE_THRESHOLD) {
      onDismiss?.();
    } else {
      setDragOffset(0);
    }
  };

  const handlePointerCancel = (e) => {
    const pointerId = e.pointerId ?? 0;
    if (pointerId !== activePointerIdRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    startXRef.current = null;
    activePointerIdRef.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const offsetValue = Number.isFinite(dragOffset) ? Math.abs(dragOffset) : 0;
  const opacity = Math.max(0.2, 1 - offsetValue / 200);

  return (
    <div
      role="status"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        transform: `translateX(${dragOffset}px)`,
        opacity: isDragging ? opacity : 1,
        touchAction: 'pan-y',
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
      }}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold select-none cursor-grab active:cursor-grabbing bg-dnd-card ${className}`}
    >
      {toast.type === 'success' && <CheckCircle2 size={16} data-testid="toast-icon-success" className="text-emerald-400 shrink-0" />}
      {toast.type === 'error' && <AlertCircle size={16} data-testid="toast-icon-error" className="text-red-400 shrink-0" />}
      {(toast.type === 'info' || !toast.type) && <Sparkles size={16} data-testid="toast-icon-info" className="text-dnd-gold shrink-0" />}
      <span className="text-slate-100">{toast.message}</span>
    </div>
  );
}
