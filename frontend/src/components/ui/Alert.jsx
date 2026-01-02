import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const Alert = ({ variant = 'default', title, children, className, ...props }) => {

    const variants = {
        default: 'bg-slate-100 text-slate-800 border-slate-200',
        destructive: 'bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-600',
        success: 'bg-emerald-50 text-emerald-900 border-emerald-200 [&>svg]:text-emerald-600',
        warning: 'bg-amber-50 text-amber-900 border-amber-200 [&>svg]:text-amber-600',
        info: 'bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-600',
    };

    const icons = {
        default: <Info className="h-4 w-4" />,
        destructive: <XCircle className="h-4 w-4" />,
        success: <CheckCircle2 className="h-4 w-4" />,
        warning: <AlertCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
    };

    return (
        <div
            role="alert"
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${variants[variant]} ${className}`}
            {...props}
        >
            {icons[variant]}
            <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>
            <div className="text-sm [&_p]:leading-relaxed opacity-90">{children}</div>
        </div>
    );
};

export default Alert;
