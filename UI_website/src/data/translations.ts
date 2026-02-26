// ================================
// Multi-language Translations
// Citizen Portal (PublicHome)
// ================================

export type Language = 'en' | 'kn' | 'mr' | 'hi';

interface TranslationSet {
    title: string;
    subtitle: string;
    district: string;
    taluka: string;
    village: string;
    selectDistrict: string;
    selectTaluka: string;
    selectArea: string;
    noAreas: string;
    loading: string;
    totalBins: string;
    serviceWards: string;
    statusLive: string;
    adminLogin: string;
    citizenPortal: string;
    reportIssue: string;
    complaintType: string;
    description: string;
    yourName: string;
    contactNumber: string;
    submit: string;
    cancel: string;
    selectType: string;
    overflowing: string;
    damagedLid: string;
    badSmell: string;
    missingBin: string;
    other: string;
    complaintSuccess: string;
    language: string;
    tapBinInstruction: string;
}

const translations: Record<Language, TranslationSet> = {
    en: {
        title: "Waste Management Map",
        subtitle: "Select your village to see live bin locations.",
        district: "District",
        taluka: "Taluka",
        village: "Village / Area",
        selectDistrict: "Select District",
        selectTaluka: "Select Taluka",
        selectArea: "Select Area",
        noAreas: "No active areas in this taluka",
        loading: "Loading Map Data...",
        totalBins: "Total Bins",
        serviceWards: "Service Wards",
        statusLive: "● Live",
        adminLogin: "Admin Login",
        citizenPortal: "Citizen Portal",
        reportIssue: "Report Issue",
        complaintType: "Issue Type",
        description: "Description",
        yourName: "Your Name",
        contactNumber: "Contact Number",
        submit: "Submit",
        cancel: "Cancel",
        selectType: "Select issue type",
        overflowing: "Overflowing",
        damagedLid: "Damaged Lid",
        badSmell: "Bad Smell",
        missingBin: "Missing Bin",
        other: "Other",
        complaintSuccess: "Complaint submitted! Thank you.",
        language: "Language",
        tapBinInstruction: "Tap a bin on the map to report an issue, or use the button below"
    },
    kn: {
        title: "कचरो वेवस्थापन नकशो",
        subtitle: "तुमचें गांव निवडात जिवे डबे पळोवचे.",
        district: "जिल्लो",
        taluka: "तालुको",
        village: "गांव / वाठार",
        selectDistrict: "जिल्लो निवडात",
        selectTaluka: "तालुको निवडात",
        selectArea: "वाठार निवडात",
        noAreas: "ह्या तालुक्यांत सेवा ना",
        loading: "नकशो लोड जाता...",
        totalBins: "एकूण डबे",
        serviceWards: "सेवा वॉर्ड",
        statusLive: "● चालू",
        adminLogin: "प्रशासक लॉगिन",
        citizenPortal: "नागरिक पोर्टल",
        reportIssue: "तक्रार नोंदयात",
        complaintType: "समस्या प्रकार",
        description: "वर्णन",
        yourName: "तुमचें नांव",
        contactNumber: "संपर्क नंबर",
        submit: "सादर करात",
        cancel: "रद्द करात",
        selectType: "समस्या प्रकार निवडात",
        overflowing: "भरून व्हांवता",
        damagedLid: "झाकण मोडलां",
        badSmell: "घाण वास",
        missingBin: "डबो ना",
        other: "हेर",
        complaintSuccess: "तक्रार नोंद जाली! धन्यवाद.",
        language: "भास",
        tapBinInstruction: "नकश्यार डबो दामून तक्रार नोंदयात"
    },
    mr: {
        title: "कचरा व्यवस्थापन नकाशा",
        subtitle: "तुमचे गाव निवडा आणि कचराकुंड्या पहा.",
        district: "जिल्हा",
        taluka: "तालुका",
        village: "गाव / भाग",
        selectDistrict: "जिल्हा निवडा",
        selectTaluka: "तालुका निवडा",
        selectArea: "भाग निवडा",
        noAreas: "या तालुक्यात सेवा नाही",
        loading: "नकाशा लोड होत आहे...",
        totalBins: "एकूण कुंड्या",
        serviceWards: "सेवा वॉर्ड",
        statusLive: "● चालू",
        adminLogin: "प्रशासक लॉगिन",
        citizenPortal: "नागरिक पोर्टल",
        reportIssue: "तक्रार नोंदवा",
        complaintType: "समस्या प्रकार",
        description: "वर्णन",
        yourName: "तुमचे नाव",
        contactNumber: "संपर्क क्रमांक",
        submit: "सबमिट करा",
        cancel: "रद्द करा",
        selectType: "समस्या प्रकार निवडा",
        overflowing: "ओसंडून वाहत आहे",
        damagedLid: "झाकण तुटले",
        badSmell: "दुर्गंधी",
        missingBin: "कुंडी गहाळ",
        other: "इतर",
        complaintSuccess: "तक्रार नोंद झाली! धन्यवाद.",
        language: "भाषा",
        tapBinInstruction: "नकाशावर कुंडी दाबा तक्रार नोंदवा"
    },
    hi: {
        title: "कचरा प्रबंधन मानचित्र",
        subtitle: "अपना गाँव चुनें और कूड़ेदानों का स्थान देखें.",
        district: "जिला",
        taluka: "तालुका",
        village: "गाँव / क्षेत्र",
        selectDistrict: "जिला चुनें",
        selectTaluka: "तालुका चुनें",
        selectArea: "क्षेत्र चुनें",
        noAreas: "इस तालुके में सेवा उपलब्ध नहीं",
        loading: "मानचित्र लोड हो रहा है...",
        totalBins: "कुल कूड़ेदान",
        serviceWards: "सेवा वार्ड",
        statusLive: "● चालू",
        adminLogin: "प्रशासक लॉगिन",
        citizenPortal: "नागरिक पोर्टल",
        reportIssue: "शिकायत दर्ज करें",
        complaintType: "समस्या प्रकार",
        description: "विवरण",
        yourName: "आपका नाम",
        contactNumber: "संपर्क नंबर",
        submit: "जमा करें",
        cancel: "रद्द करें",
        selectType: "समस्या प्रकार चुनें",
        overflowing: "ओवरफ्लो हो रहा है",
        damagedLid: "ढक्कन टूटा",
        badSmell: "बदबू",
        missingBin: "कूड़ेदान गायब",
        other: "अन्य",
        complaintSuccess: "शिकायत दर्ज हुई! धन्यवाद.",
        language: "भाषा",
        tapBinInstruction: "नक्शे पर कूड़ेदान दबाएं शिकायत दर्ज करें"
    }
};

export function getTranslations(lang: Language): TranslationSet {
    return translations[lang] || translations.en;
}

export const languageNames: Record<Language, string> = {
    en: "English",
    kn: "कोंकणी",
    mr: "मराठी",
    hi: "हिंदी"
};
