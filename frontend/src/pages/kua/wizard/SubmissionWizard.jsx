import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Step1Data from './Step1Data';
import Step2Docs from './Step2Docs';
import Step3Review from './Step3Review';
import Stepper from '../../../components/ui/Stepper';
import Button from '../../../components/ui/Button';
import { ChevronLeft } from 'lucide-react';

const SubmissionWizard = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const { user } = useAuth(); // Get logged-in user
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingDocuments, setExistingDocuments] = useState([]);

    // State 1: Data Pernikahan & Kontak
    const [formData, setFormData] = useState({
        husband_name: '',
        husband_nik: '',
        hp_suami: '',
        email_suami: '',
        wife_name: '',
        wife_nik: '',
        hp_istri: '',
        email_istri: '',
        marriage_date: '',
        marriage_time: '',
        marriage_location: '',
        marriage_book_no: '',
        kode_kecamatan: user?.kecamatan?.kode || user?.kode_kecamatan || '', // Auto-filled
        notes: '',

        // MOU Scenario Selection (1-17)
        mou_scenario: null,

        // Deprecated - keeping for backwards compatibility with old submissions
        is_pindah: false,
        is_job_change: false
    });

    // State 2: Files
    const [files, setFiles] = useState({
        // Standard fields... initialized as null
        kk_suami: null,
        kk_istri: null,
        form_f106: null,
        ijazah_suami: null,
        ijazah_istri: null,
        akta_lahir_suami: null,
        akta_lahir_istri: null,
        buku_nikah_suami: null,
        buku_nikah_istri: null,
        // Parent documents - SPLIT
        buku_nikah_ortu_suami: null,
        buku_nikah_ortu_istri: null,
        // Conditional
        form_f103: null,
        skpwni: null,
        sk_kerja_suami: null,
        sk_kerja_istri: null,
        ktp_suami: null,
        ktp_istri: null,
    });

    const fetchSubmission = useCallback(async (subId) => {
        try {
            setLoading(true);
            const res = await api.get(`/submissions/${subId}`);
            const data = res.data.data;
            const dp = data.data_pernikahan;

            // Populate Form Data
            setFormData({
                husband_name: dp.husband_name || '',
                husband_nik: dp.husband_nik || '',
                hp_suami: dp.hp_suami || '',
                email_suami: dp.email_suami || '',
                wife_name: dp.wife_name || '',
                wife_nik: dp.wife_nik || '',
                hp_istri: dp.hp_istri || '',
                email_istri: dp.email_istri || '',
                marriage_date: dp.marriage_date ? dp.marriage_date.split('T')[0] : '', // ISO to YYYY-MM-DD
                marriage_time: dp.marriage_time || '',
                marriage_location: dp.marriage_location || '',
                marriage_book_no: dp.marriage_book_no || '',
                kode_kecamatan: dp.kode_kecamatan || user?.kecamatan?.kode || user?.kode_kecamatan || '',
                notes: dp.notes || '',

                // MOU Scenario
                mou_scenario: dp.mou_scenario || null,

                // Determine toggles from document presence (for old submissions)
                is_pindah: data.dokumen.some(d => ['FORM_F103', 'SKPWNI'].includes(d.doc_type)),
                is_job_change: data.dokumen.some(d => ['SK_KERJA_SUAMI', 'SK_KERJA_ISTRI'].includes(d.doc_type))
            });

            // Store existing documents for optional re-upload
            setExistingDocuments(data.dokumen || []);

            // Populate Files (Mock objects for display)
            const fileMap = {};
            data.dokumen.forEach(doc => {
                const key = doc.doc_type.toLowerCase(); // Map ENUM back to keys if keys match
                fileMap[key] = {
                    name: doc.file_name,
                    size: doc.file_size,
                    existing: true, // Marker to avoid re-upload
                    type: doc.mime_type
                };
            });
            setFiles(prev => ({ ...prev, ...fileMap }));

        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Gagal memuat data yang ada');
            navigate('/kua/submissions/active');
        } finally {
            setLoading(false);
        }
    }, [navigate, user]);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchSubmission(id);
        }
    }, [id, fetchSubmission]);


    // Handlers
    const handleDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmission = async (shouldSubmitToOperator = false) => {
        setLoading(true);
        try {
            const payload = new FormData();

            // Prepare data with proper types
            // Clean unused variables from destructuring to satisfy lint
            const submitData = { ...formData };
            delete submitData.is_pindah;
            delete submitData.is_job_change;

            const cleanData = {
                ...submitData,
                marriage_date: new Date(formData.marriage_date).toISOString()
            };

            payload.append('data_pernikahan', JSON.stringify(cleanData));

            // Append Files dynamically - ONLY IF IT IS A REAL FILE (not existing mock)
            Object.keys(files).forEach(key => {
                const file = files[key];
                if (file && file instanceof File) {
                    payload.append(key, file);
                }
            });

            let submissionId = id; // Default to current ID for edit mode

            if (isEditMode) {
                await api.put(`/submissions/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (!shouldSubmitToOperator) toast.success('Draft diperbarui!');
            } else {
                const response = await api.post('/submissions', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                submissionId = response.data.data.id;
                if (!shouldSubmitToOperator) toast.success('Draft disimpan!', { icon: "💾" });
            }

            // Explicity Submit if requested
            if (shouldSubmitToOperator) {
                await api.post(`/kua/submissions/${submissionId}/submit`);
                toast.success('Pengajuan dikirim ke Dukcapil!', { icon: "🚀" });
            }

            navigate('/kua/submissions/active');
        } catch (error) {
            console.error(error);
            const errorMessage = error.userMessage || error.response?.data?.message || 'Proses Gagal. Silakan coba lagi.';
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const steps = [
        { label: 'Data Nikah' },
        { label: 'Dokumen' },
        { label: 'Tinjauan' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Button variant="ghost" className="mb-2 -ml-2 pl-2" onClick={() => navigate('/kua/submissions/active')}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-display font-bold text-slate-900">
                        {isEditMode ? 'Ubah Pengajuan' : 'Pengajuan Nikah Baru'}
                    </h1>
                    <p className="text-sm text-slate-500">Lengkapi data pernikahan dan dokumen pendukung.</p>
                </div>
            </div>

            <Stepper steps={steps} currentStep={step} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
                {step === 1 && (
                    <Step1Data
                        formData={formData}
                        handleChange={handleDataChange}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <Step2Docs
                        files={files}
                        handleFileChange={handleFileChange}
                        onNext={() => setStep(3)}
                        onPrev={() => setStep(1)}
                        mouScenario={formData.mou_scenario}
                    />
                )}

                {step === 3 && (
                    <Step3Review
                        formData={formData}
                        files={files}
                        onPrev={() => setStep(2)}
                        onSaveDraft={() => handleSubmission(false)}
                        onSubmit={() => handleSubmission(true)}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default SubmissionWizard;

