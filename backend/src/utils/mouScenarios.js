/**
 * MOU Scenario Definitions
 * Complete mapping of 17 official scenarios with document requirements
 * Based on official Kemenag-Dukcapil MOU table
 */
const required_docs = [
    "BUKU_NIKAH",
    "KTP_SUAMI",
    "KTP_ISTRI",
    "KK_SUAMI",
    "KK_ISTRI",
]

const SCENARIOS = {
    1: {
        name: "Merubah Status Perkawinan, Tetap pada KK Masing-masing",
        outside_district: false,
        kk_option: "TETAP_MASING_MASING",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI"]
    },
    2: {
        name: "Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Istri",
        outside_district: false,
        kk_option: "PISAH_IKUT_ORTU_ISTRI",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103"]
    },
    3: {
        name: "Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Suami",
        outside_district: false,
        kk_option: "PISAH_IKUT_ORTU_SUAMI",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103"]
    },
    4: {
        name: "Merubah Status Perkawinan, Pisah KK dengan Alamat Baru",
        outside_district: false,
        kk_option: "PISAH_ALAMAT_BARU",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103"]
    },
    5: {
        name: "Merubah Status, Tetap pada KK Masing-masing, dan Perubahan Biodata (Pendidikan/Pekerjaan)",
        outside_district: false,
        kk_option: "TETAP_MASING_MASING",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    6: {
        name: "Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Istri, dan Perubahan Biodata",
        outside_district: false,
        kk_option: "PISAH_IKUT_ORTU_ISTRI",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "FORM_F103", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI",]
    },
    7: {
        name: "Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Suami, dan Perubahan Biodata",
        outside_district: false,
        kk_option: "PISAH_IKUT_ORTU_SUAMI",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    8: {
        name: "Merubah Status Perkawinan, Pisah KK dengan Alamat Baru, dan Perubahan Biodata",
        outside_district: false,
        kk_option: "PISAH_ALAMAT_BARU",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    9: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Tetap pada KK Masing-masing",
        outside_district: true,
        kk_option: "TETAP_MASING_MASING",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI",]
    },
    10: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Istri",
        outside_district: true,
        kk_option: "PISAH_IKUT_ORTU_ISTRI",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "SKPWNI"]
    },
    11: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Suami",
        outside_district: true,
        kk_option: "PISAH_IKUT_ORTU_SUAMI",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103"]
    },
    12: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK dengan Alamat Baru",
        outside_district: true,
        kk_option: "PISAH_ALAMAT_BARU",
        biodata_change: false,
        required_docs,
        optional_docs: ["BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103", "SKPWNI"]
    },
    13: {
        name: "(Luar Kabupaten) Merubah Status, Tetap pada KK Masing-masing, dan Perubahan Biodata",
        outside_district: true,
        kk_option: "TETAP_MASING_MASING",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI",]
    },
    14: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Istri, dan Perubahan Biodata",
        outside_district: true,
        kk_option: "PISAH_IKUT_ORTU_ISTRI",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "SKPWNI", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    15: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK Ikut Alamat Orang Tua Suami, dan Perubahan Biodata",
        outside_district: true,
        kk_option: "PISAH_IKUT_ORTU_SUAMI",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "SKPWNI", "FORM_F103", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    16: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK dengan Alamat Masuk Kabupaten, dan Perubahan Biodata",
        outside_district: true,
        kk_option: "PISAH_ALAMAT_BARU",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103", "SKPWNI", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    },
    17: {
        name: "(Luar Kabupaten) Merubah Status Perkawinan, Pisah KK dengan Alamat Baru Luar Kabupaten, dan Perubahan Biodata",
        outside_district: true,
        kk_option: "PISAH_ALAMAT_BARU",
        biodata_change: true,
        required_docs,
        optional_docs: ["SK_KERJA_SUAMI", "SK_KERJA_ISTRI", "BUKU_NIKAH_ORTU_SUAMI", "BUKU_NIKAH_ORTU_ISTRI", "FORM_F103", "FORM_F106", "IJAZAH_SUAMI", "IJAZAH_ISTRI"]
    }
};

/**
 * Get scenario details by number
 * @param {number} scenarioNumber - Scenario number (1-17)
 * @returns {object} Scenario details
 * @throws {Error} If scenario number is invalid
 */
function getScenario(scenarioNumber) {
    if (!SCENARIOS[scenarioNumber]) {
        throw new Error(`Invalid scenario number: ${scenarioNumber}`);
    }
    return SCENARIOS[scenarioNumber];
}

/**
 * Validate documents against scenario requirements
 * @param {number} scenarioNumber - Scenario number (1-17)
 * @param {Array} uploadedDocuments - Array of uploaded documents with doc_type
 * @throws {Error} If required documents are missing
 * @returns {boolean} true if validation passes
 */
function validateDocumentsForScenario(scenarioNumber, uploadedDocuments) {
    const scenario = getScenario(scenarioNumber);
    const errors = [];

    // Extract uploaded doc types
    const uploadedTypes = uploadedDocuments.map(doc => doc.doc_type);

    // Check all required docs
    for (const requiredDoc of scenario.required_docs) {
        if (!uploadedTypes.includes(requiredDoc)) {
            errors.push(`Dokumen ${requiredDoc} wajib untuk skenario ${scenarioNumber}: ${scenario.name}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Dokumen tidak lengkap: ${errors.join('; ')}`);
    }

    return true;
}

/**
 * Get list of all scenarios for dropdown
 * @returns {Array} Array of scenario objects for dropdown
 */
function getAllScenarios() {
    return Object.entries(SCENARIOS).map(([number, data]) => ({
        value: parseInt(number),
        label: `Skenario ${number}: ${data.name}`,
        outside_district: data.outside_district,
        kk_option: data.kk_option,
        biodata_change: data.biodata_change,
        required_docs: data.required_docs,
        optional_docs: data.optional_docs || []
    }));
}

/**
 * Get required documents for a specific scenario
 * @param {number} scenarioNumber - Scenario number (1-17)
 * @returns {object} Object with required_docs and optional_docs arrays
 */
function getRequiredDocuments(scenarioNumber) {
    const scenario = getScenario(scenarioNumber);
    return {
        required: scenario.required_docs,
        optional: scenario.optional_docs || []
    };
}

module.exports = {
    SCENARIOS,
    getScenario,
    validateDocumentsForScenario,
    getAllScenarios,
    getRequiredDocuments
};
