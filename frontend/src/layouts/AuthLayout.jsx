import React from 'react';
import { Outlet } from 'react-router-dom';
import logoMadiun from '../components/img/kabupaten-madiun.png';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-repeat bg-center" style={{ backgroundImage: 'url("/pattern-bg.jpg")' }} />
            </div>

            <div className="w-full max-w-md p-6 relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <img
                        src={logoMadiun}
                        alt="Logo Kabupaten Madiun"
                        className="w-24 h-auto mx-auto mb-4 drop-shadow-md"
                    />
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
                        Hadiah Terbaik
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                        HARI INI DIA NIKAH, TERCETAK BERSAMAAN IDENTITAS DI KK DAN KTP-el
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-8">
                    <Outlet />
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} Kementerian Agama & Dukcapil Kabupaten Madiun
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
