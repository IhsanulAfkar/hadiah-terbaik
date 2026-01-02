import React from 'react';

const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ className, children, ...props }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
);

const CardTitle = ({ className, children, ...props }) => (
    <h3 className={`font-display font-semibold leading-none tracking-tight ${className}`} {...props}>
        {children}
    </h3>
);

const CardDescription = ({ className, children, ...props }) => (
    <p className={`text-sm text-slate-500 ${className}`} {...props}>
        {children}
    </p>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
);

const CardFooter = ({ className, children, ...props }) => (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
