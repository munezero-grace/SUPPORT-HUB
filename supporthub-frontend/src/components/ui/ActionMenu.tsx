import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/lib/utils';

interface ActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  items: ActionItem[];
  className?: string;
}

export function ActionMenu({ items, className }: ActionMenuProps) {  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useOnClickOutside(menuRef, () => setIsOpen(false));

  return (    
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-1 rounded-lg hover:bg-gray-100 transition-colors',
          className
        )}
      >
        <svg
          className="w-5 h-5 text-gray-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {isOpen && (
        <div 
          className="fixed w-40 rounded-lg border border-gray-200 shadow-sm bg-white z-50"
          style={{
            left: (() => {
              const rect = menuRef.current?.getBoundingClientRect();
              if (!rect) return 'auto';
              if (rect.right + 160 > window.innerWidth) {
                return 'auto';
              }
              return `${rect.left}px`;
            })(),
            right: (() => {
              const rect = menuRef.current?.getBoundingClientRect();
              if (!rect) return 'auto';
              if (rect.right + 160 > window.innerWidth) {
                return `${window.innerWidth - rect.right}px`;
              }
              return 'auto';
            })(),
            top: (() => {
              const rect = menuRef.current?.getBoundingClientRect();
              if (!rect) return 'auto';
              
              const rowNumber = Math.floor((rect.top || 0) / 50); 
              if (rowNumber === 0) {
                return `${rect.top + rect.height}px`;
              }
             
              if (rect.bottom + 200 > window.innerHeight) {
                return `${rect.top - 180}px`;
              }
            
              return `${rect.bottom + 40}px`;
            })()
          }}
        >
          <div className="py-1" role="menu">
            <div className="px-3 py-2 text-sm font-bold text-gray-900 border-b border-gray-100">
              Actions
            </div>
            {items.map((item, index) => (
              <button
                type="button"
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-gray-50',
                  'text-gray-700 flex items-center gap-2',
                  item.variant === 'danger' && 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
