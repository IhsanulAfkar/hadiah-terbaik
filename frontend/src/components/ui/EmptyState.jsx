import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
    title = "Tidak ada data",
    description = "Belum ada data yang tersedia untuk ditampilkan saat ini.",
    icon: Icon = PackageOpen,
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-6">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
