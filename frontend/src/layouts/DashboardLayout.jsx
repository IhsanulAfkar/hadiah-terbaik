import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useAuth();
    const location = useLocation();

    // Helper to generate page title based on path (simple version)
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('submissions')) return 'Manajemen Pengajuan';
        if (path.includes('submission')) return 'Detail Pengajuan';
        if (path.includes('users')) return 'Manajemen Pengguna';
        if (path.includes('queue')) return 'Antrian Verifikasi';
        if (path.includes('history')) return 'Riwayat';
        if (path.includes('laporan')) return 'Laporan';
        if (path.includes('akun')) return 'Profil Akun';
        return 'Overview';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Passed generic state if needed or handled internally */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right">
                                <div className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</div>
                                <div className="text-xs text-slate-500">{user?.role || 'Role'}</div>
                            </div>
                            <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
                    <div className="mb-6">
                        <Breadcrumbs />
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
