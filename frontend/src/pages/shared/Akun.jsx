import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import { User, Lock, Shield, Info, MapPin, Key, Camera, Mail, Phone, Calendar } from 'lucide-react';

const Akun = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // profile, password
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validation
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'warning', text: 'Password baru minimal 6 karakter' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'warning', text: 'Konfirmasi password tidak cocok' });
            return;
        }

        try {
            setLoading(true);
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setMessage({ type: 'success', text: 'Password berhasil diubah!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.userMessage || 'Gagal mengubah password. Pastikan password lama benar.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500';
            case 'KUA': return 'bg-emerald-500';
            case 'OPERATOR_DUKCAPIL': return 'bg-blue-500';
            case 'VERIFIKATOR_DUKCAPIL': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Akun Saya</h1>
                    <p className="text-slate-500 mt-1.5">Kelola informasi profil dan preferences keamanan Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card & Navigation */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Profile Summary Card */}
                    <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/50">
                        {/* Banner w/ Gradient matching Role */}
                        <div className={`h-32 w-full bg-gradient-to-r from-slate-700 to-slate-900 relative`}>
                            <div className="absolute inset-0 bg-white/5 pattern-grid-lg opacity-30"></div>
                        </div>

                        <div className="px-6 pb-6 relative">
                            {/* Avatar */}
                            <div className="-mt-12 flex justify-center">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md relative group">
                                    <span className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-600 to-slate-800`}>
                                        {getInitials(user?.full_name)}
                                    </span>
                                    {/* Edit Overlay (Visual Only) */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-not-allowed">
                                        <Camera className="w-8 h-8 text-white/80" />
                                    </div>
                                    {/* Online Indicator */}
                                    <span className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mt-4 text-center">
                                <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
                                <p className="text-sm font-medium text-slate-500">@{user?.username}</p>

                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    <Badge className={`${getRoleColor(user?.role)} text-white border-0 shadow-sm`}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {user?.role?.replace('_', ' ')}
                                    </Badge>
                                    {user?.nip && (
                                        <Badge variant="outline" className="text-slate-600 bg-slate-50">
                                            NIP: {user.nip}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats or Info (Optional) */}
                            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                                    <p className="font-semibold text-green-600">Active</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Bergabung</p>
                                    <p className="font-semibold text-slate-700">
                                        {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Navigation Menu */}
                    <Card className="border-0 shadow-md ring-1 ring-slate-200/50">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile'
                                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`p-2 rounded-md mr-3 ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                    <User className="w-4 h-4" />
                                </div>
                                Informasi Profil
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'password'
                                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`p-2 rounded-md mr-3 ${activeTab === 'password' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                    <Key className="w-4 h-4" />
                                </div>
                                Keamanan & Password
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-8">
                    {activeTab === 'profile' && (
                        <Card className="border-0 shadow-md ring-1 ring-slate-200/50 h-full">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-xl">Detail Profil</CardTitle>
                                <CardDescription>Informasi lengkap akun pengguna sistem.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <Alert variant="info" icon={Info} className="bg-blue-50 border-blue-200 text-blue-800">
                                    Data profil (Nama, NIP, Role) dikelola oleh administrator. Hubungi admin jika terdapat kesalahan data.
                                </Alert>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                        Informasi Umum
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nama Lengkap"
                                            value={user?.full_name || ''}
                                            disabled
                                            className="bg-slate-50 border-slate-200"
                                            startIcon={<User className="w-4 h-4 text-slate-400" />}
                                        />
                                        <Input
                                            label="Role Akun"
                                            value={user?.role?.replace('_', ' ') || ''}
                                            disabled
                                            className="bg-slate-50 border-slate-200"
                                            startIcon={<Shield className="w-4 h-4 text-slate-400" />}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                        Informasi Login
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Username"
                                            value={user?.username || ''}
                                            disabled
                                            className="bg-slate-50 border-slate-200 font-mono"
                                            startIcon={<User className="w-4 h-4 text-slate-400" />}
                                        />
                                        <Input
                                            label="Nomor Induk Pegawai (NIP)"
                                            value={user?.nip || '-'}
                                            disabled
                                            className="bg-slate-50 border-slate-200 font-mono"
                                        />
                                    </div>
                                </div>

                                {user?.role === 'KUA' && user?.kecamatan && (
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                            Lokasi Tugas
                                        </h3>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-blue-600">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">KUA Kecamatan {user.kecamatan.nama}</p>
                                                <p className="text-sm text-slate-500 mt-1">Kode Satker: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{user.kecamatan.kode}</span></p>
                                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                                    <Info className="w-3 h-3" />
                                                    Anda bertugas sebagai admin untuk wilayah kecamatan ini.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'password' && (
                        <Card className="border-0 shadow-md ring-1 ring-slate-200/50 h-full">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-xl">Keamanan</CardTitle>
                                <CardDescription>Perbarui kata sandi untuk melindungi akun Anda.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {message.text && (
                                    <Alert variant={message.type} className="animate-in slide-in-from-top-2">
                                        {message.text}
                                    </Alert>
                                )}

                                <div className="flex flex-col-reverse lg:flex-row gap-8">
                                    <form onSubmit={handlePasswordSubmit} className="flex-1 space-y-5">
                                        <Input
                                            label="Password Saat Ini"
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            startIcon={<Lock className="w-4 h-4" />}
                                        />
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="w-full border-t border-slate-100"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-white px-2 text-slate-500">Ubah Password Baru</span>
                                            </div>
                                        </div>
                                        <Input
                                            label="Password Baru"
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Min. 6 karakter"
                                            startIcon={<Key className="w-4 h-4" />}
                                            helperText="Gunakan minimal 6 karakter dengan kombinasi huruf dan angka."
                                        />
                                        <Input
                                            label="Konfirmasi Password Baru"
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Ulangi password baru"
                                            startIcon={<Key className="w-4 h-4" />}
                                        />

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" loading={loading} className="w-full sm:w-auto">
                                                Simpan Perubahan
                                            </Button>
                                        </div>
                                    </form>

                                    {/* Sidebar Tips */}
                                    <div className="lg:w-72 bg-amber-50 rounded-xl p-5 border border-amber-100 h-fit">
                                        <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
                                            <Shield className="w-5 h-5" />
                                            Tips Keamanan
                                        </div>
                                        <ul className="space-y-3 text-sm text-amber-700">
                                            <li className="flex gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                                Gunakan password yang kuat (huruf besar, kecil, angka).
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                                Jangan gunakan tanggal lahir atau data pribadi yang mudah ditebak.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                                Ubah password secara berkala (min. 3 bulan sekali).
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Akun;
