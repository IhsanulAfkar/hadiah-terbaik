import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    disabled,
    children,
    type = 'button',
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
        danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-primary-600 underline-offset-4 hover:underline",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900"
    };

    const sizes = {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10"
    };

    return (
        <button
            ref={ref}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
