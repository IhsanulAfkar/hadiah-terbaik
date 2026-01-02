import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import ScenarioSelector from '../../../components/ScenarioSelector';

const Step1Data = ({ formData, handleChange, onNext }) => {
    const [errors, setErrors] = useState({});

    const validateNIK = (nik) => {
        return /^\d{16}$/.test(nik);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!validateNIK(formData.husband_nik)) {
            newErrors.husband_nik = 'NIK harus 16 digit angka';
        }
        if (!validateNIK(formData.wife_nik)) {
            newErrors.wife_nik = 'NIK harus 16 digit angka';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const onSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onNext();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            <h2 className="text-xl font-bold font-display text-slate-800">Langkah 1: Data Pernikahan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Husband Section */}
                <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">♂</span>
                        Data Suami
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Lengkap"
                            name="husband_name"
                            value={formData.husband_name}
                            onChange={handleChange}
                            required
                            placeholder="Sesuai KTP"
                        />
                        <Input
                            label="NIK (16 Digit)"
                            name="husband_nik"
                            value={formData.husband_nik}
                            onChange={handleChange}
                            maxLength="16"
                            required
                            error={errors.husband_nik}
                            placeholder="3519xxxxxxxxxxxx"
                        />
                        <Input
                            label="Nomor HP"
                            type="tel"
                            name="hp_suami"
                            value={formData.hp_suami}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                        />
                        <Input
                            label="Email (Opsional)"
                            type="email"
                            name="email_suami"
                            value={formData.email_suami}
                            onChange={handleChange}
                            placeholder="email@contoh.com"
                        />
                    </div>
                </div>

                {/* Wife Section */}
                <div className="md:col-span-2 bg-pink-50/50 p-6 rounded-xl border border-pink-100">
                    <h3 className="font-semibold text-pink-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-2 text-pink-600">♀</span>
                        Data Istri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Lengkap"
                            name="wife_name"
                            value={formData.wife_name}
                            onChange={handleChange}
                            required
                            placeholder="Sesuai KTP"
                        />
                        <Input
                            label="NIK (16 Digit)"
                            name="wife_nik"
                            value={formData.wife_nik}
                            onChange={handleChange}
                            maxLength="16"
                            required
                            error={errors.wife_nik}
                            placeholder="3519xxxxxxxxxxxx"
                        />
                        <Input
                            label="Nomor HP"
                            type="tel"
                            name="hp_istri"
                            value={formData.hp_istri}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                        />
                        <Input
                            label="Email (Opsional)"
                            type="email"
                            name="email_istri"
                            value={formData.email_istri}
                            onChange={handleChange}
                            placeholder="email@contoh.com"
                        />
                    </div>
                </div>

                {/* Marriage Details */}
                <div className="md:col-span-2 border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Informasi Pernikahan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Tanggal Nikah"
                            type="date"
                            name="marriage_date"
                            value={formData.marriage_date}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Waktu Nikah"
                            type="time"
                            name="marriage_time"
                            value={formData.marriage_time}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Lokasi Nikah (Alamat)"
                                name="marriage_location"
                                value={formData.marriage_location}
                                onChange={handleChange}
                                placeholder="Contoh: Masjid Agung, Jl. Sudirman No.1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Input
                                label="Nomor Buku Nikah (No. Akta)"
                                name="marriage_book_no"
                                value={formData.marriage_book_no}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: 123/NK/2025"
                            />
                        </div>

                        {/* Kode Kecamatan is auto-filled from user account - hidden field */}
                        <input type="hidden" name="kode_kecamatan" value={formData.kode_kecamatan} />
                    </div>
                </div>

                {/* MOU Scenario Selection */}
                <div className="md:col-span-2 border-t border-slate-200 pt-6">
                    <ScenarioSelector
                        value={formData.mou_scenario}
                        onChange={(value) => handleChange({ target: { name: 'mou_scenario', value } })}
                    />

                    {/* H-1 Rule Warning */}
                    {formData.marriage_date && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start">
                                <span className="text-amber-600 mr-2 text-xl">⚠️</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Perhatian: Aturan H-1</p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Pengajuan harus dibuat minimal <strong>1 hari sebelum</strong> tanggal akad nikah.
                                        Sesuai MOU Kemenag-Dukcapil Pasal 5 Ayat 2.
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        Tanggal nikah: <strong>{new Date(formData.marriage_date).toLocaleDateString('id-ID')}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan untuk Dukcapil (Opsional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tambahkan catatan jika ada hal khusus..."
                    ></textarea>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit">Lanjut</Button>
            </div>
        </form>
    );
};

export default Step1Data;
