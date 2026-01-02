import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, notes }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleCancel}
            ></div>

            {/* Dialog */}
            <div className="relative bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
                {/* Title */}
                <h3 className="text-white font-medium mb-4 text-sm">
                    {title || 'localhost:8081 says'}
                </h3>

                {/* Message */}
                <p className="text-white mb-2 text-sm">
                    {message}
                </p>

                {/* Notes (if provided) */}
                {notes && (
                    <p className="text-yellow-400 mb-6 text-sm">
                        Catatan: {notes}
                    </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 rounded-md border-2 border-gray-600 text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 rounded-md bg-indigo-300 text-gray-900 hover:bg-indigo-400 transition-colors font-medium text-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
