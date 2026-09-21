import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { subscribeToStockItems } from '../../services/stockService';
import { subscribeToContactSettings, DEFAULT_CONTACT_SETTINGS } from '../../services/contactService';
import { StockItem, StockCategory, ContactSettings } from '../../types';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  PackageCheck,
  AlertCircle,
  Clock,
  Egg,
  Feather,
  Wheat,
  Shovel,
  Sparkles,
  MessageSquare,
  Lock,
  PhoneCall,
} from 'lucide-react';

interface StockPageProps {
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
}

export function StockPage({ onOpenAuthModal }: StockPageProps) {
  const { currentUser } = useAuth();
  const { t, language, formatCurrency, isRtl } = useLanguage();

  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);

  // CRITICAL: Only subscribe/fetch stock if user is logged in
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubStock = subscribeToStockItems(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error reading stock items:', err);
        setLoading(false);
      }
    );

    const unsubContact = subscribeToContactSettings((settings) => {
      setContact(settings);
    });

    return () => {
      unsubStock();
      unsubContact();
    };
  }, [currentUser]);

  // If user is not logged in, prompt to log in and do NOT reveal stock data
  if (!currentUser) {
    return (
      <div className="py-24 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('stockLoginPrompt')}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Daily egg production inventory and live wholesale prices are reserved for registered customers and commercial partners.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuthModal('signin')}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {t('navLogin')}
          </button>
          <button
            onClick={() => onOpenAuthModal('signup')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all"
          >
            {t('navRegister')}
          </button>
        </div>
      </div>
    );
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const nameMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameUrdu && item.nameUrdu.includes(searchQuery)) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && nameMatch;
  });

  const getCategoryIcon = (cat: StockCategory) => {
    switch (cat) {
      case 'Eggs':
        return <Egg className="w-5 h-5 text-amber-500" />;
      case 'Layer Birds':
        return <Feather className="w-5 h-5 text-emerald-600" />;
      case 'Feed':
        return <Wheat className="w-5 h-5 text-yellow-600" />;
      case 'Manure':
        return <Shovel className="w-5 h-5 text-orange-600" />;
      default:
        return <PackageCheck className="w-5 h-5 text-teal-600" />;
    }
  };

  const getStatusBadge = (item: StockItem) => {
    if (item.quantity <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          {t('outOfStock')}
        </span>
      );
    }
    if (item.quantity <= item.lowStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          {t('lowStock')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        {t('inStock')}
      </span>
    );
  };

  const categories = ['All', 'Eggs', 'Layer Birds', 'Feed', 'Manure'];

  const handleOrderInquiry = (item: StockItem) => {
    const managerNum = (contact.managerWhatsApp || contact.managerPhone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `Assalam-o-Alaikum, I would like to place an order for "${item.name}" from Noor Muhammad Protein Farm.`
    );
    window.open(`https://wa.me/${managerNum}?text=${message}`, '_blank');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('stockPageTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              {t('stockPageSubtitle')}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
            <button
              id="stock-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="stock-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-3.5 ${
                isRtl ? 'right-3.5' : 'left-3.5'
              }`}
            />
            <input
              id="stock-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchStockPlaceholder')}
              className={`w-full py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`stock-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'All' ? t('filterCategoryAll') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">{t('loading')}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">{t('noStockFound')}</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing your search term or category filter.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const displayName =
                language === 'ur' && item.nameUrdu ? item.nameUrdu : item.name;

              return (
                <div
                  key={item.id}
                  id={`stock-card-${item.id}`}
                  className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">
                            {displayName}
                          </h3>
                        </div>
                      </div>
                      {getStatusBadge(item)}
                    </div>

                    {/* Stock Metrics */}
                    <div className="grid grid-cols-2 gap-3 my-5">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">
                          {t('availableQuantity')}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">
                            {item.quantity.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 block mt-0.5 truncate">
                          {item.unit}
                        </span>
                      </div>

                      <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                        <span className="text-xs font-bold text-emerald-800 block mb-1">
                          {language === 'ur' ? 'آج کا ریٹ' : 'Daily Market Rate'}
                        </span>
                        <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold text-sm">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">
                            {language === 'ur' ? 'رابطہ پر دستیاب' : 'On Inquiry'}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-700 block mt-0.5">
                          {language === 'ur' ? 'ہول سیل ریٹ پر رابطہ کریں' : 'Call or WhatsApp for Rate'}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl mb-4 border border-slate-100 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Timestamp & Order Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.lastUpdated).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <button
                      id={`order-btn-${item.id}`}
                      onClick={() => handleOrderInquiry(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                      title="Inquire today's rate & order on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'ریٹ و آرڈر' : 'Inquire & Order'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">{t('itemName')}</th>
                    <th className="px-6 py-4">{t('category')}</th>
                    <th className="px-6 py-4">{t('availableQuantity')}</th>
                    <th className="px-6 py-4">{language === 'ur' ? 'ریٹ' : 'Market Rate'}</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">{t('lastUpdated')}</th>
                    <th className="px-6 py-4 text-right">Inquiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {language === 'ur' && item.nameUrdu ? item.nameUrdu : item.name}
                        {item.notes && (
                          <span className="block text-xs font-normal text-slate-500 mt-0.5">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {item.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {item.quantity.toLocaleString()}
                        </span>{' '}
                        <span className="text-xs text-slate-500">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'ur' ? 'رابطہ پر دستیاب' : 'On Inquiry'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOrderInquiry(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg transition-colors"
                          title="Inquire today's rate & order on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === 'ur' ? 'رابطہ' : 'Inquire'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
