import React from 'react';
import StatCard from '../../components/ui/StatCard';
import { Card, CardContent } from '../../components/ui/Card';
import { LayoutDashboard, Users, FileText, Activity } from 'lucide-react';

const KemenagDashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Kemenag</h1>
                <p className="text-slate-500 mt-1">Selamat datang di panel Kementrian Agama.</p>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Pengjuan"
                    value="-"
                    icon={FileText}
                    gradient="bg-gradient-to-br from-blue-600 to-blue-800"
                />
                <StatCard
                    title="Verifikasi Selesai"
                    value="-"
                    icon={Users}
                    gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
                />
                <StatCard
                    title="Pending"
                    value="-"
                    icon={Activity}
                    gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                />
                <StatCard
                    title="Unit KUA"
                    value="-"
                    icon={LayoutDashboard}
                    gradient="bg-gradient-to-br from-purple-600 to-purple-800"
                />
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-slate-500 py-12">
                        <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-slate-900">Selamat Datang</h3>
                        <p className="max-w-sm mx-auto mt-2">
                            Menu ini dkhususkan untuk akses Kemenag. Silakan gunakan menu di samping untuk melihat Laporan.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default KemenagDashboard;
