import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Laporan = () => {
    const { user } = useAuth();
    const role = user?.role;
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        processing: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // week, month, year, all

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            // Use different endpoint based on role
            const endpoint = role === 'KUA' ? '/submissions/my' : '/verifications/queue';
            const res = await api.get(endpoint);

            // Handle different response structures
            // KUA: res.data.data = array
            // Dukcapil: res.data.data = {total, page, limit, data: array}
            let data;
            const isDukcapilRole = (role === 'OPERATOR_DUKCAPIL' || role === 'VERIFIKATOR_DUKCAPIL' || role === 'DUKCAPIL');
            if (isDukcapilRole && res.data.data && res.data.data.data) {
                data = res.data.data.data; // Paginated response
            } else {
                data = res.data.data; // Direct array
            }

            // Filter by period if needed
            let filtered = data;
            if (period !== 'all') {
                const now = new Date();
                const startDate = new Date();

                if (period === 'week') {
                    startDate.setDate(now.getDate() - 7);
                } else if (period === 'month') {
                    startDate.setMonth(now.getMonth() - 1);
                } else if (period === 'year') {
                    startDate.setFullYear(now.getFullYear() - 1);
                }

                filtered = data.filter(s => new Date(s.created_at) >= startDate);
            }

            // Calculate statistics
            const stats = {
                total: filtered.length,
                submitted: 0,
                processing: 0,
                approved: 0,
                rejected: 0
            };

            // Count by status
            filtered.forEach(item => {
                const status = item.status;
                if (status === 'SUBMITTED') {
                    stats.submitted++;
                } else if (status === 'PROCESSING') {
                    stats.processing++;
                } else if (status === 'APPROVED') {
                    stats.approved++;
                } else if (status === 'REJECTED' || status === 'NEEDS_REVISION') {
                    stats.rejected++;
                }
            });

            setStats(stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Set empty stats on error
            setStats({
                total: 0,
                submitted: 0,
                processing: 0,
                approved: 0,
                rejected: 0
            });
        } finally {
            setLoading(false);
        }
    }, [period, role]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const exportReport = (format) => {
        alert(`Export ${format} akan segera tersedia!`);
        // TODO: Implement actual export functionality
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Laporan {role === 'KUA' ? 'Pengajuan' : 'Verifikasi'}</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Statistik dan laporan {role === 'KUA' ? 'pengajuan pernikahan' : 'verifikasi data'}
                </p>
            </div>

            {/* Period Selector */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Periode Laporan</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-4 py-2 rounded text-sm font-medium ${period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        7 Hari Terakhir
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-4 py-2 rounded text-sm font-medium ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        30 Hari Terakhir
                    </button>
                    <button
                        onClick={() => setPeriod('year')}
                        className={`px-4 py-2 rounded text-sm font-medium ${period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        1 Tahun Terakhir
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-4 py-2 rounded text-sm font-medium ${period === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Semua Data
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                        <StatCard title="Total" value={stats.total} color="bg-blue-500" icon="📊" />
                        <StatCard title="Diajukan" value={stats.submitted} color="bg-yellow-500" icon="📝" />
                        <StatCard title="Diproses" value={stats.processing} color="bg-indigo-500" icon="⚙️" />
                        <StatCard title="Disetujui" value={stats.approved} color="bg-green-500" icon="✅" />
                        <StatCard title="Ditolak" value={stats.rejected} color="bg-red-500" icon="❌" />
                    </div>

                    {/* Export Buttons */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Laporan</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportReport('PDF')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Export PDF
                            </button>
                            <button
                                onClick={() => exportReport('Excel')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Excel
                            </button>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Laporan akan mencakup semua data sesuai periode yang dipilih ({period === 'all' ? 'Semua data' : period === 'week' ? '7 hari terakhir' : period === 'month' ? '30 hari terakhir' : '1 tahun terakhir'})
                        </p>
                    </div>
                </>
            )}
        </Layout>
    );
};

// Statistics Card Component
const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className={`flex-shrink-0 ${color} rounded-md p-3 text-white text-2xl`}>
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
);

export default Laporan;
