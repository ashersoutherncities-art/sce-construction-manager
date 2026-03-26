import { useState, useRef, useEffect, useCallback } from 'react';
import StatusBadge, {
  ProjectStatus,
  PROJECT_STATUSES,
  STATUS_CONFIG,
  normalizeStatus,
  getSuggestedStatus,
} from './StatusBadge';

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: ProjectStatus) => Promise<void>;
  project?: {
    status: string;
    photoFolderId?: string;
    cachedScopeOfWork?: any;
    cachedCostEstimate?: any;
    photoCount?: number;
  };
  disabled?: boolean;
}

export default function StatusDropdown({
  currentStatus,
  onStatusChange,
  project,
  disabled = false,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const normalized = normalizeStatus(currentStatus);
  const suggested = project ? getSuggestedStatus(project) : null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus first item when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const firstItem = listRef.current.querySelector('[role="option"]') as HTMLElement;
      firstItem?.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    async (status: ProjectStatus) => {
      if (status === normalized || updating || disabled) return;
      setUpdating(true);
      try {
        await onStatusChange(status);
      } finally {
        setUpdating(false);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    },
    [normalized, updating, disabled, onStatusChange]
  );

  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = listRef.current?.querySelectorAll('[role="option"]')[index + 1] as HTMLElement;
        next?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = listRef.current?.querySelectorAll('[role="option"]')[index - 1] as HTMLElement;
        prev?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(PROJECT_STATUSES[index]);
      }
    },
    [handleSelect]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || updating}
        className="flex items-center gap-2 group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Project status: ${STATUS_CONFIG[normalized].label}. Click to change.`}
      >
        <StatusBadge status={currentStatus} size="md" />
        {!disabled && (
          <svg
            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {updating && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        )}
      </button>

      {/* Suggested status hint */}
      {suggested && suggested !== normalized && !isOpen && (
        <button
          onClick={() => handleSelect(suggested)}
          className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          disabled={updating}
        >
          <span>💡</span>
          <span>
            Suggest: <strong>{STATUS_CONFIG[suggested].label}</strong>
          </span>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Select project status"
          className="absolute z-50 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden"
        >
          {PROJECT_STATUSES.map((status, idx) => {
            const config = STATUS_CONFIG[status];
            const isActive = status === normalized;
            const isSuggested = status === suggested;

            return (
              <li
                key={status}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => handleSelect(status)}
                onKeyDown={(e) => handleKeyNavigation(e, idx)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors outline-none
                  ${isActive ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50 focus:bg-gray-100'}
                  ${isSuggested ? 'ring-2 ring-inset ring-blue-200' : ''}
                `}
              >
                <span className="text-lg" aria-hidden="true">
                  {config.icon}
                </span>
                <div className="flex-1">
                  <div className={`text-sm ${config.color}`}>
                    {config.label}
                    {isSuggested && (
                      <span className="ml-2 text-xs text-blue-500 font-normal">← suggested</span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
