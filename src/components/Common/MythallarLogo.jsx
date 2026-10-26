import React from 'react';

export default function MythallarLogo({
  className = 'w-6 h-6',
  variant = 'default', // 'default' (ivory) | 'gold' | 'black'
  alt = 'Mythallar Logo',
}) {
  let src = '/mythallar_logo.png';
  if (variant === 'gold') {
    src = '/mythallar_logo_gold.png';
  } else if (variant === 'black') {
    src = '/mythallar_logo_black.png';
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain select-none pointer-events-none drop-shadow-sm transition-transform ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
