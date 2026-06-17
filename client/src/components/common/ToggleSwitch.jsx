import React from 'react';

export default function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  loading = false,
  className = ''
}) {
  const isInteractive = !disabled && !loading;

  const handleKeyDown = (e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <div className="flex flex-col pr-4">
        {label && (
          <label 
            id={`${id}-label`} 
            htmlFor={id} 
            className="text-sm font-medium" 
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}
        {description && (
          <span 
            id={`${id}-description`} 
            className="text-xs mt-0.5" 
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <div
          id={id}
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          aria-disabled={disabled || loading}
          tabIndex={isInteractive ? 0 : -1}
          onKeyDown={handleKeyDown}
          onClick={() => isInteractive && onChange(!checked)}
          className={`
            w-12 h-6 rounded-full transition-all duration-300 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500
            relative cursor-pointer
            ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
            ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}
          `}
        >
          <div
            className={`
              absolute left-1 top-1 flex items-center justify-center
              w-4 h-4 bg-white rounded-full shadow-sm 
              transition-transform duration-300 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-0'}
            `}
          >
            {loading && (
              <svg 
                className="animate-spin w-3 h-3 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
