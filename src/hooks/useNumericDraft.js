import { useEffect, useState } from 'react';

export function normalizeIntegerDraft(value) {
  return String(value).replace(/^(-?)0+(?=\d)/, '$1');
}

export default function useNumericDraft(value, onCommit, { normalize = false } = {}) {
  const [draft, setDraft] = useState(String(value ?? 0));

  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  const handleChange = (next) => {
    setDraft(normalize ? normalizeIntegerDraft(next) : next);
  };

  const handleBlur = () => {
    const numeric = draft === '' ? 0 : Number(draft);
    onCommit(Number.isFinite(numeric) ? numeric : 0, draft);
  };

  return { draft, handleChange, handleBlur, setDraft };
}
