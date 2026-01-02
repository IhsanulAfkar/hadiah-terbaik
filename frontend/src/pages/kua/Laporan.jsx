import React, { useState, useEffect, useCallback } from 'react';
import api, { ENDPOINTS } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from 'react-toastify';
import {
    BarChart3,
    Send,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    FileText,
    Download
} from 'lucide-react';
import Loading from '../../components/common/Loading';

const LaporanKUA = () => {
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
            const res = await api.get('/submissions/my');
            const data = res.data.data;

            // Filter by period
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
    }, [period]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const periods = [
        { id: 'week', label: '7 Hari Terakhir' },
        { id: 'month', label: '30 Hari Terakhir' },
        { id: 'year', label: '1 Tahun Terakhir' },
        { id: 'all', label: 'Semua Data' },
    ];

    const exportReport = async (format) => {
        try {
            toast.info(`Memproses download ${format}...`);
            const response = await api.get(`${ENDPOINTS.REPORT_EXPORT}?format=${format.toLowerCase()}&period=${period}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `Laporan_Pengajuan_${periods.find(p => p.id === period).label}_${new Date().toISOString().split('T')[0]}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Laporan ${format} berhasil diunduh!`);
        } catch (error) {
            console.error('Export failed', error);
            toast.error(`Gagal mengunduh laporan ${format}. Silakan coba lagi.`);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Laporan Pengajuan</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Ringkasan statistik dan analisa pengajuan pernikahan
                    </p>
                </div>

                {/* Period Switcher */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`
                                px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
                                ${period === p.id
                                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StatCard
                    title="Total Pengajuan"
                    value={stats.total}
                    gradient="bg-gradient-to-br from-slate-700 to-slate-900"
                    icon={BarChart3}
                />
                <StatCard
                    title="Menunggu"
                    value={stats.submitted}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    icon={Send}
                />
                <StatCard
                    title="Diproses"
                    value={stats.processing}
                    gradient="bg-gradient-to-br from-violet-500 to-violet-700"
                    icon={RefreshCcw}
                />
                <StatCard
                    title="Disetujui"
                    value={stats.approved}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                    icon={CheckCircle2}
                />
                <StatCard
                    title="Ditolak/Revisi"
                    value={stats.rejected}
                    gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                    icon={XCircle}
                />
            </div>

            {/* Export Section */}
            <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-100">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 ring-1 ring-blue-100">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Export Laporan</h3>
                            <p className="text-sm text-slate-600 mt-1 max-w-lg">
                                Unduh laporan lengkap dalam format PDF atau Excel sesuai periode yang dipilih ({periods.find(p => p.id === period).label}).
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            className="w-full md:w-auto bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                            onClick={() => exportReport('PDF')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Unduh PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full md:w-auto bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                            onClick={() => exportReport('Excel')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Unduh Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LaporanKUA;
