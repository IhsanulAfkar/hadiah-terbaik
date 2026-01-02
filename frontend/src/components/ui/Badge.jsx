import React from 'react';

const Badge = ({ variant = 'default', children, className, ...props }) => {
    const variants = {
        default: "bg-primary-100 text-primary-700 hover:bg-primary-100/80",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80", // Explicit Emerald
        warning: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
        danger: "bg-red-100 text-red-700 hover:bg-red-100/80",
        info: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
        outline: "text-slate-950 border border-slate-200 hover:bg-slate-100"
    };

    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 border-transparent ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Badge;
