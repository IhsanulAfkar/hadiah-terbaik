import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Search, FileText } from 'lucide-react';

const SubmissionList = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchSubmissions = useCallback(async () => {
        try {
            const res = await api.get('/submissions/my');
            const data = res.data.data;
            if (Array.isArray(data)) {
                //Filter ACTIVE: Draft, Submitted, Processing, Rejected/Revision (needs action)
                const activeStatuses = ['DRAFT', 'SUBMITTED', 'PROCESSING', 'REJECTED', 'NEEDS_REVISION'];
                const active = data.filter(s => activeStatuses.includes(s.status));
                setSubmissions(active);
                setFilteredSubmissions(active);
            } else {
                setSubmissions([]);
                setFilteredSubmissions([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filterSubmissions = useCallback(() => {
        let filtered = [...submissions];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(sub =>
                sub.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.data_pernikahan?.husband_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.data_pernikahan?.wife_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter && statusFilter !== 'ALL') {
            filtered = filtered.filter(sub => sub.status === statusFilter);
        }

        setFilteredSubmissions(filtered);
        setCurrentPage(1); // Reset to first page
    }, [submissions, searchQuery, statusFilter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useEffect(() => {
        filterSubmissions();
    }, [filterSubmissions]);

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'danger';
            case 'NEEDS_REVISION': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SUBMITTED': return 'default';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'APPROVED': return 'Disetujui';
            case 'REJECTED': return 'Ditolak';
            case 'NEEDS_REVISION': return 'Perlu Revisi';
            case 'PROCESSING': return 'Diproses';
            case 'SUBMITTED': return 'Terkirim';
            case 'DRAFT': return 'Draft';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Pengajuan Aktif</h1>
                    <p className="text-sm text-slate-500">Kelola daftar pendaftaran pernikahan yang sedang berjalan.</p>
                </div>
                <Button onClick={() => navigate('/kua/submission/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Pengajuan Baru
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
                    <div className="w-full md:max-w-lg">
                        <Input
                            placeholder="Cari No. Tiket atau Nama Pasangan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'DRAFT', label: 'Draft' },
                                { value: 'SUBMITTED', label: 'Terkirim' },
                                { value: 'PROCESSING', label: 'Diproses' },
                                { value: 'NEEDS_REVISION', label: 'Perlu Revisi' },
                                { value: 'REJECTED', label: 'Ditolak' },
                            ]}
                        />
                    </div>
                </div>

                <div className="rounded-md border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Tiket</TableHead>
                                <TableHead>Nama Pasangan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Catatan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                                            <span className="text-sm text-slate-500">Memuat data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            title="Tidak ada data"
                                            description={searchQuery || statusFilter ? "Tidak ditemukan data yang cocok dengan filter pencarian." : "Belum ada pengajuan aktif saat ini."}
                                            icon={FileText}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((sub) => {
                                    let rejectionNote = '-';
                                    if (sub.status === 'REJECTED' || sub.status === 'NEEDS_REVISION') {
                                        const log = sub.logs?.filter(l => l.new_status === 'REJECTED' || l.new_status === 'NEEDS_REVISION')
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                                        if (log) rejectionNote = log.notes;
                                    }

                                    return (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium text-primary-600">
                                                #{sub.ticket_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{sub.data_pernikahan?.husband_name}</div>
                                                <div className="text-xs text-slate-500">& {sub.data_pernikahan?.wife_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-slate-600">
                                                    {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(sub.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(sub.status)}>
                                                    {getStatusLabel(sub.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-slate-500">
                                                {rejectionNote}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {['DRAFT', 'REJECTED', 'NEEDS_REVISION'].includes(sub.status) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/kua/submission/edit/${sub.id}`)}
                                                    >
                                                        {sub.status === 'DRAFT' ? 'Edit' : 'Perbaiki'}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/kua/submission/${sub.id}`)}
                                                >
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {!loading && filteredSubmissions.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        hasNext={currentPage < totalPages}
                        hasPrev={currentPage > 1}
                    />
                )}
            </div>
        </div>
    );
};

export default SubmissionList;
