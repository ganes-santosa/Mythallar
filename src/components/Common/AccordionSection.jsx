import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';

export default function AccordionSection({
  title,
  icon: Icon,
  badge = null,
  actions = null,
  children,
  defaultOpen = true,
  autoScroll = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useAutoScrollOnExpand(isOpen, { enabled: autoScroll });

  return (
    <div ref={sectionRef} className={`p-3 rounded-lg bg-dnd-panel transition-all ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 text-left group focus:outline-none"
          aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
          title={isOpen ? `Click to collapse ${title.toLowerCase()}` : `Click to expand ${title.toLowerCase()}`}
        >
          {Icon && (
            <Icon size={14} className="text-dnd-gold group-hover:scale-110 transition-transform flex-shrink-0" />
          )}
          <h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">
            {title}
          </h3>
          <ChevronDown
            size={13}
            className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
              isOpen ? '' : '-rotate-90'
            }`}
          />
          {badge}
        </button>

        {actions && <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">{actions}</div>}
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden -mx-1 px-1 -mb-1 pb-1">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
