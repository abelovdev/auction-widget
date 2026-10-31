import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-[46px] pl-8 pr-3 border border-black rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black max-lg:h-[40px] ${
          error ? 'border-red-500 ring-1 ring-red-500' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
