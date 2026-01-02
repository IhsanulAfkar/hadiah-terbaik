import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat aplikasi...</p>
            </div>
        </div>
    );
};

export default Loading;
