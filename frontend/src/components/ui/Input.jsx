import React, { forwardRef } from 'react';

const Input = forwardRef(({ className, type, label, error, startIcon, endIcon, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-slate-900">
                    {label}
                </label>
            )}
            <div className="relative">
                {startIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={`h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 
                    ${startIcon ? 'pl-10' : ''} 
                    ${endIcon ? 'pr-10' : ''}
                    ${error ? 'border-danger focus-visible:ring-danger' : ''} 
                    ${className}`}
                    ref={ref}
                    {...props}
                />
                {endIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        {endIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-danger mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
