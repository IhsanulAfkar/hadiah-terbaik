import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const DocumentViewer = ({ isOpen, onClose, documentUrl, documentName }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !documentUrl) {
            setBlobUrl(null);
            setError(null);
            return;
        }

        const fetchDocument = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use XMLHttpRequest instead of fetch to avoid IDM interception
                const xhr = new XMLHttpRequest();

                await new Promise((resolve, reject) => {
                    xhr.open('GET', documentUrl, true);
                    xhr.responseType = 'blob';

                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const blob = xhr.response;
                            const url = URL.createObjectURL(blob);
                            setBlobUrl(url);
                            resolve();
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    };

                    xhr.onerror = () => {
                        reject(new Error('Network error atau file tidak dapat diakses'));
                    };

                    xhr.send();
                });

            } catch (err) {
                console.error('Error loading document:', err);
                setError('Gagal memuat dokumen: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();

        // Cleanup blob URL when component unmounts or modal closes
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [isOpen, documentUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            {/* Modal Container */}
            <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
                {/* Header */}
                <div className="bg-white rounded-t-lg px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{documentName || 'Dokumen'}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-b-lg" style={{ height: 'calc(100vh - 120px)' }}>
                    {loading && (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Memuat dokumen...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && blobUrl && (
                        <iframe
                            src={blobUrl}
                            className="w-full h-full border-0"
                            title={documentName || 'Document Viewer'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
