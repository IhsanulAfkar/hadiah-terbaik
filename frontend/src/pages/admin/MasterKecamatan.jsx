import React, { useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const MasterKecamatan = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode: '', nama: '' });

    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.ADMIN_DISTRICTS);
            if (res.data.success) {
                setDistricts(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil data kecamatan');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus kecamatan ini?')) return;
        try {
            await api.delete(ENDPOINTS.ADMIN_DISTRICT_DETAIL(id));
            toast.success('Kecamatan dihapus');
            fetchDistricts();
        } catch {
            toast.error('Gagal menghapus kecamatan');
        }
    };

    const handleEdit = (district) => {
        setFormData(district);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ id: null, kode: '', nama: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (formData.id) {
                await api.put(ENDPOINTS.ADMIN_DISTRICT_DETAIL(formData.id), formData);
                toast.success('Kecamatan diupdate');
            } else {
                await api.post(ENDPOINTS.ADMIN_DISTRICTS, formData);
                toast.success('Kecamatan ditambahkan');
            }
            setShowModal(false);
            fetchDistricts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setProcessing(false);
        }
    };

    const filteredDistricts = districts.filter(d =>
        d.nama.toLowerCase().includes(search.toLowerCase()) ||
        d.kode.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Data Kecamatan</h1>
                    <p className="text-slate-500 mt-1">Kelola data referensi wilayah kecamatan.</p>
                </div>
                <Button onClick={handleAdd} icon={Plus}>
                    Tambah Kecamatan
                </Button>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="w-full md:max-w-lg">
                        <Input
                            placeholder="Cari kecamatan (Nama, Kode)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            startIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode Wilayah</TableHead>
                            <TableHead>Nama Kecamatan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">Memuat data...</TableCell>
                            </TableRow>
                        ) : filteredDistricts.length === 0 ? (
                            <TableEmpty colSpan={3} message="Tidak ada data ditemukan" />
                        ) : (
                            filteredDistricts.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-mono text-slate-600">
                                        {d.kode}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        {d.nama}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(d)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? 'Edit Kecamatan' : 'Tambah Kecamatan'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button onClick={handleSubmit} loading={processing}>Simpan</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Kode Kecamatan"
                        value={formData.kode}
                        onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                        required
                        placeholder="Contoh: 32.01.01"
                    />
                    <Input
                        label="Nama Kecamatan"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        required
                        placeholder="Contoh: Cibinong"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default MasterKecamatan;
