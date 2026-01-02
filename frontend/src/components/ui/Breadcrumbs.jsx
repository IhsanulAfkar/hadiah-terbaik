import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map specific paths to user-friendly names if needed
    const nameMap = {
        'kua': 'KUA',
        'dukcapil': 'Dukcapil',
        'operator': 'Operator',
        'verifier': 'Verifikator',
        'admin': 'Admin',
        'dashboard': 'Dashboard',
        'submissions': 'Pengajuan',
        'active': 'Aktif',
        'history': 'Riwayat',
        'submission': 'Pengajuan',
        'new': 'Baru',
        'edit': 'Edit',
        'laporan': 'Laporan',
        'akun': 'Akun',
        'users': 'Manajemen User',
        'logs': 'Log Sistem',
        'master': 'Master Data',
        'queue': 'Antrian',
        'my-work': 'Pekerjaan Saya',
        'detail': 'Detail',
        'verify': 'Verifikasi',
        'verifications': 'Verifikasi'
    };

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-primary-600">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const displayName = nameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
                    const isUnclickable = ['dukcapil', 'kua', 'admin', 'operator', 'verifier', 'master', 'kemenag'].includes(value.toLowerCase());

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                {isLast ? (
                                    <span className="ml-1 text-sm font-medium text-slate-500 md:ml-2">
                                        {displayName}
                                    </span>
                                ) : isUnclickable ? (
                                    <span className="ml-1 text-sm font-medium text-slate-700 md:ml-2">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link to={to} className="ml-1 text-sm font-medium text-slate-700 hover:text-primary-600 md:ml-2">
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
