import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, RotateCcw, Award, GripVertical, Pencil, Trash2, Link2 } from 'lucide-react';
import useAccordionMount from '../../hooks/useAccordionMount';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';
import useClickOutside from '../../hooks/useClickOutside';
import SuggestionInput from '../Common/SuggestionInput';
import {
  loadFeatsCatalogue,
  matchFeatSuggestions,
  getFeatStatChoiceConfig,
  statChoiceToModifiers,
  modifiersToStatChoice,
  formatFeatStatBadge,
} from '../../utils/featsCatalogue';
import { estimateLinesFromText, getLineBucket, getColorConfig, ColorDropdown, RESOURCE_COLORS, SteppedTextarea } from './ItemsCard';

export function normalizeFeats(rawFeats) {
  if (!Array.isArray(rawFeats)) return [];
  return rawFeats
    .map((f, idx) => {
      if (typeof f === 'string') {
        const trimmed = f.trim();
        if (!trimmed) return null;
        return {
          id: `feat_legacy_${idx}_${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          name: trimmed,
          note: '',
          color: 'none',
        };
      }
      if (f && typeof f === 'object' && f.name) {
        return {
          id: f.id || `feat_${idx}`,
          name: f.name,
          note: f.note ?? f.description ?? '',
          color: f.color || 'none',
          ...(f.statModifiers ? { statModifiers: f.statModifiers } : {}),
        };
      }
      return null;
    })
    .filter(Boolean);
}

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

function ResourceViewerDeleteButton({ resourceName, onDelete }) {
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
      className={`p-1 rounded transition-colors cursor-pointer ${
        armed
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-400 hover:text-red-400 hover:bg-white/5'
      }`}
    >
      <Trash2 size={12} />
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
          e.preventDefault();
          e.target.blur();
        }
      }}
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
        <SteppedTextarea
          id={resource ? `edit-res-note-${resource.id}` : 'edit-res-note'}
          aria-label="Edit Resource Description"
          bucket={editBucket}
          placeholder="Resource rules, description, or notes..."
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
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
  onDelete,
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
  const lineCount = estimateLinesFromText(noteText);
  const bucket = getLineBucket(lineCount);
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

              {onDelete && (
                <ResourceViewerDeleteButton
                  resourceName={viewingResource.name}
                  onDelete={() => onDelete(viewingResource.id)}
                />
              )}

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
            className={`flex-1 min-h-0 pt-2 mt-2 border-t border-white/5 text-slate-300 text-xs pr-1 ${
              lineCount > 16 ? 'overflow-y-auto custom-scroll' : 'overflow-y-hidden'
            }`}
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

// ponytail: extracted so useTwoClickConfirm hook works per-row inside .map()
function ResourceChipDeleteButton({ resourceName, onDelete }) {
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
      className={`ml-0.5 p-0.5 rounded transition-all cursor-pointer ${
        armed
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-500 hover:text-red-400'
      }`}
    >
      <Trash2 size={11} />
    </button>
  );
}

// ponytail: extracted so useTwoClickConfirm hook works per-row inside .map()
function FeatChipDeleteButton({ featName, onDelete }) {
  const { armed, handleClick } = useTwoClickConfirm(onDelete);

  return (
    <button
      type="button"
      aria-label={armed ? `Click again to delete ${featName}` : `Delete ${featName}`}
      title={armed ? `Click again to delete ${featName}` : `Delete ${featName}`}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={`ml-1.5 p-0.5 rounded transition-all cursor-pointer ${
        armed
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-600 hover:text-red-400'
      }`}
    >
      <Trash2 size={11} />
    </button>
  );
}

function FeatForm({
  formRef,
  editingFeatId,
  name,
  setName,
  nameError,
  setNameError,
  color,
  setColor,
  isColorMenuOpen,
  setIsColorMenuOpen,
  colorDropdownRef,
  note,
  setNote,
  statChoice = 'none',
  setStatChoice,
  statOptions = [],
  trackResource,
  setTrackResource,
  resourceMax,
  setResourceMax,
  resourceReset,
  setResourceReset,
  suggestions = [],
  onSelectSuggestion,
  onSubmit,
  onCancel,
  onDelete,
}) {
  const editBucket = getLineBucket(note);

  return (
    <form
      ref={formRef}
      noValidate
      data-testid={editingFeatId ? 'feat-edit-form' : 'feat-add-form'}
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
          e.preventDefault();
          e.target.blur();
        }
      }}
      className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-dnd-gold text-[11px]">
          {editingFeatId ? 'Edit Feat' : 'Add New Feat'}
        </span>
        <div className="flex items-center space-x-1.5 shrink-0">
          {editingFeatId && onDelete && (
            <ResourceViewerDeleteButton resourceName={name} onDelete={onDelete} />
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <label
              htmlFor={editingFeatId ? `feat-name-${editingFeatId}` : 'feat-name'}
              className="block text-[10px] text-slate-400"
            >
              Feat Name
            </label>
            {nameError && (
              <span className="text-[9px] text-red-400 font-semibold">Name required</span>
            )}
          </div>
          <SuggestionInput
            id={editingFeatId ? `feat-name-${editingFeatId}` : 'feat-name'}
            aria-label="Feat Name"
            placeholder="e.g. War Caster, Alert, Fey Touched"
            value={name}
            suggestions={suggestions}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(false);
            }}
            onSelectSuggestion={onSelectSuggestion}
            className={`w-full px-2 py-1 rounded bg-dnd-panel text-slate-200 focus:outline-none text-xs ${
              nameError ? 'ring-1 ring-red-500/70' : 'focus:ring-1 focus:ring-white/20'
            }`}
          />
        </div>

        <div className="w-24 shrink-0">
          <label
            htmlFor={editingFeatId ? `feat-asi-${editingFeatId}` : 'feat-asi'}
            className="block text-[10px] text-slate-400 mb-0.5"
          >
            ASI
          </label>
          <select
            id={editingFeatId ? `feat-asi-${editingFeatId}` : 'feat-asi'}
            aria-label="ASI"
            value={statChoice}
            onChange={(e) => setStatChoice?.(e.target.value)}
            className="w-full px-1.5 py-1 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
          >
            {statOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ColorDropdown
          colors={RESOURCE_COLORS}
          color={color}
          setColor={setColor}
          isOpen={isColorMenuOpen}
          setIsOpen={setIsColorMenuOpen}
          dropdownRef={colorDropdownRef}
        />
      </div>

      <div>
        <label
          htmlFor={editingFeatId ? `feat-note-${editingFeatId}` : 'feat-note'}
          className="block text-[10px] text-slate-400 mb-0.5"
        >
          Description / Notes
        </label>
        <SteppedTextarea
          id={editingFeatId ? `feat-note-${editingFeatId}` : 'feat-note'}
          aria-label="Feat Description"
          bucket={editBucket}
          placeholder="Feat benefits, prerequisites, or notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center space-x-2 text-slate-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              aria-label="Track Resource"
              checked={trackResource}
              onChange={(e) => setTrackResource(e.target.checked)}
              className="rounded bg-dnd-panel text-dnd-gold focus:ring-0"
            />
            <span>Track Resource</span>
          </label>

          {trackResource && (
            <div className="flex items-center space-x-1.5 pl-1">
              <label className="flex items-center space-x-1 text-[10px] text-slate-400">
                <span>Max</span>
                <input
                  type="number"
                  min="1"
                  aria-label="Tracked Resource Max"
                  value={resourceMax}
                  onChange={(e) => setResourceMax(e.target.value)}
                  className="w-12 px-1.5 py-0.5 rounded bg-dnd-panel text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </label>
              <select
                aria-label="Tracked Resource Reset"
                value={resourceReset}
                onChange={(e) => setResourceReset(e.target.value)}
                className="px-1.5 py-0.5 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="LR">Long Rest</option>
                <option value="SR">Short Rest</option>
                <option value="Dawn">Dawn</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            type="submit"
            className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
          >
            {editingFeatId ? 'Update Feat' : 'Save Feat'}
          </button>
        </div>
      </div>
    </form>
  );
}

function FeatDetailViewer({
  viewingFeat,
  linkedResource,
  fallbackNote = '',
  isEditing = false,
  editFormProps,
  isClosing = false,
  onClose,
  onStartEdit,
  onDelete,
}) {
  if (!viewingFeat) return null;

  if (isEditing && editFormProps) {
    return (
      <div
        data-testid="feat-viewer-wrapper"
        className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
      >
        <div className="overflow-hidden p-0.5 pb-2">
          <FeatForm {...editFormProps} />
        </div>
      </div>
    );
  }

  const noteText = viewingFeat.note || viewingFeat.description || fallbackNote || '';
  const lineCount = estimateLinesFromText(noteText);
  const bucket = getLineBucket(lineCount);
  const totalViewerHeight = Math.round(64 + bucket * 19.5);
  const viewerColorCfg = getColorConfig(viewingFeat.color || 'none');
  const statBadge = formatFeatStatBadge(viewingFeat.statModifiers);

  const resetLabel = linkedResource
    ? linkedResource.resetOn === 'LR'
      ? 'Long Rest'
      : linkedResource.resetOn === 'SR'
      ? 'Short Rest'
      : linkedResource.resetOn || 'Manual'
    : '';

  return (
    <div
      data-testid="feat-viewer-wrapper"
      className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
    >
      <div className="overflow-hidden p-0.5 pb-2">
        <div
          data-testid="feat-viewer-card"
          style={{ height: `${totalViewerHeight}px` }}
          className={`p-3 rounded-lg flex flex-col justify-between text-xs shadow-sm ring-1 ring-white/10 ${viewerColorCfg.bg} ${viewerColorCfg.text} transition-[height,background-color] duration-300 ease-in-out overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <Award size={14} className="shrink-0 text-dnd-gold opacity-90" />
              <span className="font-bold text-sm text-slate-100 truncate">
                {viewingFeat.name}
              </span>
              {statBadge && (
                <span
                  data-testid="feat-viewer-stat-badge"
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-dnd-gold/15 text-dnd-gold shrink-0"
                >
                  {statBadge}
                </span>
              )}
              {linkedResource && (
                <>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                    {linkedResource.current ?? 0} / {linkedResource.max ?? 0}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium truncate">
                    Recovers @ {resetLabel}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                aria-label={`Edit ${viewingFeat.name}`}
                title={`Edit ${viewingFeat.name}`}
                onClick={(e) => onStartEdit(viewingFeat, e)}
                className="p-1 rounded text-slate-400 hover:text-dnd-gold hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>

              {onDelete && (
                <ResourceViewerDeleteButton
                  resourceName={viewingFeat.name}
                  onDelete={() => onDelete(viewingFeat.id)}
                />
              )}

              <button
                type="button"
                aria-label={`Close ${viewingFeat.name} details`}
                title="Close details"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div
            data-testid="feat-viewer-notes"
            className={`flex-1 min-h-0 pt-2 mt-2 border-t border-white/5 text-slate-300 text-xs pr-1 ${
              lineCount > 16 ? 'overflow-y-auto custom-scroll' : 'overflow-y-hidden'
            }`}
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
  const [featName, setFeatName] = useState('');
  const [featNote, setFeatNote] = useState('');
  const [featColor, setFeatColor] = useState('none');
  const [featStatChoice, setFeatStatChoice] = useState('none');
  const [featStatOptions, setFeatStatOptions] = useState(() => getFeatStatChoiceConfig('').options);
  const [isFeatColorMenuOpen, setIsFeatColorMenuOpen] = useState(false);
  const featColorDropdownRef = useClickOutside(isFeatColorMenuOpen, () => setIsFeatColorMenuOpen(false));
  const [featNameError, setFeatNameError] = useState(false);
  const [featTrackResource, setFeatTrackResource] = useState(false);
  const [featResourceMax, setFeatResourceMax] = useState('1');
  const [featResourceReset, setFeatResourceReset] = useState('LR');

  const [viewingFeatId, setViewingFeatId] = useState(null);
  const [editingFeatId, setEditingFeatId] = useState(null);
  const [featsCatalogue, setFeatsCatalogue] = useState([]);

  const normalizedFeats = useMemo(() => normalizeFeats(feats), [feats]);

  useEffect(() => {
    if (isAddingFeat || editingFeatId || viewingFeatId) {
      let active = true;
      loadFeatsCatalogue().then((data) => {
        if (active) setFeatsCatalogue(data);
      });
      return () => {
        active = false;
      };
    }
  }, [isAddingFeat, editingFeatId, viewingFeatId]);

  const featSuggestions = useMemo(
    () => matchFeatSuggestions(featName, featsCatalogue, 8),
    [featName, featsCatalogue]
  );

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

  const viewingFeat = normalizedFeats.find((f) => f.id === viewingFeatId);
  const isViewingFeatMatch = Boolean(viewingFeat);
  const { shouldRender: shouldRenderFeatViewer, isClosing: isFeatViewerClosing } = useAccordionMount(
    isViewingFeatMatch,
    200
  );

  const cachedFeatRef = useRef(viewingFeat);
  if (isViewingFeatMatch && viewingFeat) {
    cachedFeatRef.current = viewingFeat;
  }
  const featToDisplay = isViewingFeatMatch ? viewingFeat : cachedFeatRef.current;

  const addBucket = getLineBucket(newResourceNote);

  const addFormRef = useAutoScrollOnExpand(Boolean(isAdding && !editingResourceId));
  const editFormRef = useAutoScrollOnExpand(Boolean(editingResourceId));
  const addFeatFormRef = useAutoScrollOnExpand(Boolean(isAddingFeat && !editingFeatId));
  const editFeatFormRef = useAutoScrollOnExpand(Boolean(editingFeatId));

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

  const findLinkedResource = (feat) => {
    if (!feat) return null;
    return (trackedResources || []).find(
      (r) =>
        r.linkedFeatId === feat.id ||
        (!r.linkedFeatId && r.name?.toLowerCase() === feat.name?.toLowerCase())
    );
  };

  const findLinkedFeat = (res) => {
    if (!res) return null;
    return normalizedFeats.find(
      (f) =>
        res.linkedFeatId === f.id ||
        (!res.linkedFeatId && res.name?.toLowerCase() === f.name?.toLowerCase())
    );
  };

  const resetFeatForm = () => {
    setFeatName('');
    setFeatNote('');
    setFeatColor('none');
    setFeatStatChoice('none');
    setFeatStatOptions(getFeatStatChoiceConfig('').options);
    setIsFeatColorMenuOpen(false);
    setFeatNameError(false);
    setFeatTrackResource(false);
    setFeatResourceMax('1');
    setFeatResourceReset('LR');
    setIsAddingFeat(false);
    setEditingFeatId(null);
  };

  const handleSelectFeatSuggestion = (suggestion) => {
    if (!suggestion) return;
    setFeatName(suggestion.name);
    setFeatNameError(false);
    if (suggestion.description !== undefined) {
      setFeatNote(suggestion.description);
    }
    const statCfg = getFeatStatChoiceConfig(suggestion);
    setFeatStatOptions(statCfg.options);
    setFeatStatChoice(statCfg.defaultChoice);

    if (suggestion.trackedResource) {
      setFeatTrackResource(true);
      setFeatResourceMax(String(suggestion.trackedResource.max || 1));
      setFeatResourceReset(suggestion.trackedResource.resetOn || 'LR');
    } else {
      setFeatTrackResource(false);
    }
  };

  const handleSaveFeat = (e) => {
    e.preventDefault();
    const trimmed = featName.trim();
    if (!trimmed) {
      setFeatNameError(true);
      return;
    }

    const statMods = statChoiceToModifiers(featStatChoice);

    if (editingFeatId) {
      const updatedFeats = normalizedFeats.map((f) => {
        if (f.id !== editingFeatId) return f;
        const nextFeat = {
          ...f,
          name: trimmed,
          note: featNote.trim(),
          color: featColor || 'none',
        };
        if (statMods) {
          nextFeat.statModifiers = statMods;
        } else {
          delete nextFeat.statModifiers;
        }
        return nextFeat;
      });
      onUpdateFeats?.(updatedFeats);

      const targetFeat = normalizedFeats.find((f) => f.id === editingFeatId);
      const existingLinked = findLinkedResource(targetFeat);

      if (featTrackResource) {
        const maxVal = Math.max(1, Number(featResourceMax) || 1);
        if (existingLinked) {
          const updatedResources = (trackedResources || []).map((r) =>
            r.id === existingLinked.id
              ? {
                  ...r,
                  linkedFeatId: editingFeatId,
                  name: trimmed,
                  max: maxVal,
                  current: Math.min(r.current ?? maxVal, maxVal),
                  resetOn: featResourceReset,
                  note: featNote.trim(),
                  color: featColor || 'none',
                }
              : r
          );
          onUpdateResources?.(updatedResources);
        } else {
          const newRes = {
            id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            linkedFeatId: editingFeatId,
            name: trimmed,
            max: maxVal,
            current: maxVal,
            resetOn: featResourceReset,
            note: featNote.trim(),
            color: featColor || 'none',
          };
          onUpdateResources?.([...(trackedResources || []), newRes]);
        }
      } else if (existingLinked) {
        const filteredResources = (trackedResources || []).filter((r) => r.id !== existingLinked.id);
        onUpdateResources?.(filteredResources);
      }

      setEditingFeatId(null);
      setIsFeatColorMenuOpen(false);
      return;
    }

    const newFeatObj = {
      id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      note: featNote.trim(),
      color: featColor || 'none',
      ...(statMods ? { statModifiers: statMods } : {}),
    };

    onUpdateFeats?.([...normalizedFeats, newFeatObj]);

    if (featTrackResource) {
      const maxVal = Math.max(1, Number(featResourceMax) || 1);
      const newRes = {
        id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        linkedFeatId: newFeatObj.id,
        name: trimmed,
        max: maxVal,
        current: maxVal,
        resetOn: featResourceReset,
        note: featNote.trim(),
        color: featColor || 'none',
      };
      onUpdateResources?.([...(trackedResources || []), newRes]);
    }

    resetFeatForm();
  };

  const handleDeleteFeat = (featId) => {
    const targetFeat = normalizedFeats.find((f) => f.id === featId);
    if (viewingFeatId === featId) {
      setViewingFeatId(null);
      setEditingFeatId(null);
    }
    const filteredFeats = normalizedFeats.filter((f) => f.id !== featId);
    onUpdateFeats?.(filteredFeats);

    if (targetFeat) {
      const linked = (trackedResources || []).find((r) => r.linkedFeatId === targetFeat.id);
      if (linked) {
        if (viewingResourceId === linked.id) {
          setViewingResourceId(null);
          setEditingResourceId(null);
        }
        onUpdateResources?.((trackedResources || []).filter((r) => r.id !== linked.id));
      }
    }
  };

  const handleToggleFeatView = (featId) => {
    setViewingResourceId(null);
    setEditingResourceId(null);
    setViewingFeatId((prev) => (prev === featId ? null : featId));
    setEditingFeatId(null);
    setFeatNameError(false);
  };

  const handleStartFeatEdit = (feat, e) => {
    e?.stopPropagation?.();
    const linked = findLinkedResource(feat);
    const catalogueMatch = featsCatalogue.find(
      (c) => c.name.toLowerCase() === feat.name.toLowerCase()
    );
    const statCfg = getFeatStatChoiceConfig(catalogueMatch || feat);
    setIsAddingFeat(false);
    setEditingFeatId(feat.id);
    setViewingFeatId(feat.id);
    setViewingResourceId(null);
    setEditingResourceId(null);
    setFeatName(feat.name || '');
    setFeatNote(feat.note || feat.description || catalogueMatch?.description || '');
    setFeatColor(feat.color || 'none');
    setFeatStatOptions(statCfg.options);
    setFeatStatChoice(modifiersToStatChoice(feat.statModifiers));
    setIsFeatColorMenuOpen(false);
    setFeatNameError(false);
    if (linked) {
      setFeatTrackResource(true);
      setFeatResourceMax(String(linked.max ?? 1));
      setFeatResourceReset(linked.resetOn || 'LR');
    } else {
      setFeatTrackResource(false);
      setFeatResourceMax('1');
      setFeatResourceReset('LR');
    }
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
    setViewingFeatId(null);
    setEditingFeatId(null);
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
    const targetRes = (trackedResources || []).find((r) => r.id === editingResourceId);
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

    if (targetRes?.linkedFeatId) {
      const hasLinkedFeat = normalizedFeats.some((f) => f.id === targetRes.linkedFeatId);
      if (hasLinkedFeat) {
        const updatedFeats = normalizedFeats.map((f) =>
          f.id === targetRes.linkedFeatId
            ? {
                ...f,
                name: editName.trim(),
                note: editNote.trim(),
                color: editColor || 'none',
              }
            : f
        );
        onUpdateFeats?.(updatedFeats);
      }
    }

    setEditingResourceId(null);
    setIsEditColorMenuOpen(false);
  };

  const featFormProps = {
    editingFeatId,
    name: featName,
    setName: setFeatName,
    nameError: featNameError,
    setNameError: setFeatNameError,
    color: featColor,
    setColor: setFeatColor,
    isColorMenuOpen: isFeatColorMenuOpen,
    setIsColorMenuOpen: setIsFeatColorMenuOpen,
    colorDropdownRef: featColorDropdownRef,
    note: featNote,
    setNote: setFeatNote,
    statChoice: featStatChoice,
    setStatChoice: setFeatStatChoice,
    statOptions: featStatOptions,
    trackResource: featTrackResource,
    setTrackResource: setFeatTrackResource,
    resourceMax: featResourceMax,
    setResourceMax: setFeatResourceMax,
    resourceReset: featResourceReset,
    setResourceReset: setFeatResourceReset,
    suggestions: featSuggestions,
    onSelectSuggestion: handleSelectFeatSuggestion,
    onSubmit: handleSaveFeat,
    onCancel: resetFeatForm,
    onDelete: editingFeatId ? () => handleDeleteFeat(editingFeatId) : undefined,
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
              e.preventDefault();
              e.target.blur();
            }
          }}
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
            <SteppedTextarea
              id="res-note"
              aria-label="Resource Description"
              bucket={addBucket}
              placeholder="e.g. Spend a luck point to roll an additional d20..."
              value={newResourceNote}
              onChange={(e) => setNewResourceNote(e.target.value)}
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
          onDelete={handleDeleteResource}
        />
      )}

      {/* Steppers Grid */}
      {trackedResources && trackedResources.length > 0 && (
        <div className="space-y-1">
          {isEditing && (
            <div className="text-[10px] text-slate-500 italic pb-0.5 select-none">
              Drag items to reorder
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-2 text-xs">
          {trackedResources.map((res) => {
            const isDraggingThis = draggedResId === res.id;
            const isOverThis = dragOverResId === res.id;
            const isViewing = viewingResourceId === res.id;
            const colorCfg = getColorConfig(res.color || 'none');
            const linkedFeat = findLinkedFeat(res);

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
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-200 truncate">{res.name}</span>
                      {linkedFeat && (
                        <Link2
                          size={10}
                          data-testid="resource-linked-icon"
                          title={`Linked with Feat: ${linkedFeat.name}`}
                          className="shrink-0 text-slate-400/70"
                        />
                      )}
                    </div>
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
                    <ResourceChipDeleteButton
                      resourceName={res.name}
                      onDelete={() => handleDeleteResource(res.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Feats Subdivision */}
      <div className="pt-1.5 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Award size={10} className="text-amber-400" /> Feats:
          </span>
          <button
            type="button"
            onClick={() => {
              if (isAddingFeat && !editingFeatId) {
                resetFeatForm();
              } else {
                setEditingFeatId(null);
                setFeatName('');
                setFeatNote('');
                setFeatColor('none');
                setFeatStatChoice('none');
                setFeatStatOptions(getFeatStatChoiceConfig('').options);
                setFeatNameError(false);
                setFeatTrackResource(false);
                setFeatResourceMax('1');
                setFeatResourceReset('LR');
                setIsAddingFeat(true);
              }
            }}
            className="text-dnd-gold hover:text-dnd-gold-light cursor-pointer"
          >
            + Add
          </button>
        </div>

        {/* Add New Feat Form */}
        {isAddingFeat && !editingFeatId && (
          <FeatForm
            {...featFormProps}
            formRef={addFeatFormRef}
          />
        )}

        {/* Inline Feat Detail Viewer (or In-Place Edit Form) right above Feats */}
        {shouldRenderFeatViewer && featToDisplay && (
          <FeatDetailViewer
            viewingFeat={featToDisplay}
            linkedResource={findLinkedResource(featToDisplay)}
            fallbackNote={
              featsCatalogue.find(
                (c) => c.name.toLowerCase() === featToDisplay.name.toLowerCase()
              )?.description || ''
            }
            isEditing={editingFeatId === featToDisplay.id}
            editFormProps={{
              ...featFormProps,
              formRef: editFeatFormRef,
            }}
            isClosing={isFeatViewerClosing}
            onClose={() => {
              setViewingFeatId(null);
              if (editingFeatId) resetFeatForm();
            }}
            onStartEdit={handleStartFeatEdit}
            onDelete={handleDeleteFeat}
          />
        )}

        {normalizedFeats.length === 0 && !isAddingFeat && (
          <div className="min-h-[20px] flex items-center">
            <span className="text-[11px] text-slate-500 italic">No feats recorded.</span>
          </div>
        )}

        {normalizedFeats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-1.5">
            {normalizedFeats.map((feat) => {
              const isViewing = viewingFeatId === feat.id;
              const colorCfg = getColorConfig(feat.color || 'none');
              const linkedRes = findLinkedResource(feat);
              const statBadge = formatFeatStatBadge(feat.statModifiers);

              return (
                <div
                  key={feat.id}
                  data-testid={`feat-chip-${feat.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${feat.name} details`}
                  aria-expanded={isViewing}
                  onClick={() => handleToggleFeatView(feat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleFeatView(feat.id);
                    }
                  }}
                  className={`group relative flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs select-none transition-all shadow-sm cursor-pointer overflow-hidden ${
                    isViewing
                      ? 'bg-dnd-card ring-2 ring-white/80 shadow-[0_0_12px_rgba(255,255,255,0.18)] brightness-110'
                      : 'bg-dnd-card hover:bg-dnd-hover text-slate-300'
                  }`}
                >
                  <div
                    aria-hidden="true"
                    data-testid="feat-right-gradient"
                    style={{
                      background: colorCfg.id === 'none' ? 'none' : colorCfg.glow,
                    }}
                    className="absolute inset-0 pointer-events-none rounded-lg"
                  />

                  <div className="relative z-10 flex items-center space-x-1 min-w-0">
                    <span
                      className={`font-semibold truncate ${
                        isViewing ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {feat.name}
                    </span>
                    {linkedRes && (
                      <Link2
                        size={10}
                        data-testid="feat-linked-icon"
                        title={`Linked with Tracked Resource: ${linkedRes.name}`}
                        className="shrink-0 text-slate-400/70"
                      />
                    )}
                  </div>

                  <div className="relative z-10 flex items-center space-x-1.5 shrink-0 ml-2">
                    {statBadge && (
                      <span
                        data-testid="feat-stat-badge"
                        title={`Modifies Ability Score (${statBadge})`}
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-dnd-gold/15 text-dnd-gold"
                      >
                        {statBadge}
                      </span>
                    )}
                    {linkedRes && (
                      <span
                        title={`Linked Tracked Resource (${linkedRes.current ?? 0}/${linkedRes.max ?? 0})`}
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-dnd-gold"
                      >
                        {linkedRes.current ?? 0}/{linkedRes.max ?? 0}
                      </span>
                    )}
                    <FeatChipDeleteButton
                      featName={feat.name}
                      onDelete={() => handleDeleteFeat(feat.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
