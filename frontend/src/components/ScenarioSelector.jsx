import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * ScenarioSelector Component
 * Dropdown untuk memilih 1 dari 17 skenario MOU
 */
const ScenarioSelector = ({ value, onChange, className = '' }) => {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kua/scenarios');
            setScenarios(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching scenarios:', err);
            setError('Gagal memuat daftar skenario');
        } finally {
            setLoading(false);
        }
    };

    const selectedScenario = scenarios.find(s => s.value === value);

    return (
        <div className={`form-group ${className}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Opsi Pengajuan
                <span className="text-red-500 ml-1">*</span>
            </label>

            {loading ? (
                <div className="text-gray-500 text-sm">Memuat skenario...</div>
            ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
            ) : (
                <>
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(parseInt(e.target.value) || null)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">-- Pilih Opsi --</option>

                        {/* Group Dalam Kabupaten */}
                        <optgroup label="Dalam Kabupaten (Skenario 1-8)">
                            {scenarios.filter(s => !s.outside_district).map(scenario => (
                                <option key={scenario.value} value={scenario.value}>
                                    {scenario.label}
                                </option>
                            ))}
                        </optgroup>

                        {/* Group Luar Kabupaten */}
                        <optgroup label="Luar Kabupaten (Skenario 9-17)">
                            {scenarios.filter(s => s.outside_district).map(scenario => (
                                <option key={scenario.value} value={scenario.value}>
                                    {scenario.label}
                                </option>
                            ))}
                        </optgroup>
                    </select>

                    {/* Info selected scenario */}
                    {selectedScenario && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                Dokumen yang diperlukan untuk opsi ini:
                            </p>
                            <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                                {selectedScenario.required_docs && selectedScenario.required_docs.map(doc => (
                                    <li key={doc}>{doc}</li>
                                ))}
                            </ul>
                            {selectedScenario.optional_docs && selectedScenario.optional_docs.length > 0 && (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                        Dokumen lainnya:
                                    </p>
                                    <ul className="mt-1 text-xs text-gray-500 dark:text-gray-500 list-disc list-inside">
                                        {selectedScenario.optional_docs.map(doc => (
                                            <li key={doc}>{doc}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Pilih opsi yang sesuai dengan kondisi pengajuan Anda. Setiap opsi memiliki persyaratan dokumen yang berbeda.
            </p>
        </div>
    );
};

export default ScenarioSelector;
