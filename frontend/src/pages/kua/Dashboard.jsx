import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import {
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    Plus,
    Activity,
    Database,
    ShieldCheck
} from 'lucide-react';

const KuaDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pending: 0, rejected: 0, approved: 0 });
    const [actionItems, setActionItems] = useState([]);
    const [recentSubmissions, setRecentSubmissions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Stats from optimized endpoint
                const resStats = await api.get(ENDPOINTS.DASHBOARD_STATS);
                if (resStats.data.success) {
                    setStats(resStats.data.data);
                }

                // 2. Fetch My Submissions for List & Action Items
                const resSubmissions = await api.get(ENDPOINTS.MY_SUBMISSIONS);
                const data = resSubmissions.data.data;

                // Filter Action Items (Rejected/Needs Revision)
                const actions = data.filter(s => ['REJECTED', 'NEEDS_REVISION'].includes(s.status));
                setActionItems(actions);

                // Get Recent (Top 5)
                const recent = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
                setRecentSubmissions(recent);

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Ringkasan Beranda</h1>
                <p className="mt-1 text-sm text-slate-500">Selamat datang kembali, <span className="font-semibold text-primary-600">{user?.full_name}</span></p>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pengajuan"
                    value={stats.total}
                    gradient="bg-gradient-to-br from-slate-700 to-slate-900"
                    icon={FileText}
                />
                <StatCard
                    title="Dalam Proses"
                    value={stats.pending}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-700"
                    icon={Clock}
                />
                <StatCard
                    title="Perlu Tindakan"
                    value={stats.rejected}
                    gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                    icon={AlertCircle}
                />
                <StatCard
                    title="Disetujui"
                    value={stats.approved}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                    icon={CheckCircle2}
                />
            </div>

            {/* Action Items Alert */}
            {actionItems.length > 0 && (
                <div className="animate-fade-in-up">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Perlu Perbaikan
                                <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-200 text-rose-800 rounded-full">
                                    {actionItems.length} Pengajuan
                                </span>
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {actionItems.map((sub) => {
                                const rejectionLog = sub.logs?.filter(l => l.new_status === 'REJECTED' || l.new_status === 'NEEDS_REVISION')
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                                const rejectionNote = rejectionLog?.notes || 'Tidak ada catatan dari Dukcapil';

                                return (
                                    <div key={sub.id} className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs font-bold text-rose-600 mb-1 block">
                                                    #{sub.ticket_number}
                                                </span>
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {sub.data_pernikahan?.husband_name} & {sub.data_pernikahan?.wife_name}
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/kua/submission/edit/${sub.id}`)}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                                            >
                                                Perbaiki
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 text-xs">
                                            <p className="font-medium text-slate-500 mb-1">Catatan:</p>
                                            <p className="text-slate-700 italic">&quot;{rejectionNote}&quot;</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Recent Submissions */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-500" />
                                Aktivitas Terbaru
                            </h3>
                            <button
                                onClick={() => navigate('/kua/submissions/active')}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Lihat Semua
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-primary-600 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold uppercase">No. Tiket</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Pasangan</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentSubmissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md group-hover:bg-primary-100 transition-colors">
                                                    #{sub.ticket_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {sub.data_pernikahan?.husband_name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    & {sub.data_pernikahan?.wife_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(sub.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${sub.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        sub.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                            sub.status === 'PROCESSING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                                sub.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                    sub.status === 'NEEDS_REVISION' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                        'bg-slate-50 text-slate-700 border-slate-100'}
                                                `}>
                                                    {sub.status === 'APPROVED' ? 'Disetujui' :
                                                        sub.status === 'REJECTED' ? 'Ditolak' :
                                                            sub.status === 'PROCESSING' ? 'Diproses' :
                                                                sub.status === 'DRAFT' ? 'Draft' :
                                                                    sub.status === 'NEEDS_REVISION' ? 'Perlu Revisi' :
                                                                        sub.status === 'SUBMITTED' ? 'Terkirim' :
                                                                            sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Action Card */}
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Aksi Cepat</h3>
                            <p className="text-blue-100 text-xs mb-6 leading-relaxed">
                                Siapkan dokumen KTP, KK, dan berkas pendukung lainnya sebelum membuat pengajuan baru.
                            </p>
                            <button
                                onClick={() => navigate('/kua/submission/new')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-primary-600 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Pengajuan Baru
                            </button>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            Status Sistem
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Database className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Database</p>
                                        <p className="text-[10px] text-emerald-600 font-medium">Terhubung & Aktif</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">E-Dukcapil</p>
                                        <p className="text-[10px] text-blue-600 font-medium">Layanan Online</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KuaDashboard;
