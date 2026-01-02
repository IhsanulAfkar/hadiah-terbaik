import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Users, MapPin, Activity, Info } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

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
        </div>
    );
};

export default AdminDashboard;
