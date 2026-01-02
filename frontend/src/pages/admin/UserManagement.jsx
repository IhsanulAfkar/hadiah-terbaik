import React, { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { Plus, Edit2, Trash2, Search, MapPin, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({ id: null, full_name: '', username: '', nip: '', role: 'KUA', password: '', kecamatan_id: '' });

    useEffect(() => {
        fetchUsers();
        fetchDistricts();
    }, [currentPage, search, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${ENDPOINTS.ADMIN_USERS}?page=${currentPage}&limit=10&search=${search}&role=${roleFilter}`);
            if (res.data.success) {
                setUsers(res.data.data);
                if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data user');
        } finally {
            setLoading(false);
        }
    };

    const fetchDistricts = async () => {
        try {
            const res = await api.get(ENDPOINTS.ADMIN_DISTRICTS);
            if (res.data.success) {
                setDistricts(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch districts', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            await api.delete(ENDPOINTS.ADMIN_USER_DETAIL(id));
            toast.success('User berhasil dihapus');
            fetchUsers();
        } catch (error) {
            toast.error(error.message || 'Gagal menghapus user');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            ...user,
            password: '',
            kecamatan_id: user.kecamatan_id || ''
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ id: null, full_name: '', username: '', nip: '', role: 'KUA', password: '', kecamatan_id: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission if triggered by form element (though we use Button onClick)
        setProcessing(true);
        try {
            const payload = { ...formData };
            if (payload.role !== 'KUA') {
                payload.kecamatan_id = null;
            }

            if (formData.id) {
                await api.put(ENDPOINTS.ADMIN_USER_DETAIL(formData.id), payload);
                toast.success('User berhasil diupdate');
            } else {
                await api.post(ENDPOINTS.ADMIN_USERS, payload);
                toast.success('User baru berhasil dibuat');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan user');
        } finally {
            setProcessing(false);
        }
    };

    const roleOptions = [
        { value: 'KUA', label: 'KUA (Kecamatan)' },
        { value: 'OPERATOR_DUKCAPIL', label: 'Operator Dukcapil' },
        { value: 'VERIFIKATOR_DUKCAPIL', label: 'Verifikator Dukcapil' },
        { value: 'KEMENAG', label: 'Kementrian Agama' },
        { value: 'ADMIN', label: 'Administrator' }
    ];

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'ADMIN': return 'secondary';
            case 'KUA': return 'success';
            case 'OPERATOR_DUKCAPIL': return 'info';
            case 'VERIFIKATOR_DUKCAPIL': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
                    <p className="text-slate-500 mt-1">Kelola akun dan hak akses pengguna aplikasi.</p>
                </div>
                <Button onClick={handleAdd} icon={Plus}>
                    Tambah User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:max-w-lg">
                        <Input
                            placeholder="Cari user (Nama, NIP, Username)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            startIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Semua Filter Role</option>
                            {roleOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Unit Kerja</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableEmpty colSpan={4} message="Tidak ada user ditemukan" />
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{user.full_name}</div>
                                                <div className="text-xs text-slate-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {roleOptions.find(r => r.value === user.role)?.label || user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-slate-600">
                                            {user.role === 'KUA' && user.kecamatan ? (
                                                <>
                                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                                    KUA Kec. {user.kecamatan.nama}
                                                </>
                                            ) : (user.role.includes('DUKCAPIL')) ? (
                                                <>
                                                    <Shield className="w-4 h-4 mr-2 text-slate-400" />
                                                    Disdukcapil
                                                </>
                                            ) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            {user.role !== 'ADMIN' && (
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {!loading && users.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        hasNext={currentPage < totalPages}
                        hasPrev={currentPage > 1}
                    />
                )}
            </Card>

            {/* Modal Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? 'Edit User' : 'Tambah User Baru'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button onClick={handleSubmit} loading={processing}>Simpan</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        placeholder="Contoh: Budi Santoso"
                    />
                    <Input
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        placeholder="Username untuk login"
                    />
                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        {roleOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>

                    {formData.role === 'KUA' && (
                        <Select
                            label="Wilayah KUA (Kecamatan)"
                            error={!formData.kecamatan_id && formData.role === 'KUA' ? 'Wajib dipilih' : ''}
                            value={formData.kecamatan_id}
                            onChange={(e) => setFormData({ ...formData, kecamatan_id: e.target.value })}
                        >
                            <option value="">-- Pilih Kecamatan --</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{`${d.nama} (${d.kode})`}</option>
                            ))}
                        </Select>
                    )}

                    <Input
                        label="NIP (Opsional)"
                        value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        placeholder="Nomor Induk Pegawai"
                    />
                    <Input
                        label={formData.id ? 'Password Baru (Kosongkan jika tetap)' : 'Password'}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!formData.id}
                        placeholder={formData.id ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
