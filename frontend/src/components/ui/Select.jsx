import React, { forwardRef } from 'react';

const Select = forwardRef(({ className, label, error, children, disabled, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-slate-900">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${error ? 'border-danger focus:ring-danger' : ''
                        } ${className}`}
                    ref={ref}
                    disabled={disabled}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="text-xs text-danger mt-1">{error}</p>
            )}
        </div>
    );
});

Select.displayName = "Select";

export default Select;
