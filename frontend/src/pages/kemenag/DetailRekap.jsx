import React, { useState, useEffect, useCallback } from 'react';
import api, { ENDPOINTS } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from 'react-toastify';
import {
	BarChart3,
	Send,
	RefreshCcw,
	CheckCircle2,
	XCircle,
	FileText,
	Download
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import { useKemenagRekap } from '../../hooks/useKemenagRekap';
import { useKemenagStatistik } from '../../hooks/useKemenagStatistik';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useNavigate, useParams } from 'react-router-dom';
import { useKemenagRekapDetail } from '@/hooks/useKemenagRekapDetail';
import { useKecamatan } from '@/hooks/useKecamatan';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { getStatusBadgeVariant, getStatusLabel } from '@/services/helper';

const DetailRekap = () => {
	// Reusing the logic from LaporanKUA for now, assuming similar structure
	const { id: kecamatanUuid } = useParams();
	const { data: kecamatans } = useKecamatan()
	const [currentKecamatan, setCurrentKecamatan] = useState()
	const [stats, setStats] = useState({
		total: 0,
		submitted: 0,
		processing: 0,
		approved: 0,
		rejected: 0
	});
	const navigate = useNavigate()
	const [period, setPeriod] = useState('month');
	const { data, isLoading } = useKemenagRekapDetail(period, kecamatanUuid)
	useEffect(() => {
		if (kecamatans && kecamatans.length > 0) {
			const kec = kecamatans.find(k => k.id === kecamatanUuid)
			if (!kec) {
				toast.error('Kecamatan tidak ditemukan')
				return
			}
			setCurrentKecamatan(kec)
		}
	}, [kecamatanUuid, kecamatans])
	const periods = [
		{ id: 'week', label: '7 Hari Terakhir' },
		{ id: 'month', label: '30 Hari Terakhir' },
		{ id: 'year', label: '1 Tahun Terakhir' },
		{ id: 'all', label: 'Semua Data' },
	];

	const exportReport = async (format) => {
		try {
			toast.info(`Memproses download ${format}...`);
			const response = await api.get(`${ENDPOINTS.REPORT_EXPORT}/kemenag?format=${format.toLowerCase()}&period=${period}&kecamatan=${currentKecamatan.id}`, {
				responseType: 'blob'
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			const extension = format.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx';
			link.setAttribute('download', `Laporan_Kemenag_${periods.find(p => p.id === period).label}_${new Date().toISOString().split('T')[0]}.${extension}`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			toast.success(`Laporan ${format} berhasil diunduh!`);
		} catch (error) {
			console.error('Export failed', error);
			toast.error(`Gagal mengunduh laporan ${format}. Silakan coba lagi.`);
		}
	};

	if (isLoading) return <Loading />;
	if (!currentKecamatan) return <></>
	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-display font-bold text-slate-900">Detail Laporan Statistik KUA {currentKecamatan.nama}</h1>
					<p className="mt-1 text-sm text-slate-500">
						Monitoring data pengajuan nikah lintas wilayah.
					</p>
				</div>

				{/* Period Switcher */}
				<div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
					{periods.map((p) => (
						<button
							key={p.id}
							onClick={() => setPeriod(p.id)}
							className={`
                                px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
                                ${period === p.id
									? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
									: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
								}
                            `}
						>
							{p.label}
						</button>
					))}
				</div>
			</div>

			{/* Statistics Grid */}
			{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<StatCard
					title="Total Pengajuan"
					value={stats.total}
					gradient="bg-gradient-to-br from-slate-700 to-slate-900"
					icon={BarChart3}
				/>
				<StatCard
					title="Menunggu"
					value={stats.submitted}
					gradient="bg-gradient-to-br from-blue-500 to-blue-700"
					icon={Send}
				/>
				<StatCard
					title="Diproses"
					value={stats.processing}
					gradient="bg-gradient-to-br from-violet-500 to-violet-700"
					icon={RefreshCcw}
				/>
				<StatCard
					title="Disetujui"
					value={stats.approved}
					gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
					icon={CheckCircle2}
				/>
				<StatCard
					title="Ditolak/Revisi"
					value={stats.rejected}
					gradient="bg-gradient-to-br from-rose-500 to-rose-700"
					icon={XCircle}
				/>
			</div> */}
			<div className="rounded-md border border-slate-200">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>No. Tiket</TableHead>
							<TableHead>KUA</TableHead>
							<TableHead>Nama Pasangan</TableHead>
							<TableHead>Tanggal</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Catatan</TableHead>
							<TableHead className="text-right">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8">
									<div className="flex justify-center items-center gap-2">
										<div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
										<span className="text-sm text-slate-500">Memuat data...</span>
									</div>
								</TableCell>
							</TableRow>
						) : data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}>
									<EmptyState
										title="Tidak ada data"
										description={''}
										icon={FileText}
									/>
								</TableCell>
							</TableRow>
						) : (
							data.map((sub) => {
								let rejectionNote = '-';
								if (sub.status === 'REJECTED' || sub.status === 'NEEDS_REVISION') {
									const log = sub.logs?.filter(l => l.new_status === 'REJECTED' || l.new_status === 'NEEDS_REVISION')
										.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
									if (log) rejectionNote = log.notes;
								}
								const href = `/kemenag/rekap/${currentKecamatan.id}/${sub.id}`
								return (
									<TableRow key={sub.id}>
										<TableCell className="font-medium text-primary-600" >
											<a href={href}>
												#{sub.ticket_number}
											</a>
										</TableCell>
										<TableCell className="font-medium">
											{sub.creator.kecamatan.nama}
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

											<Button
												variant="ghost"
												size="sm"
												onClick={() => navigate(href)}
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
			{/* Export Section */}
			<Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-100">
				<CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 ring-1 ring-blue-100">
							<FileText className="w-6 h-6" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-slate-900">Export Laporan</h3>
							<p className="text-sm text-slate-600 mt-1 max-w-lg">
								Unduh laporan lengkap dalam format PDF atau Excel.
							</p>
						</div>
					</div>
					<div className="flex gap-3 w-full md:w-auto">
						<Button
							variant="outline"
							className="w-full md:w-auto bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
							onClick={() => exportReport('PDF')}
						>
							<Download className="w-4 h-4 mr-2" />
							Unduh PDF
						</Button>
						<Button
							variant="outline"
							className="w-full md:w-auto bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
							onClick={() => exportReport('Excel')}
						>
							<Download className="w-4 h-4 mr-2" />
							Unduh Excel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DetailRekap;
