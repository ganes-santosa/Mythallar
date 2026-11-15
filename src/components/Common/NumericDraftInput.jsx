import React from 'react';
import useNumericDraft from '../../hooks/useNumericDraft';

export default function NumericDraftInput({
  value,
  onCommit,
  emptyValue = 0,
  min,
  max,
  className = '',
  ...props
}) {
  const { draft, handleChange, handleBlur, setDraft } = useNumericDraft(value ?? '', () => {}, {
    normalize: true,
  });

  const commit = () => {
    const numeric = draft === '' ? emptyValue : Number(draft);
    let committed = Number.isFinite(numeric) ? numeric : emptyValue;
    if (committed !== null && min !== undefined) committed = Math.max(min, committed);
    if (committed !== null && max !== undefined) committed = Math.min(max, committed);
    setDraft(String(committed ?? ''));
    onCommit?.(committed);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => {
        handleBlur();
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className={className}
      {...props}
    />
  );
}
