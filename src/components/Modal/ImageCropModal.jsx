import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

export default function ImageCropModal({ isOpen, imageSrc, onClose, onApplyCrop }) {
  const [cropMode, setCropMode] = useState('3:4'); // '3:4' | '1:1' | 'custom'
  const [cropH, setCropH] = useState(280); // 210 to 280
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({ isResizing: false, edge: null, startY: 0, startH: 280 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const cropBoxW = 210;
  const cropBoxH = cropH;

  // Read natural image dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 384,
        height: img.naturalHeight || 512,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleImageLoad = (e) => {
    const nw = e.target.naturalWidth || e.target.width;
    const nh = e.target.naturalHeight || e.target.height;
    if (nw && nh) {
      setNaturalSize({ width: nw, height: nh });
    }
  };

  // Base sizing so 1.0x zoom exactly covers the crop frame
  const nw = naturalSize.width || 384;
  const nh = naturalSize.height || 512;
  const coverScale = Math.max(cropBoxW / nw, cropBoxH / nh);
  const baseWidth = Math.round(nw * coverScale);
  const baseHeight = Math.round(nh * coverScale);

  // Clamp pan so image always fully covers the crop frame without black borders
  const clampPan = useCallback((p, currentZoom, bWidth, bHeight, boxW, boxH) => {
    const curW = (bWidth || boxW) * currentZoom;
    const curH = (bHeight || boxH) * currentZoom;
    const maxX = Math.max(0, (curW - boxW) / 2);
    const maxY = Math.max(0, (curH - boxH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, p.x)),
      y: Math.min(maxY, Math.max(-maxY, p.y)),
    };
  }, []);

  // Reset controls when a new image is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setCropMode('3:4');
      setCropH(280);
    }
  }, [isOpen, imageSrc]);

  const handleModeChange = (mode) => {
    setCropMode(mode);
    if (mode === '3:4') {
      setCropH(280);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    } else if (mode === '1:1') {
      setCropH(210);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // In jsdom or browsers where pointer capture is not supported
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const rawPan = {
      x: dragStart.panX + dx,
      y: dragStart.panY + dy,
    };
    setPan(clampPan(rawPan, zoom, baseWidth, baseHeight, cropBoxW, cropBoxH));
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleEdgePointerDown = (edge, e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    const clientY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
    resizeRef.current = {
      isResizing: true,
      edge,
      startY: clientY,
      startH: cropH,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // In jsdom or unsupported environments
    }
  };

  const handleEdgePointerMove = (e) => {
    if (!resizeRef.current.isResizing || !resizeRef.current.edge) return;
    const clientY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
    const deltaY = clientY - resizeRef.current.startY;
    const sign = resizeRef.current.edge === 'bottom' ? 1 : -1;
    const nextH = Math.min(280, Math.max(210, Math.round(resizeRef.current.startH + deltaY * 2 * sign)));
    setCropH(nextH);

    const nextCoverScale = Math.max(cropBoxW / nw, nextH / nh);
    const nextBaseW = Math.round(nw * nextCoverScale);
    const nextBaseH = Math.round(nh * nextCoverScale);
    setPan((prevPan) => clampPan(prevPan, zoom, nextBaseW, nextBaseH, cropBoxW, nextH));
  };

  const handleEdgePointerUp = (e) => {
    e.stopPropagation();
    resizeRef.current.isResizing = false;
    setIsResizing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleEdgeKeyDown = (edge, e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = 10;
      const expand = (edge === 'bottom' && e.key === 'ArrowDown') || (edge === 'top' && e.key === 'ArrowUp');
      const nextH = Math.min(280, Math.max(210, cropH + (expand ? step : -step)));
      setCropH(nextH);
    }
  };

  const handleZoomChange = (nextZoom) => {
    const z = Math.min(3, Math.max(1, nextZoom));
    setZoom(z);
    setPan((prevPan) => clampPan(prevPan, z, baseWidth, baseHeight, cropBoxW, cropBoxH));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    handleZoomChange(+(zoom + delta).toFixed(2));
  };

  const handleApply = useCallback(async () => {
    if (!imageSrc) {
      onClose?.();
      return;
    }

    try {
      // Create offscreen canvas for cropping
      const canvas = document.createElement('canvas');
      const targetW = 384;
      const targetH = Math.round(384 * (cropH / cropBoxW));
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (ctx && imgRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const currentCropW = cropBoxW;
        const currentCropH = cropH;

        // Visual crop box center relative to container
        const cropCenterX = containerRect.width / 2;
        const cropCenterY = containerRect.height / 2;

        // Image rendered dimensions with zoom applied
        const img = imgRef.current;
        const currentBaseW = baseWidth || img.offsetWidth || img.naturalWidth || 384;
        const currentBaseH = baseHeight || img.offsetHeight || img.naturalHeight || 512;
        const renderedW = currentBaseW * zoom;
        const renderedH = currentBaseH * zoom;

        // Image center is offset by pan
        const imgCenterX = containerRect.width / 2 + pan.x;
        const imgCenterY = containerRect.height / 2 + pan.y;

        // Top-left of image on screen
        const imgLeft = imgCenterX - renderedW / 2;
        const imgTop = imgCenterY - renderedH / 2;

        // Crop box top-left on screen
        const cropLeft = cropCenterX - currentCropW / 2;
        const cropTop = cropCenterY - currentCropH / 2;

        // Position of image relative to crop frame
        const dxOnCrop = imgLeft - cropLeft;
        const dyOnCrop = imgTop - cropTop;

        // Output scale factor from on-screen crop box to canvas
        const outputScale = targetW / currentCropW;

        // Fill background in case image is zoomed out past frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, targetW, targetH);

        // Draw image onto canvas
        ctx.drawImage(
          img,
          dxOnCrop * outputScale,
          dyOnCrop * outputScale,
          renderedW * outputScale,
          renderedH * outputScale
        );
      }

      const croppedDataUrl = canvas.toDataURL('image/webp', 0.85);
      const finalUrl = (await compressImageFile(croppedDataUrl, 256, 0.85)) || croppedDataUrl;
      onApplyCrop?.(finalUrl);
      onClose?.();
    } catch (err) {
      console.error('Failed to crop portrait image', err);
      // Fallback: pass raw imageSrc through compressor
      const fallbackUrl = (await compressImageFile(imageSrc, 256, 0.85)) || imageSrc;
      onApplyCrop?.(fallbackUrl);
      onClose?.();
    }
  }, [imageSrc, cropH, cropBoxW, zoom, pan, baseWidth, baseHeight, onApplyCrop, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-dnd-card rounded-2xl shadow-2xl overflow-hidden border border-white/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Crop size={16} className="text-dnd-gold shrink-0" />
            <h3 id="image-crop-modal-title" className="text-sm font-bold text-slate-100 font-display">
              Crop Character Portrait
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport Area */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className={`relative w-full h-72 sm:h-80 bg-black/80 overflow-hidden flex items-center justify-center select-none touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Draggable & Scalable Image */}
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Portrait Crop Preview"
              onLoad={handleImageLoad}
              style={{
                width: baseWidth ? `${baseWidth}px` : 'auto',
                height: baseHeight ? `${baseHeight}px` : 'auto',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              className="max-w-none max-h-none pointer-events-none select-none transition-none"
            />
          )}

          {/* Centered Framing Guide with Dimmed Mask */}
          <div
            data-testid="crop-framing-box"
            style={{ width: `${cropBoxW}px`, height: `${cropH}px` }}
            className={`pointer-events-none absolute ${
              isResizing ? 'transition-none' : 'transition-all duration-150'
            } rounded-lg ring-2 ring-dnd-gold shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]`}
          >
            {/* Rule of thirds grid lines inside crop frame */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Custom Mode Symmetric Drag Handles */}
            {cropMode === 'custom' && (
              <>
                <div
                  role="separator"
                  tabIndex={0}
                  aria-label="Adjust top crop boundary"
                  aria-orientation="horizontal"
                  onPointerDown={(e) => handleEdgePointerDown('top', e)}
                  onPointerMove={handleEdgePointerMove}
                  onPointerUp={handleEdgePointerUp}
                  onPointerCancel={handleEdgePointerUp}
                  onKeyDown={(e) => handleEdgeKeyDown('top', e)}
                  className="pointer-events-auto absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 flex items-center justify-center cursor-ns-resize z-30 group touch-none outline-none focus-visible:ring-2 focus-visible:ring-dnd-gold rounded-full"
                >
                  <div className="w-8 h-1.5 rounded-full bg-dnd-gold shadow ring-1 ring-black/40 group-hover:scale-110 group-focus-visible:scale-110 transition-transform" />
                </div>

                <div
                  role="separator"
                  tabIndex={0}
                  aria-label="Adjust bottom crop boundary"
                  aria-orientation="horizontal"
                  onPointerDown={(e) => handleEdgePointerDown('bottom', e)}
                  onPointerMove={handleEdgePointerMove}
                  onPointerUp={handleEdgePointerUp}
                  onPointerCancel={handleEdgePointerUp}
                  onKeyDown={(e) => handleEdgeKeyDown('bottom', e)}
                  className="pointer-events-auto absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-6 flex items-center justify-center cursor-ns-resize z-30 group touch-none outline-none focus-visible:ring-2 focus-visible:ring-dnd-gold rounded-full"
                >
                  <div className="w-8 h-1.5 rounded-full bg-dnd-gold shadow ring-1 ring-black/40 group-hover:scale-110 group-focus-visible:scale-110 transition-transform" />
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded pointer-events-none">
            {cropMode === 'custom'
              ? 'Drag handles to adjust height • Drag image to pan'
              : 'Drag to pan • Scroll to zoom'}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-dnd-panel space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Aspect Ratio Buttons */}
            <div className="flex items-center space-x-1 bg-dnd-card/80 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleModeChange('3:4')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  cropMode === '3:4'
                    ? 'bg-dnd-gold/20 text-dnd-gold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3:4 Portrait
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('1:1')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  cropMode === '1:1'
                    ? 'bg-dnd-gold/20 text-dnd-gold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1:1 Square
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('custom')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  cropMode === 'custom'
                    ? 'bg-dnd-gold/20 text-dnd-gold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center space-x-2 flex-1 min-w-[160px] max-w-xs">
              <ZoomOut size={14} className="text-slate-400 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                aria-label="Zoom"
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-full accent-dnd-gold cursor-pointer h-1.5 bg-dnd-card rounded-lg appearance-none"
              />
              <ZoomIn size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Check size={14} />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
