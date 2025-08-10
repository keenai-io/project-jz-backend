import clsx from 'clsx'
import React, { forwardRef } from 'react'

interface SliderProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'> {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Current value */
  value: number
  /** Change handler with numeric value */
  onChange: (value: number) => void
  /** Optional label */
  label?: string
  /** Show current value */
  showValue?: boolean
  /** Custom className */
  className?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  function Slider(
    { 
      min = 0, 
      max = 100, 
      step = 1, 
      value, 
      onChange, 
      label, 
      showValue = true, 
      className, 
      disabled,
      ...props 
    },
    ref
  ) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = Number(event.target.value);
      onChange(newValue);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={clsx('w-full', className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <label className="text-sm font-medium text-zinc-950 dark:text-white">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {value}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          {/* Track */}
          <div className="h-2 bg-zinc-200 rounded-lg overflow-hidden dark:bg-zinc-700">
            {/* Progress */}
            <div 
              className="h-full bg-blue-600 transition-all duration-150 ease-out dark:bg-blue-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Input */}
          <input
            {...props}
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={clsx(
              'absolute inset-0 w-full h-2 opacity-0 cursor-pointer',
              'appearance-none bg-transparent',
              // Focus styles
              'focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              // Disabled styles
              disabled && 'cursor-not-allowed opacity-50'
            )}
          />
          
          {/* Thumb */}
          <div 
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow-sm pointer-events-none transition-all duration-150 ease-out',
              'dark:border-blue-500 dark:bg-zinc-900',
              disabled && 'opacity-50'
            )}
            style={{ 
              left: `calc(${percentage}% - 8px)` // 8px is half of thumb width
            }}
          />
        </div>
      </div>
    );
  }
);