import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Farm Branding
    farmName: 'Noor Muhammad Protein Farm',
    farmTagline: 'Fresh Farm Eggs & Quality Layers',
    farmSubtitle: 'Dedicated to premium quality layer farming, biosecure egg production, and healthy poultry.',
    
    // Nav
    navHome: 'Home',
    navAbout: 'About Us',
    navStock: 'Current Stock',
    navContact: 'Contact',
    navAdmin: 'Admin Portal',
    navLogin: 'Sign In',
    navRegister: 'Create Account',
    navLogout: 'Sign Out',
    
    // Auth
    signInTitle: 'Sign In to Your Account',
    signUpTitle: 'Create New Customer Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    signInButton: 'Sign In',
    signUpButton: 'Register',
    googleSignIn: 'Continue with Google',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    orDivider: 'OR',
    authNotice: 'Login to view our live daily egg inventory and stock availability.',
    adminBadge: 'Admin',
    customerBadge: 'Customer',

    // Public Home
    aboutTitle: 'About Our Farm',
    aboutSubtitle: 'Modern Poultry Farming with Highest Quality Standards',
    aboutText1: 'Noor Muhammad Protein Farm is a state-of-the-art layer poultry farming operation committed to producing the freshest table eggs and healthiest layer pullets. We prioritize biosecurity, humane cage and shed management, balanced nutrition, and daily collection.',
    aboutText2: 'Our eggs are graded, sorted, and packed on the very day of laying to guarantee maximum freshness, rich yolk color, and superior nutritional value for commercial bakers, retailers, and households.',
    
    // Features
    feat1Title: 'Daily Fresh Eggs',
    feat1Desc: 'Grade-A farm eggs gathered daily from healthy, nutrient-fed commercial layers.',
    feat2Title: 'Healthy Layer Birds',
    feat2Desc: 'Vaccinated and robust pullets & active laying hens raised under expert veterinary care.',
    feat3Title: 'Strict Biosecurity',
    feat3Desc: 'Sterile shedding, clean water filtration, and zero contamination protocols.',
    feat4Title: 'Wholesale & Retail',
    feat4Desc: 'Supplying commercial crates, poultry manure for organic farming, and quality feed.',

    // Contact
    contactTitle: 'Get in Touch',
    contactSubtitle: 'Have an order or inquiry? Speak directly with farm management.',
    ownerCardTitle: 'Farm Owner',
    managerCardTitle: 'Farm Manager',
    callNow: 'Call Now',
    chatWhatsApp: 'WhatsApp',
    addressLabel: 'Farm Location',
    emailLabelContact: 'Email Us',
    directionsLabel: 'Find us on Map',

    // Public Stock Page
    stockPageTitle: 'Current Stock & Daily Inventory',
    stockPageSubtitle: 'Live stock quantities available for wholesale orders and customer delivery.',
    searchStockPlaceholder: 'Search eggs, birds, feed, manure...',
    filterCategoryAll: 'All Categories',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    unitPrice: 'Price per unit',
    availableQuantity: 'Quantity Available',
    lastUpdated: 'Last Updated',
    noStockFound: 'No stock items matching your filter.',
    stockLoginPrompt: 'Please sign in to inspect our real-time stock levels and pricing.',

    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    adminStock: 'Stock Management',
    adminSales: 'Record New Sale',
    adminSalesHistory: 'Sales History',
    adminContactSettings: 'Contact Settings',
    adminOverview: 'Farm Operations Overview',
    todaySales: "Today's Sales",
    monthSales: "This Month's Sales",
    totalRevenue: 'Total Sales Recorded',
    lowStockAlerts: 'Low Stock Alerts',
    activeInventoryItems: 'Active Stock Items',
    salesTrend: 'Sales Revenue Trend',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    quickActions: 'Quick Actions',
    stockSummaryTitle: 'Stock Level Overview',
    stockFlowTitle: 'Stock Flow & Profit / Loss Analysis',
    stockAdded: 'Total Stock Added',
    stockSold: 'Stock Sold',
    remainingStock: 'In-Hand Stock',
    unitCost: 'Cost / Unit',
    costOfSold: 'Cost of Sold Stock',
    grossProfitLoss: 'Gross Profit / Loss',
    netProfit: 'Net Profit',
    netLoss: 'Net Loss',
    costValue: 'Remaining Stock Value',
    costPricePerUnit: 'Cost Price per Unit (PKR)',
    inquireRate: 'Inquire Rate on WhatsApp',
    rateOnInquiry: 'Rate on Call / WhatsApp',
    marketRateNotice: 'Daily wholesale rates available on inquiry.',

    // Admin Stock Management
    addNewItem: 'Add New Item',
    addStockBatch: 'Add Stock / Production Batch',
    itemName: 'Item Name',
    itemNameUrdu: 'Item Name (Urdu)',
    category: 'Category',
    quantity: 'Quantity',
    unit: 'Unit',
    price: 'Price per Unit (PKR)',
    threshold: 'Low Stock Threshold',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    stockHistoryLog: 'Stock Audit & History Log',
    changeType: 'Action / Type',
    prevQty: 'Previous',
    newQty: 'New Qty',
    date: 'Date',
    notes: 'Notes / Batch Reference',
    save: 'Save Changes',
    cancel: 'Cancel',

    // Admin Sales
    recordSaleTitle: 'Record Customer Sale',
    selectItem: 'Select Stock Item',
    customerName: 'Customer / Business Name',
    customerPhone: 'Phone / WhatsApp Number',
    saleQuantity: 'Quantity Sold',
    ratePerUnit: 'Rate per Unit (PKR)',
    totalAmount: 'Total Amount (PKR)',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    pending: 'Pending',
    submitSale: 'Confirm & Deduct Stock',
    insufficientStock: 'Cannot complete sale: requested quantity exceeds available stock!',
    saleSuccess: 'Sale recorded successfully and stock has been updated.',

    // Common
    confirmDelete: 'Are you sure you want to delete this item? This action cannot be undone.',
    yesDelete: 'Yes, Delete',
    loading: 'Loading...',
    currency: 'PKR',
    rupees: 'Rs.',
  },
  ur: {
    // Farm Branding
    farmName: 'نور محمد پروٹین فارم',
    farmTagline: 'فارم کے تازہ انڈے اور معیاری لیئر مرغیاں',
    farmSubtitle: 'اعلیٰ معیار کی لیئر فارمنگ، محفوظ اور تازہ انڈوں کی پیداوار اور صحت مند مرغیوں کے لیے پرعزم۔',

    // Nav
    navHome: 'ہوم',
    navAbout: 'ہمارے بارے میں',
    navStock: 'موجودہ اسٹاک',
    navContact: 'رابطہ کریں',
    navAdmin: 'ایڈمن پینل',
    navLogin: 'لاگ ان',
    navRegister: 'اکاؤنٹ بنائیں',
    navLogout: 'لاگ آؤٹ',

    // Auth
    signInTitle: 'اپنے اکاؤنٹ میں لاگ ان کریں',
    signUpTitle: 'نیا کسٹمر اکاؤنٹ بنائیں',
    emailLabel: 'ای میل ایڈریس',
    passwordLabel: 'پاس ورڈ',
    fullNameLabel: 'مکمل نام',
    signInButton: 'لاگ ان کریں',
    signUpButton: 'رجسٹر کریں',
    googleSignIn: 'گوگل کے ساتھ جاری رکھیں',
    noAccount: 'کیا آپ کا اکاؤنٹ نہیں ہے؟',
    alreadyHaveAccount: 'پہلے سے اکاؤنٹ موجود ہے؟',
    orDivider: 'یا',
    authNotice: 'ہمارے یومیہ انڈوں کی دستیابی اور تازہ اسٹاک دیکھنے کے لیے لاگ ان کریں۔',
    adminBadge: 'ایڈمن',
    customerBadge: 'کسٹمر',

    // Public Home
    aboutTitle: 'ہمارے فارم کے بارے میں',
    aboutSubtitle: 'جدید پولٹری فارمنگ اور اعلیٰ کوالٹی کے معیارات',
    aboutText1: 'نور محمد پروٹین فارم ایک جدید لیئر پولٹری فارم ہے جو بہترین خوراک اور جدید بائیو سیکیورٹی کے تحت تازہ فارمی انڈے اور مضبوط لیئر مرغیاں فراہم کرتا ہے۔',
    aboutText2: 'ہماری روزانہ کی پیداوار کو اسی دن سارٹ اور پیک کیا جاتا ہے تاکہ ہول سیل ڈیلرز، بیکریوں اور گھریلو صارفین تک تازہ ترین انڈے پہنچ سکیں۔',

    // Features
    feat1Title: 'روزانہ تازہ انڈے',
    feat1Desc: 'صحت مند مرغیوں سے حاصل کردہ گریڈ-اے تازہ اور مقوی انڈے۔',
    feat2Title: 'معیاری لیئر مرغیاں',
    feat2Desc: 'ماہر ڈاکٹرز کی نگرانی میں تیار شدہ، ویکسین شدہ صحت مند پولٹس اور مرغیاں۔',
    feat3Title: 'مکمل بائیو سیکیورٹی',
    feat3Desc: 'جراثیم سے پاک ماحول، فلٹر شدہ پانی اور بیماریوں سے مکمل تحفظ۔',
    feat4Title: 'ہول سیل اور ریٹیل',
    feat4Desc: 'انڈوں کے کریٹس، مرغیوں کی نامیاتی کھاد اور بہترین فیڈ کی فراہمی۔',

    // Contact
    contactTitle: 'ہم سے رابطہ کریں',
    contactSubtitle: 'آرڈر دینے یا معلومات حاصل کرنے کے لیے فارم انتظامیہ سے رابطہ کریں۔',
    ownerCardTitle: 'فارم کے مالک',
    managerCardTitle: 'فارم مینیجر',
    callNow: 'کال کریں',
    chatWhatsApp: 'واٹس ایپ رابطہ',
    addressLabel: 'فارم کا پتہ',
    emailLabelContact: 'ای میل',
    directionsLabel: 'گوگل میپ پر لوکیشن',

    // Public Stock Page
    stockPageTitle: 'موجودہ اسٹاک اور دستیابی',
    stockPageSubtitle: 'ہول سیل اور کسٹمرز کے لیے دستیاب روزانہ کا اسٹاک۔ آج کے مارکیٹ ریٹ کے لیے فارم مینیجر سے رابطہ کریں۔',
    searchStockPlaceholder: 'انڈے، مرغیاں، فیڈ یا کھاد تلاش کریں...',
    filterCategoryAll: 'تمام کیٹیگریز',
    inStock: 'دستیاب ہے',
    lowStock: 'اسٹاک کم ہے',
    outOfStock: 'ختم ہو چکا ہے',
    unitPrice: 'فی یونٹ قیمت',
    availableQuantity: 'دستیاب مقدار',
    lastUpdated: 'آخری اپ ڈیٹ',
    noStockFound: 'کوئی آئٹم نہیں ملا۔',
    stockLoginPrompt: 'براہ کرم ریئل ٹائم اسٹاک اور قیمتیں دیکھنے کے لیے لاگ ان کریں۔',

    // Admin Dashboard
    adminDashboard: 'ایڈمن ڈیش بورڈ',
    adminStock: 'اسٹاک مینیجمنٹ',
    adminSales: 'نئی سیل درج کریں',
    adminSalesHistory: 'سیلز کی ہسٹری',
    adminContactSettings: 'رابطہ کی ترتیبات',
    adminOverview: 'فارم آپریشنز کا خلاصہ',
    todaySales: 'آج کی سیلز',
    monthSales: 'اس ماہ کی سیلز',
    totalRevenue: 'کل سیلز آمدنی',
    lowStockAlerts: 'کم اسٹاک الرٹس',
    activeInventoryItems: 'کل فعال آئٹمز',
    salesTrend: 'سیلز آمدنی کا گراف',
    last7Days: 'پچھلے 7 دن',
    last30Days: 'پچھلے 30 دن',
    quickActions: 'فوری اقدامات',
    stockSummaryTitle: 'اسٹاک کا خلاصہ',
    stockFlowTitle: 'اسٹاک فلو اور منافع / نقصان کا تجزیہ',
    stockAdded: 'کل شامل شدہ اسٹاک',
    stockSold: 'فروخت شدہ اسٹاک',
    remainingStock: 'باقی پڑا اسٹاک',
    unitCost: 'لاگت فی یونٹ',
    costOfSold: 'فروخت مال کی لاگت',
    grossProfitLoss: 'مجموعی منافع / نقصان',
    netProfit: 'خالص منافع',
    netLoss: 'خالص نقصان',
    costValue: 'موجودہ اسٹاک کی لاگت',
    costPricePerUnit: 'پیداواری / خریداری لاگت فی یونٹ (روپے)',
    inquireRate: 'ریٹ اور آرڈر کے لیے رابطہ کریں',
    rateOnInquiry: 'رابطہ پر دستیاب',
    marketRateNotice: 'روزانہ کے ہول سیل مارکیٹ ریٹ رابطہ پر دستیاب ہیں۔',

    // Admin Stock Management
    addNewItem: 'نیا آئٹم شامل کریں',
    addStockBatch: 'اسٹاک / پیداوار شامل کریں',
    itemName: 'آئٹم کا نام',
    itemNameUrdu: 'اردو نام',
    category: 'کیٹیگری',
    quantity: 'مقدار',
    unit: 'یونٹ',
    price: 'فی یونٹ قیمت (روپے)',
    threshold: 'کم از کم انتباہی مقدار',
    actions: 'اقدامات',
    edit: 'ترمیم',
    delete: 'حذف کریں',
    stockHistoryLog: 'اسٹاک ہسٹری اور آڈٹ لاگ',
    changeType: 'عمل کی قسم',
    prevQty: 'پہلی مقدار',
    newQty: 'نئی مقدار',
    date: 'تاریخ',
    notes: 'تفصیلات / بیچ نمبر',
    save: 'تبدیلیاں محفوظ کریں',
    cancel: 'منسوخ کریں',

    // Admin Sales
    recordSaleTitle: 'کسٹمر سیل درج کریں',
    selectItem: 'اسٹاک آئٹم منتخب کریں',
    customerName: 'کسٹمر / خریدار کا نام',
    customerPhone: 'فون / واٹس ایپ نمبر',
    saleQuantity: 'فروخت کردہ مقدار',
    ratePerUnit: 'ریٹ فی یونٹ (روپے)',
    totalAmount: 'کل رقم (روپے)',
    paymentStatus: 'ادائیگی کی حیثیت',
    paid: 'ادا شدہ',
    pending: 'باقی (پینڈنگ)',
    submitSale: 'سیل کنفرم کریں اور اسٹاک کاٹیں',
    insufficientStock: 'سیل مکمل نہیں ہو سکی: مانگی گئی مقدار موجودہ اسٹاک سے زیادہ ہے!',
    saleSuccess: 'سیل کامیابی سے درج ہو گئی اور اسٹاک اپ ڈیٹ کر دیا گیا ہے۔',

    // Common
    confirmDelete: 'کیا آپ واقعی اس آئٹم کو ڈیلیٹ کرنا چاہتے ہیں؟',
    yesDelete: 'ہاں، ڈیلیٹ کریں',
    loading: 'لوڈ ہو رہا ہے...',
    currency: 'PKR',
    rupees: 'روپے',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nmpf_lang');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const isRtl = language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('nmpf_lang', language);
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const t = (key: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    return translations.en[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount);
    return language === 'ur' ? `${formatted} روپے` : `Rs. ${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
