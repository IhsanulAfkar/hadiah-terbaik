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
import { useNavigate } from 'react-router-dom';

const DetailRekap = () => {
	// Reusing the logic from LaporanKUA for now, assuming similar structure
	const [stats, setStats] = useState({
		total: 0,
		submitted: 0,
		processing: 0,
		approved: 0,
		rejected: 0
	});
	const navigate = useNavigate()
	const [period, setPeriod] = useState('month');
	const { data, isLoading } = useKemenagRekap(period)
	const { data: dataStatistik } = useKemenagStatistik(period)
	useEffect(() => {
		if (dataStatistik) {
			const statistik = dataStatistik.performance_indicators
			setStats({
				approved: statistik.approved,
				rejected: statistik.rejected,
				submitted: statistik.pending,
				processing: statistik.in_process,
				total: (statistik.approved + statistik.rejected + statistik.pending + statistik.in_process)
			})
		}
	}, [dataStatistik])
	const periods = [
		{ id: 'week', label: '7 Hari Terakhir' },
		{ id: 'month', label: '30 Hari Terakhir' },
		{ id: 'year', label: '1 Tahun Terakhir' },
		{ id: 'all', label: 'Semua Data' },
	];

	const exportReport = async (format) => {
		try {
			toast.info(`Memproses download ${format}...`);
			const response = await api.get(`${ENDPOINTS.REPORT_EXPORT}?format=${format.toLowerCase()}&period=${period}`, {
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

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-display font-bold text-slate-900">Laporan Statistik (Kemenag)</h1>
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
			</div>
			<div className="rounded-md border border-slate-200">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>KUA</TableHead>
							<TableHead>Pending</TableHead>
							<TableHead>Diproses</TableHead>
							<TableHead>Disetujui</TableHead>
							<TableHead>Ditolak</TableHead>
							<TableHead>Total</TableHead>
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
						) : data?.length === 0 ? (
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
							data?.map((sub, idx) => {
								// Get approval date from logs

								return (
									<TableRow key={idx}>
										<TableCell className="font-medium" >
											{sub.kecamatan_name}
										</TableCell>
										<TableCell className="font-medium">
											{sub.pending_verification}
										</TableCell>
										<TableCell className="font-medium">
											{sub.processing}
										</TableCell>
										<TableCell className="font-medium">
											{sub.approved}
										</TableCell>
										<TableCell className="font-medium">
											{sub.rejected}
										</TableCell>
										<TableCell className="font-medium">
											{sub.total}
										</TableCell>

										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => navigate(`/kemenag/rekap/${sub.kecamatan_id}`)}
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
