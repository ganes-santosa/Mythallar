import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, RotateCcw, Award, GripVertical, Pencil, Trash2 } from 'lucide-react';
import useAccordionMount from '../../hooks/useAccordionMount';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';
import useClickOutside from '../../hooks/useClickOutside';
import { getLineBucket, getColorConfig, ColorDropdown, RESOURCE_COLORS } from './ItemsCard';

export function RearrangeIcon({ size = 13, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M42.3,3A2,2,0,0,0,40,5V8.9A22,22,0,0,0,7.9,9H6a2,2,0,0,0-2,2V21a2,2,0,0,0,2,2H16a2,2,0,0,0,2-2V11a2,2,0,0,0-2-2H14.1A17.8,17.8,0,0,1,24,6a18,18,0,0,1,13.4,6H33.1A2.1,2.1,0,0,0,31,13.7,2,2,0,0,0,33,16h9a2,2,0,0,0,2-2V5.1A2.1,2.1,0,0,0,42.3,3ZM14,19H8V13h6Z" />
      <path d="M42,27H32a2,2,0,0,0-2,2V39a1.8,1.8,0,0,0,.8,1.6A17.2,17.2,0,0,1,24,42a18,18,0,0,1-13.4-6h4.3A2.1,2.1,0,0,0,17,34.3,2,2,0,0,0,15,32H6a2,2,0,0,0-2,2v8.9A2.1,2.1,0,0,0,5.7,45,2,2,0,0,0,8,43V39.1A21.9,21.9,0,0,0,37.9,41H42a2,2,0,0,0,2-2V29A2,2,0,0,0,42,27Zm-8,4h6v6H34Z" />
    </svg>
  );
}

export function AirplaneHelix45degIcon({ size = 16, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.1207 14.1213C15.2922 12.9497 15.2922 11.0503 14.1207 9.87868C12.9491 8.70711 11.0496 8.70711 9.87803 9.87868C8.70646 11.0503 8.70646 12.9497 9.87803 14.1213C11.0496 15.2929 12.9491 15.2929 14.1207 14.1213Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9.87868 9.87863C9.87868 9.87863 7.07642 9.88782 5.63604 8.46441C4.22749 7.05444 2.77156 5.67063 4.22183 4.22177C5.59998 2.84504 7.03117 4.20692 8.46447 5.63599C9.8702 7.03747 9.87868 9.87863 9.87868 9.87863Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M14.1214 9.87868C14.1214 9.87868 14.1122 7.07642 15.5356 5.63604C16.9456 4.22749 18.3294 2.77156 19.7782 4.22183C21.155 5.59998 19.7931 7.03117 18.364 8.46447C16.9625 9.8702 14.1214 9.87868 14.1214 9.87868Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9.87863 14.1213C9.87863 14.1213 9.88782 16.9236 8.46441 18.364C7.05444 19.7725 5.67063 21.2284 4.22177 19.7782C2.84504 18.4 4.20692 16.9688 5.63599 15.5355C7.03747 14.1298 9.87863 14.1213 9.87863 14.1213Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M14.1213 14.1214C14.1213 14.1214 16.9236 14.1122 18.364 15.5356C19.7725 16.9456 21.2284 18.3294 19.7782 19.7782C18.4 21.155 16.9688 19.7931 15.5355 18.364C14.1298 16.9625 14.1213 14.1214 14.1213 14.1214Z" />
    </svg>
  );
}

function ResourceDeleteButton({ resourceName, onDelete }) {
  const { armed, handleClick } = useTwoClickConfirm(onDelete);

  return (
    <button
      type="button"
      aria-label={armed ? `Click again to delete ${resourceName}` : `Delete ${resourceName}`}
      title={armed ? `Click again to delete ${resourceName}` : `Delete ${resourceName}`}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
        armed
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-400 hover:text-red-400 bg-dnd-panel/70'
      }`}
    >
      <Trash2 size={12} className="inline mr-1" />
      <span>Delete</span>
    </button>
  );
}

function ResourceEditForm({
  formRef,
  resource,
  editName,
  setEditName,
  editMax,
  setEditMax,
  editReset,
  setEditReset,
  editColor,
  setEditColor,
  isColorMenuOpen,
  setIsColorMenuOpen,
  colorDropdownRef,
  editNote,
  setEditNote,
  editNameError,
  setEditNameError,
  onCancel,
  onSave,
  onDelete,
}) {
  const editBucket = getLineBucket(editNote);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSave}
      data-testid="resource-edit-form"
      className="p-3 rounded-lg bg-dnd-card space-y-2.5 text-xs shadow-sm ring-1 ring-dnd-gold/30"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-dnd-gold text-[11px]">
          Edit {resource.name}
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel editing"
          className="text-slate-400 hover:text-white"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <label htmlFor={resource ? `edit-res-name-${resource.id}` : 'edit-res-name'} className="block text-[10px] text-slate-400">
              Resource Name
            </label>
            {editNameError && (
              <span className="text-[9px] text-red-400 font-semibold">Name required</span>
            )}
          </div>
          <input
            id={resource ? `edit-res-name-${resource.id}` : 'edit-res-name'}
            aria-label="Edit Resource Name"
            type="text"
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              if (editNameError) setEditNameError(false);
            }}
            className={`w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none transition-colors h-[26px] ${
              editNameError
                ? 'border border-red-500/60 ring-1 ring-red-500/40'
                : 'focus:ring-1 focus:ring-white/20'
            }`}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="w-16">
            <label htmlFor={resource ? `edit-res-max-${resource.id}` : 'edit-res-max'} className="block text-[10px] text-slate-400 mb-0.5 text-center">
              Max Uses
            </label>
            <input
              id={resource ? `edit-res-max-${resource.id}` : 'edit-res-max'}
              aria-label="Edit Max Uses"
              type="number"
              min="1"
              value={editMax}
              onChange={(e) => setEditMax(e.target.value)}
              className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
            />
          </div>

          <div className="w-28">
            <label htmlFor={resource ? `edit-res-reset-${resource.id}` : 'edit-res-reset'} className="block text-[10px] text-slate-400 mb-0.5">
              Reset Timing
            </label>
            <select
              id={resource ? `edit-res-reset-${resource.id}` : 'edit-res-reset'}
              aria-label="Edit Reset Timing"
              value={editReset}
              onChange={(e) => setEditReset(e.target.value)}
              className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
            >
              <option value="LR">Long Rest</option>
              <option value="SR">Short Rest</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <ColorDropdown
            colors={RESOURCE_COLORS}
            color={editColor}
            setColor={setEditColor}
            isOpen={isColorMenuOpen}
            setIsOpen={setIsColorMenuOpen}
            dropdownRef={colorDropdownRef}
          />
        </div>
      </div>

      <div>
        <label htmlFor={resource ? `edit-res-note-${resource.id}` : 'edit-res-note'} className="block text-[10px] text-slate-400 mb-0.5">
          Description / Notes
        </label>
        <textarea
          id={resource ? `edit-res-note-${resource.id}` : 'edit-res-note'}
          aria-label="Edit Resource Description"
          rows={editBucket}
          placeholder="Resource rules, description, or notes..."
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          style={{
            minHeight: `${editBucket * 20 + 16}px`,
            maxHeight: `${Math.max(editBucket, 16) * 20 + 16}px`,
          }}
          className="w-full px-2 py-1.5 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 transition-[min-height,height] duration-300 ease-in-out resize-y"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {onDelete ? (
          <ResourceDeleteButton resourceName={resource.name} onDelete={() => onDelete(resource.id)} />
        ) : <div />}

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 rounded bg-dnd-panel text-slate-300 text-xs hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}

function ResourceDetailViewer({
  viewingResource,
  isEditing = false,
  editFormProps,
  isClosing = false,
  onClose,
  onStartEdit,
}) {
  if (!viewingResource) return null;

  if (isEditing && editFormProps) {
    return (
      <div
        data-testid="resource-viewer-wrapper"
        className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
      >
        <div className="overflow-hidden p-0.5 pb-2">
          <ResourceEditForm {...editFormProps} />
        </div>
      </div>
    );
  }

  const noteText = viewingResource.note || viewingResource.description || '';
  const bucket = getLineBucket(noteText);
  // Base card header + paddings is ~64px; notes area is bucket * 19.5px
  const totalViewerHeight = Math.round(64 + bucket * 19.5);

  const viewerColorCfg = getColorConfig(viewingResource.color || 'none');

  const resetLabel =
    viewingResource.resetOn === 'LR'
      ? 'Long Rest'
      : viewingResource.resetOn === 'SR'
      ? 'Short Rest'
      : viewingResource.resetOn || 'Manual';

  return (
    <div
      data-testid="resource-viewer-wrapper"
      className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
    >
      <div className="overflow-hidden p-0.5 pb-2">
        <div
          data-testid="resource-viewer-card"
          style={{ height: `${totalViewerHeight}px` }}
          className={`p-3 rounded-lg flex flex-col justify-between text-xs shadow-sm ring-1 ring-white/10 ${viewerColorCfg.bg} ${viewerColorCfg.text} transition-[height,background-color] duration-300 ease-in-out overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <AirplaneHelix45degIcon size={14} className="shrink-0 text-dnd-gold opacity-90" />
              <span className="font-bold text-sm text-slate-100 truncate">
                {viewingResource.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                {viewingResource.current ?? 0} / {viewingResource.max ?? 0}
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                Recovers @ {resetLabel}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                aria-label={`Edit ${viewingResource.name}`}
                title={`Edit ${viewingResource.name}`}
                onClick={(e) => onStartEdit(viewingResource, e)}
                className="p-1 rounded text-slate-400 hover:text-dnd-gold hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>

              <button
                type="button"
                aria-label={`Close ${viewingResource.name} details`}
                title="Close details"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div
            data-testid="resource-viewer-notes"
            className="flex-1 min-h-0 pt-2 mt-2 border-t border-white/5 text-slate-300 text-xs overflow-y-auto pr-1"
          >
            {noteText ? (
              <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                {noteText}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px] leading-relaxed">
                No description or notes recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesCard({
  trackedResources = [],
  featuresNotes = '',
  feats = [],
  isEditing = false,
  isAdding: externalIsAdding,
  onSetIsAdding,
  hideHeaderActions = false,
  onUpdateResources,
  onUpdateNotes,
  onUpdateFeats,
}) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const setIsAdding = onSetIsAdding || setInternalIsAdding;
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceMax, setNewResourceMax] = useState('3');
  const [newResourceReset, setNewResourceReset] = useState('LR');
  const [newResourceNote, setNewResourceNote] = useState('');
  const [newResourceColor, setNewResourceColor] = useState('none');
  const [isAddColorMenuOpen, setIsAddColorMenuOpen] = useState(false);
  const addColorDropdownRef = useClickOutside(isAddColorMenuOpen, () => setIsAddColorMenuOpen(false));
  const [nameError, setNameError] = useState(false);

  const [viewingResourceId, setViewingResourceId] = useState(null);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMax, setEditMax] = useState('1');
  const [editReset, setEditReset] = useState('LR');
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState('none');
  const [isEditColorMenuOpen, setIsEditColorMenuOpen] = useState(false);
  const editColorDropdownRef = useClickOutside(isEditColorMenuOpen, () => setIsEditColorMenuOpen(false));
  const [editNameError, setEditNameError] = useState(false);

  const [draggedResId, setDraggedResId] = useState(null);
  const [dragOverResId, setDragOverResId] = useState(null);

  const [isAddingFeat, setIsAddingFeat] = useState(false);
  const [newFeat, setNewFeat] = useState('');

  const textareaRef = useRef(null);

  const viewingResource = (trackedResources || []).find((r) => r.id === viewingResourceId);
  const isViewingMatch = Boolean(viewingResource);
  const { shouldRender: shouldRenderViewer, isClosing: isViewerClosing } = useAccordionMount(
    isViewingMatch,
    200
  );

  const cachedResourceRef = useRef(viewingResource);
  if (isViewingMatch && viewingResource) {
    cachedResourceRef.current = viewingResource;
  }
  const resourceToDisplay = isViewingMatch ? viewingResource : cachedResourceRef.current;

  const addBucket = getLineBucket(newResourceNote);

  const addFormRef = useAutoScrollOnExpand(Boolean(isAdding && !editingResourceId));
  const editFormRef = useAutoScrollOnExpand(Boolean(editingResourceId));

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.value) {
      el.style.height = `${Math.min(el.scrollHeight, 215)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [featuresNotes]);

  const handleAddFeat = (e) => {
    e.preventDefault();
    const trimmed = newFeat.trim();
    if (!trimmed) return;
    if (!feats.includes(trimmed)) {
      onUpdateFeats?.([...feats, trimmed]);
    }
    setNewFeat('');
    setIsAddingFeat(false);
  };

  const handleRemoveFeat = (featToRemove) => {
    onUpdateFeats?.(feats.filter((f) => f !== featToRemove));
  };

  const handleStep = (id, delta) => {
    const updated = (trackedResources || []).map((res) => {
      if (res.id !== id) return res;
      const next = Math.max(0, Math.min(res.max ?? 999, (res.current ?? 0) + delta));
      return { ...res, current: next };
    });
    onUpdateResources?.(updated);
  };

  const handleResetAll = () => {
    const updated = (trackedResources || []).map((res) => ({
      ...res,
      current: res.max ?? 0,
    }));
    onUpdateResources?.(updated);
  };

  const handleSaveResource = (e) => {
    e.preventDefault();
    if (!newResourceName.trim()) {
      setNameError(true);
      return;
    }

    const maxVal = Math.max(1, Number(newResourceMax) || 1);
    const newRes = {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newResourceName.trim(),
      max: maxVal,
      current: maxVal,
      resetOn: newResourceReset,
      note: newResourceNote.trim(),
      color: newResourceColor || 'none',
    };

    onUpdateResources?.([...(trackedResources || []), newRes]);
    setNewResourceName('');
    setNewResourceMax('3');
    setNewResourceReset('LR');
    setNewResourceNote('');
    setNewResourceColor('none');
    setIsAddColorMenuOpen(false);
    setNameError(false);
    setIsAdding(false);
  };

  const handleDeleteResource = (id) => {
    if (viewingResourceId === id) {
      setViewingResourceId(null);
      setEditingResourceId(null);
    }
    const filtered = (trackedResources || []).filter((r) => r.id !== id);
    onUpdateResources?.(filtered);
  };

  const handleToggleView = (id) => {
    if (draggedResId) return;
    setViewingResourceId((prev) => (prev === id ? null : id));
    setEditingResourceId(null);
    setEditNameError(false);
  };

  const handleStartEdit = (resource, e) => {
    e?.stopPropagation?.();
    setEditName(resource.name || '');
    setEditMax(String(resource.max ?? 1));
    setEditReset(resource.resetOn || 'LR');
    setEditNote(resource.note || resource.description || '');
    setEditColor(resource.color || 'none');
    setIsEditColorMenuOpen(false);
    setEditNameError(false);
    setEditingResourceId(resource.id);
  };

  const handleCancelEdit = () => {
    setEditingResourceId(null);
    setIsEditColorMenuOpen(false);
    setEditNameError(false);
  };

  const handleSaveEditedResource = (e) => {
    e?.preventDefault?.();
    if (!editName.trim()) {
      setEditNameError(true);
      return;
    }

    const maxVal = Math.max(1, Number(editMax) || 1);
    const updated = (trackedResources || []).map((res) => {
      if (res.id !== editingResourceId) return res;
      return {
        ...res,
        name: editName.trim(),
        max: maxVal,
        current: Math.min(res.current ?? maxVal, maxVal),
        resetOn: editReset,
        note: editNote.trim(),
        color: editColor || 'none',
      };
    });

    onUpdateResources?.(updated);
    setEditingResourceId(null);
    setIsEditColorMenuOpen(false);
  };

  const editFormProps = resourceToDisplay
    ? {
        formRef: editFormRef,
        resource: resourceToDisplay,
        editName,
        setEditName,
        editMax,
        setEditMax,
        editReset,
        setEditReset,
        editColor,
        setEditColor,
        isColorMenuOpen: isEditColorMenuOpen,
        setIsColorMenuOpen: setIsEditColorMenuOpen,
        colorDropdownRef: editColorDropdownRef,
        editNote,
        setEditNote,
        editNameError,
        setEditNameError,
        onCancel: handleCancelEdit,
        onSave: handleSaveEditedResource,
        onDelete: handleDeleteResource,
      }
    : null;

  const handleDragStart = (e, id) => {
    if (!isEditing) return;
    setDraggedResId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    if (!isEditing || !draggedResId || draggedResId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverResId !== id) {
      setDragOverResId(id);
    }
  };

  const handleDragLeave = (_e, id) => {
    if (dragOverResId === id) {
      setDragOverResId(null);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!isEditing || !draggedResId || draggedResId === targetId) {
      setDraggedResId(null);
      setDragOverResId(null);
      return;
    }

    const currentList = [...(trackedResources || [])];
    const fromIndex = currentList.findIndex((r) => r.id === draggedResId);
    const toIndex = currentList.findIndex((r) => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = currentList.splice(fromIndex, 1);
      currentList.splice(toIndex, 0, moved);
      onUpdateResources?.(currentList);
    }

    setDraggedResId(null);
    setDragOverResId(null);
  };

  const handleDragEnd = () => {
    setDraggedResId(null);
    setDragOverResId(null);
  };

  return (
    <div className="space-y-2">
      {/* Header action bar (fallback when not mounted in AccordionSection) */}
      {!hideHeaderActions && (
        <div className="flex items-center justify-end pb-1 border-b border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            {trackedResources && trackedResources.length > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                aria-label="Reset all resources"
                title="Reset all resources to max"
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="text-[11px] text-dnd-gold hover:text-dnd-gold-light font-medium"
            >
              + Add Tracked Resource
            </button>
          </div>
        </div>
      )}

      {/* Add resource inline drawer */}
      {isAdding && (
        <form
          ref={addFormRef}
          noValidate
          onSubmit={handleSaveResource}
          className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">New Tracked Resource</span>
            <button
              type="button"
              onClick={() => {
                setNameError(false);
                setNewResourceNote('');
                setNewResourceColor('none');
                setIsAddColorMenuOpen(false);
                setIsAdding(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <label htmlFor="res-name" className="block text-[10px] text-slate-400">
                  Resource Name
                </label>
                {nameError && (
                  <span className="text-[9px] text-red-400 font-semibold">Name required</span>
                )}
              </div>
              <input
                id="res-name"
                aria-label="Resource Name"
                type="text"
                placeholder="e.g. Chronal Shift"
                value={newResourceName}
                onChange={(e) => {
                  setNewResourceName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                className={`w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none transition-colors h-[26px] ${
                  nameError
                    ? 'border border-red-500/60 ring-1 ring-red-500/40'
                    : 'focus:ring-1 focus:ring-white/20'
                }`}
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="w-16">
                <label htmlFor="res-max" className="block text-[10px] text-slate-400 mb-0.5 text-center">
                  Max Uses
                </label>
                <input
                  id="res-max"
                  aria-label="Max Uses"
                  type="number"
                  min="1"
                  value={newResourceMax}
                  onChange={(e) => setNewResourceMax(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
                />
              </div>
              <div className="w-28">
                <label htmlFor="res-reset" className="block text-[10px] text-slate-400 mb-0.5">
                  Reset Timing
                </label>
                <select
                  id="res-reset"
                  aria-label="Reset Timing"
                  value={newResourceReset}
                  onChange={(e) => setNewResourceReset(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
                >
                  <option value="LR">Long Rest</option>
                  <option value="SR">Short Rest</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <ColorDropdown
                colors={RESOURCE_COLORS}
                color={newResourceColor}
                setColor={setNewResourceColor}
                isOpen={isAddColorMenuOpen}
                setIsOpen={setIsAddColorMenuOpen}
                dropdownRef={addColorDropdownRef}
              />
            </div>
          </div>
          <div>
            <label htmlFor="res-note" className="block text-[10px] text-slate-400 mb-0.5">
              Description / Notes
            </label>
            <textarea
              id="res-note"
              aria-label="Resource Description"
              rows={addBucket}
              placeholder="e.g. Spend a luck point to roll an additional d20..."
              value={newResourceNote}
              onChange={(e) => setNewResourceNote(e.target.value)}
              style={{
                minHeight: `${addBucket * 20 + 16}px`,
                maxHeight: `${Math.max(addBucket, 16) * 20 + 16}px`,
              }}
              className="w-full px-2 py-1.5 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 transition-[min-height,height] duration-300 ease-in-out resize-y"
            />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setNameError(false);
                setNewResourceNote('');
                setNewResourceColor('none');
                setIsAddColorMenuOpen(false);
                setIsAdding(false);
              }}
              className="px-2.5 py-1 rounded bg-dnd-panel/70 text-slate-300 text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
            >
              Save Resource
            </button>
          </div>
        </form>
      )}

      {/* Resource Detail Viewer */}
      {shouldRenderViewer && resourceToDisplay && (
        <ResourceDetailViewer
          viewingResource={resourceToDisplay}
          isEditing={editingResourceId === resourceToDisplay.id}
          editFormProps={editFormProps}
          isClosing={isViewerClosing}
          onClose={() => {
            setViewingResourceId(null);
            setEditingResourceId(null);
          }}
          onStartEdit={handleStartEdit}
        />
      )}

      {/* Steppers Grid */}
      {trackedResources && trackedResources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-2 text-xs">
          {trackedResources.map((res) => {
            const isDraggingThis = draggedResId === res.id;
            const isOverThis = dragOverResId === res.id;
            const isViewing = viewingResourceId === res.id;
            const colorCfg = getColorConfig(res.color || 'none');

            return (
              <div
                key={res.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${res.name} details`}
                aria-expanded={isViewing}
                onClick={() => handleToggleView(res.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleView(res.id);
                  }
                }}
                data-testid="tracked-resource-item"
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, res.id)}
                onDragOver={(e) => handleDragOver(e, res.id)}
                onDragLeave={(e) => handleDragLeave(e, res.id)}
                onDrop={(e) => handleDrop(e, res.id)}
                onDragEnd={handleDragEnd}
                className={`relative overflow-hidden bg-dnd-card p-2 rounded-lg flex items-center justify-between group shadow-sm transition-all duration-150 cursor-pointer ${
                  isEditing ? 'cursor-grab active:cursor-grabbing' : 'hover:bg-dnd-hover/60'
                } ${isDraggingThis ? 'opacity-40 scale-95' : ''} ${
                  isOverThis ? 'ring-1 ring-dnd-gold shadow-md' : ''
                } ${isViewing ? 'ring-1 ring-dnd-gold bg-dnd-card/90 shadow-md' : ''}`}
              >
                {/* Ease-out gradient originating from the right side and ending at the 2/3 mark */}
                <div
                  aria-hidden="true"
                  data-testid="resource-right-gradient"
                  style={{
                    background: colorCfg.id === 'none' ? 'none' : colorCfg.glow,
                  }}
                  className="absolute inset-0 pointer-events-none rounded-lg"
                />

                <div className="relative z-10 flex items-center min-w-0 pr-1 flex-1">
                  {isEditing && (
                    <div
                      data-testid="resource-drag-handle"
                      className="text-slate-500 group-hover:text-slate-300 mr-1.5 flex-shrink-0"
                    >
                      <GripVertical size={13} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-slate-200 truncate">{res.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {res.resetOn ? `Recovers @ ${res.resetOn}` : ''}
                    </div>
                  </div>
                </div>
                <div
                  className="relative z-10 flex items-center space-x-1 text-xs bg-dnd-panel/70 px-1.5 py-0.5 rounded-md flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label={`Decrement ${res.name}`}
                    onClick={() => handleStep(res.id, -1)}
                    className="px-1 font-bold text-dnd-gold hover:text-white"
                  >
                    -
                  </button>
                  <span className="min-w-[34px] text-center tabular-nums">
                    <span className="font-bold text-slate-100">{res.current ?? 0}</span>
                    <span className="font-medium text-slate-400"> / {res.max ?? 0}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Increment ${res.name}`}
                    onClick={() => handleStep(res.id, 1)}
                    className="px-1 font-bold text-dnd-gold hover:text-white"
                  >
                    +
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      aria-label={`Delete ${res.name}`}
                      title="Remove resource"
                      onClick={() => handleDeleteResource(res.id)}
                      className="text-slate-500 hover:text-red-400 pl-1 ml-0.5 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Freeform Notes Box */}
      <div className="space-y-1">
        <label htmlFor="features-notes" className="text-[10px] text-slate-400">
          Features & Freeform Notes:
        </label>
        <textarea
          ref={textareaRef}
          id="features-notes"
          aria-label="Features & Notes"
          placeholder="Type or paste features, special items, math notes (e.g. Blackstones: 49 + 162 + 28), death ward status, etc..."
          value={featuresNotes || ''}
          onChange={(e) => {
            onUpdateNotes?.(e.target.value);
            adjustHeight();
          }}
          onInput={adjustHeight}
          rows={2}
          style={{ fieldSizing: 'content' }}
          className="w-full p-2.5 rounded-lg bg-dnd-card text-xs text-slate-200 leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 custom-scroll resize-none min-h-[59px] max-h-[215px] overflow-y-auto shadow-sm"
        />
      </div>

      {/* Feats Subdivision (matching Conditions and Resistance & Immunities) */}
      <div className="pt-1.5 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Award size={10} className="text-amber-400" /> Feats:
          </span>
          <button
            type="button"
            onClick={() => setIsAddingFeat(!isAddingFeat)}
            className="text-dnd-gold hover:text-dnd-gold-light cursor-pointer"
          >
            + Add
          </button>
        </div>

        {isAddingFeat && (
          <form noValidate onSubmit={handleAddFeat} className="flex items-center space-x-1.5 pt-1 px-0.5">
            <input
              type="text"
              autoFocus
              placeholder="e.g. War Caster, Alert, Fey Touched"
              value={newFeat}
              onChange={(e) => setNewFeat(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 shadow-inner"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-dnd-gold text-slate-950 font-bold text-xs hover:bg-dnd-gold-light transition-colors shadow-sm cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingFeat(false);
                setNewFeat('');
              }}
              className="px-2 py-1 rounded-lg bg-dnd-card text-slate-400 text-xs hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-1 min-h-[20px]">
          {(!feats || feats.length === 0) && !isAddingFeat && (
            <span className="text-[11px] text-slate-500 italic">No feats recorded.</span>
          )}
          {(feats || []).map((feat) => (
            <span
              key={feat}
              className="group inline-flex items-center px-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 shadow-sm"
            >
              <span>{feat}</span>
              {isEditing && (
                <button
                  type="button"
                  aria-label={`Remove feat ${feat}`}
                  onClick={() => handleRemoveFeat(feat)}
                  className="ml-1 text-slate-500 hover:text-red-400 opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
