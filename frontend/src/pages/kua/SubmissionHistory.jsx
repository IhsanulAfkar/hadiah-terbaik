import React, { useEffect, useState } from 'react';
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
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Search, CheckCircle2 } from 'lucide-react';

const SubmissionHistory = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await api.get('/submissions/my');
                const data = res.data.data;
                if (Array.isArray(data)) {
                    // Filter FINISHED: Approved only (History shows completed items)
                    const finished = data.filter(s => s.status === 'APPROVED');
                    setSubmissions(finished);
                    setFilteredSubmissions(finished);
                } else {
                    setSubmissions([]);
                    setFilteredSubmissions([]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    useEffect(() => {
        let filtered = [...submissions];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(sub =>
                sub.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.data_pernikahan?.husband_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.data_pernikahan?.wife_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredSubmissions(filtered);
        setCurrentPage(1);
    }, [submissions, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-slate-900">Riwayat Pengajuan</h1>
                <p className="text-sm text-slate-500">
                    Daftar pengajuan pernikahan yang telah disetujui dan selesai diproses.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="w-full md:max-w-lg mb-6">
                    <Input
                        placeholder="Cari No. Tiket atau Nama Pasangan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startIcon={<Search className="w-4 h-4" />}
                    />
                </div>

                <div className="rounded-md border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Tiket</TableHead>
                                <TableHead>KUA</TableHead>
                                <TableHead>Nama Pasangan</TableHead>
                                <TableHead>Tanggal Pengajuan</TableHead>
                                <TableHead>Tanggal Disetujui</TableHead>
                                <TableHead>Status</TableHead>
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
                                            title="Tidak ada riwayat"
                                            description={searchQuery ? "Tidak ditemukan data yang cocok." : "Belum ada pengajuan yang selesai."}
                                            icon={CheckCircle2}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((sub) => {
                                    // Get approval date from logs
                                    const approvalLog = sub.logs?.find(l => l.new_status === 'APPROVED');
                                    const approvalDate = approvalLog ? new Date(approvalLog.created_at) : null;

                                    return (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium text-primary-600" >
                                                <a href={`/kua/submission/${sub.id}`}>
                                                    #{sub.ticket_number}
                                                </a>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {sub.creator.kecamatan.nama}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900">
                                                    {sub.data_pernikahan?.husband_name} & {sub.data_pernikahan?.wife_name}
                                                </div>
                                                <div className="text-xs text-slate-500">{sub.data_pernikahan?.kecamatan || 'N/A'}</div>
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
                                                {approvalDate ? (
                                                    <>
                                                        <div className="text-sm text-slate-600">
                                                            {approvalDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {approvalDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </>
                                                ) : <span className="text-slate-400">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">Disetujui</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
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

export default SubmissionHistory;
