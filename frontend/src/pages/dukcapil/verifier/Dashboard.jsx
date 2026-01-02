import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import StatCard from '../../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
import { CheckCircle2, XCircle, Clock, Shield, Search } from 'lucide-react';

const VerifierDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingVerification: 0,
        approvedToday: 0,
        rejectedToday: 0
    });
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resStats = await api.get('/dukcapil/verifier/reports');
                if (resStats.data.success) {
                    setStats({
                        pendingVerification: resStats.data.data.pendingVerification || 0,
                        approvedToday: resStats.data.data.approvedToday || 0,
                        rejectedToday: resStats.data.data.rejectedToday || 0
                    });
                }

                const resQueue = await api.get('/dukcapil/verifier/queue?limit=5');
                // Backend returns { data: { data: [], pagination: {} } }
                const queueData = resQueue.data.success ? resQueue.data.data : null;
                const items = queueData?.data || [];
                setQueue(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error('Failed to fetch verifier data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Verifikator</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Selamat bertugas, <span className="font-semibold text-primary-600">{user?.full_name}</span>.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Menunggu Verifikasi"
                    value={stats.pendingVerification}
                    icon={Clock}
                    color="blue"
                    onClick={() => navigate('/dukcapil/verifier/queue')}
                />
                <StatCard
                    title="Disetujui Hari Ini"
                    value={stats.approvedToday}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Ditolak Hari Ini"
                    value={stats.rejectedToday}
                    icon={XCircle}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Verification Queue */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Search className="w-5 h-5 text-primary-500" />
                                Antrian Prioritas
                            </CardTitle>
                            <Badge variant="secondary">{queue.length} Menunggu</Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tiket</TableHead>
                                        <TableHead>Pasangan</TableHead>
                                        <TableHead>Operator</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queue.length === 0 ? (
                                        <TableEmpty colSpan={4} message="Tidak ada antrian menunggu verifikasi" />
                                    ) : (
                                        queue.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-xs font-semibold text-primary-600">
                                                    #{item.ticket_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {item.data_pernikahan?.husband_name} & {item.data_pernikahan?.wife_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-slate-500">
                                                        {item.current_assignee?.full_name || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => navigate(`/dukcapil/verifier/verify/${item.id}`)}
                                                    >
                                                        Verifikasi
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {queue.length === 0 && (
                                <div className="mt-4 text-center">
                                    <Button variant="outline" onClick={() => navigate('/dukcapil/verifier/history')}>
                                        Lihat Riwayat
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Guide */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 relative z-10">
                            <Shield className="w-5 h-5" />
                            Panduan Verifikator
                        </h3>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed relative z-10">
                            Pastikan data NIK dan dokumen valid sebelum memberikan persetujuan final penerbitan KK/KTP baru.
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative z-10">
                            <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mb-1">Target SLA</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">12</span>
                                <span className="text-sm font-medium mb-1">Jam Maksimal</span>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wide text-slate-500">Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => navigate('/dukcapil/verifier/queue')}
                            >
                                Lihat Antrian Full
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate('/dukcapil/verifier/history')}
                            >
                                Riwayat Verifikasi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VerifierDashboard;
