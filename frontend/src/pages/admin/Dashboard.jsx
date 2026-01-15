import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Users, MapPin, Activity, Info, Trash2, ShieldAlert } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import api, { ENDPOINTS } from '../../services/api';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [isPurging, setIsPurging] = React.useState(false);

    const handlePurge = async () => {
        setIsPurging(true);
        try {
            const response = await api.delete(ENDPOINTS.ADMIN_PURGE_SUBMISSIONS);
            if (response.data.success) {
                toast.success(response.data.message || 'Seluruh data pengajuan telah dihapus');
            }
        } catch (error) {
            console.error('Purge error:', error);
            toast.error(error.userMessage || 'Gagal menghapus data');
        } finally {
            setIsPurging(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrator</h1>
                <p className="text-slate-500 mt-1">Selamat datang di panel kontrol sistem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StatCard
                    title="Manajemen User"
                    value="Kelola Pengguna"
                    icon={Users}
                    color="blue"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    title="Master Data"
                    value="Data Wilayah"
                    icon={MapPin}
                    color="emerald"
                    onClick={() => navigate('/admin/master')}
                />
                <StatCard
                    title="Audit Log"
                    value="Log Sistem"
                    icon={Activity}
                    color="amber"
                    onClick={() => navigate('/admin/logs')}
                />
            </div>

            {/* Quick Guide or Info */}
            <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-slate-500" />
                        Informasi Sistem
                    </CardTitle>
                    <CardDescription>
                        Panduan singkat navigasi panel administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm text-slate-600 max-w-none">
                    <p>Gunakan menu di sidebar atau kartu di atas untuk navigasi.</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Manajemen User:</strong> Tambah/Edit akun Kepala KUA, Staff, dan Verifikator Dukcapil.</li>
                        <li><strong>Master Data:</strong> Atur referensi wilayah (Kecamatan) untuk plotting user KUA.</li>
                        <li><strong>Log Sistem:</strong> Pantau aktivitas login, pengajuan, dan verifikasi secara real-time.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Maintenance Section (Dangerous Area) */}
            <Card className="border-red-100 bg-red-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        Pemeliharaan Sistem
                    </CardTitle>
                    <CardDescription className="text-red-700/70">
                        Fitur administrator khusus untuk pembersihan data sistem.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="font-medium text-slate-900">Bersihkan Data Pengajuan</h4>
                        <p className="text-sm text-slate-500">
                            Menghapus seluruh permohonan, dokumen, dan log status yang ada secara permanen.
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        onClick={() => setIsConfirmOpen(true)}
                        isLoading={isPurging}
                        className="w-full md:w-auto"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus Seluruh Data
                    </Button>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handlePurge}
                title="Hapus Seluruh Data?"
                message="Aksi ini akan menghapus SELURUH data pengajuan, dokumen fisik, dan riwayat status secara permanen di database."
                notes="Tindakan ini tidak bisa dibatalkan (Undo)."
            />
        </div>
    );
};

export default AdminDashboard;
