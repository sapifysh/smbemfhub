import React from 'react';

interface LiquidGlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const LiquidGlassInput = React.forwardRef<HTMLInputElement, LiquidGlassInputProps>(
  ({ className = '', onClear, showClearButton, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={`liquid-glass-input w-full transition-all duration-200 focus:outline-none ${className}`}
          {...props}
        />
        {showClearButton && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="liquid-glass-clear-btn absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2.5 py-1 rounded-xl transition-all cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>
    );
  }
);

LiquidGlassInput.displayName = 'LiquidGlassInput';
