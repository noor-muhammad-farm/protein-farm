import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { StockItem, SaleRecord, StockHistoryEntry } from '../../types';
import { AdminSection } from './AdminLayout';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Boxes,
  Calendar,
  PackagePlus,
  ShoppingCart,
  ArrowUpRight,
  Sparkles,
  PackageCheck,
  Search,
  Percent,
  Coins,
  ShieldCheck,
  BarChart3,
  Layers,
  ArrowDownRight,
} from 'lucide-react';

interface AdminDashboardProps {
  stockItems: StockItem[];
  sales: SaleRecord[];
  stockHistory?: StockHistoryEntry[];
  onNavigate: (section: AdminSection) => void;
}

export function AdminDashboard({
  stockItems,
  sales,
  stockHistory = [],
  onNavigate,
}: AdminDashboardProps) {
  const { t, language, formatCurrency, isRtl } = useLanguage();
  const [chartRange, setChartRange] = useState<'7' | '30'>('7');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute detailed per-item stock flow, costs, and profit/loss
  const itemAnalytics = useMemo(() => {
    return stockItems.map((item) => {
      // Units sold from sales records
      const itemSales = sales.filter((s) => s.itemId === item.id);
      const totalSoldUnits = itemSales.reduce(
        (sum, s) => sum + (Number(s.quantity) || 0),
        0
      );
      const totalSalesRevenue = itemSales.reduce(
        (sum, s) => sum + (Number(s.totalAmount) || 0),
        0
      );

      // Total stock added from history log (initial + add batches)
      const historyAdded = stockHistory
        .filter(
          (h) =>
            h.itemId === item.id &&
            (h.changeType === 'initial' || h.changeType === 'add')
        )
        .reduce((sum, h) => sum + (Number(h.quantity) || 0), 0);

      // If no history exists yet (e.g. freshly seeded or manual adjustment), added is at least (current + sold)
      const currentStock = Number(item.quantity) || 0;
      const totalAddedUnits = Math.max(historyAdded, currentStock + totalSoldUnits);

      // Cost price per unit (fallback to ~75% of sale price if not set)
      const unitSaleRate = Number(item.pricePerUnit) || 0;
      const unitCostPrice =
        item.costPricePerUnit !== undefined
          ? Number(item.costPricePerUnit)
          : Math.round(unitSaleRate * 0.75);

      // Cost of sold goods (COGS)
      const totalCostOfSold = totalSoldUnits * unitCostPrice;

      // Profit or loss for this item
      const profitOrLoss = totalSalesRevenue - totalCostOfSold;
      const profitMarginPct =
        totalSalesRevenue > 0
          ? ((profitOrLoss / totalSalesRevenue) * 100)
          : 0;

      // Asset value of remaining stock
      const remainingStockCost = currentStock * unitCostPrice;

      // Total cost of all added stock
      const totalAddedCost = totalAddedUnits * unitCostPrice;

      return {
        ...item,
        currentStock,
        totalSoldUnits,
        totalSalesRevenue,
        totalAddedUnits,
        unitCostPrice,
        unitSaleRate,
        totalCostOfSold,
        profitOrLoss,
        profitMarginPct,
        remainingStockCost,
        totalAddedCost,
      };
    });
  }, [stockItems, sales, stockHistory]);

  // Farm-wide aggregate KPIs & financial status
  const summary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    let todayTotal = 0;
    let todayCount = 0;
    let monthTotal = 0;
    let monthCount = 0;
    let overallRevenue = 0;

    sales.forEach((s) => {
      const amt = Number(s.totalAmount) || 0;
      overallRevenue += amt;
      if (s.date === todayStr) {
        todayTotal += amt;
        todayCount++;
      }

      const saleDate = new Date(s.date);
      if (
        saleDate.getFullYear() === currentYear &&
        saleDate.getMonth() === currentMonth
      ) {
        monthTotal += amt;
        monthCount++;
      }
    });

    const totalAddedUnits = itemAnalytics.reduce(
      (sum, i) => sum + i.totalAddedUnits,
      0
    );
    const totalSoldUnits = itemAnalytics.reduce(
      (sum, i) => sum + i.totalSoldUnits,
      0
    );
    const totalRemainingUnits = itemAnalytics.reduce(
      (sum, i) => sum + i.currentStock,
      0
    );

    const totalCostOfSold = itemAnalytics.reduce(
      (sum, i) => sum + i.totalCostOfSold,
      0
    );
    const totalRemainingCostValue = itemAnalytics.reduce(
      (sum, i) => sum + i.remainingStockCost,
      0
    );
    const totalAddedInvestment = itemAnalytics.reduce(
      (sum, i) => sum + i.totalAddedCost,
      0
    );

    const netProfitOrLoss = overallRevenue - totalCostOfSold;
    const netProfitMarginPct =
      overallRevenue > 0 ? (netProfitOrLoss / overallRevenue) * 100 : 0;

    const lowStockItems = itemAnalytics.filter(
      (item) => item.currentStock <= item.lowStockThreshold
    );

    return {
      todayTotal,
      todayCount,
      monthTotal,
      monthCount,
      overallRevenue,
      totalAddedUnits,
      totalSoldUnits,
      totalRemainingUnits,
      totalCostOfSold,
      totalRemainingCostValue,
      totalAddedInvestment,
      netProfitOrLoss,
      netProfitMarginPct,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  }, [sales, itemAnalytics]);

  // Filter items for the interactive table
  const filteredAnalytics = useMemo(() => {
    return itemAnalytics.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameUrdu && item.nameUrdu.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [itemAnalytics, selectedCategory, searchQuery]);

  // Compute daily sales data for the chart (Last 7 or 30 days)
  const chartData = useMemo(() => {
    const daysCount = chartRange === '7' ? 7 : 30;
    const days: { dateStr: string; label: string; amount: number; count: number }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });

      days.push({
        dateStr,
        label,
        amount: 0,
        count: 0,
      });
    }

    sales.forEach((s) => {
      const entry = days.find((d) => d.dateStr === s.date);
      if (entry) {
        entry.amount += s.totalAmount || 0;
        entry.count++;
      }
    });

    const maxAmount = Math.max(...days.map((d) => d.amount), 5000);
    return { days, maxAmount };
  }, [sales, chartRange]);

  const isProfit = summary.netProfitOrLoss >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Farm Operations & Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {t('adminDashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {language === 'ur'
              ? 'سٹاک کی کل آمد، فروخت، باقی مال، لاگت اور مجموعی منافع و نقصان کا مکمل جائزہ'
              : 'Complete overview of added stock, sales volume, remaining inventory, costs, and net profit/loss.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="dash-record-sale-btn"
            onClick={() => onNavigate('sales')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('adminSales')}</span>
          </button>
          <button
            id="dash-add-stock-btn"
            onClick={() => onNavigate('stock')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            <span>{t('addStockBatch')}</span>
          </button>
        </div>
      </div>

      {/* 🌟 Highlight Banner: Gross Profit / Loss & Stock Flow Balance */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-xs transition-all ${
          isProfit
            ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white border-emerald-700'
            : 'bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900 text-white border-rose-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isProfit
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {isProfit ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {isProfit
                    ? language === 'ur'
                      ? 'منافع بخش فارم آپریشن'
                      : 'Profitable Operation'
                    : language === 'ur'
                    ? 'نقصان / زیادہ اخراجات'
                    : 'Net Loss'}
                </span>
              </span>
              <span className="text-xs text-white/70">
                {language === 'ur'
                  ? 'سیلز ریونیو بنام فروخت شدہ مال کی لاگت'
                  : 'Revenue vs. Cost of Goods Sold'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-5xl font-black tracking-tight">
                {isProfit ? '+' : ''}
                {formatCurrency(summary.netProfitOrLoss)}
              </span>
              <span
                className={`text-sm sm:text-base font-bold px-2.5 py-1 rounded-lg ${
                  isProfit
                    ? 'bg-emerald-400/20 text-emerald-200'
                    : 'bg-rose-400/20 text-rose-200'
                }`}
              >
                {summary.netProfitMarginPct >= 0 ? '+' : ''}
                {summary.netProfitMarginPct.toFixed(1)}% {t('profitMargin')}
              </span>
            </div>

            <p className="text-xs text-white/80 mt-1">
              {language === 'ur'
                ? `کل سیلز آمدنی ${formatCurrency(summary.overallRevenue)} میں سے فروخت شدہ مال کی لاگت ${formatCurrency(summary.totalCostOfSold)} منہا کر کے۔`
                : `Total revenue ${formatCurrency(summary.overallRevenue)} minus total cost of sold items ${formatCurrency(summary.totalCostOfSold)}.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {/* Added Stock */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 block">
                {language === 'ur' ? 'کل شامل شدہ اسٹاک' : 'Total Stock Added'}
              </span>
              <span className="text-lg font-black block mt-0.5">
                {summary.totalAddedUnits.toLocaleString()}
              </span>
              <span className="text-[10px] text-white/60 block truncate">
                Cost: {formatCurrency(summary.totalAddedInvestment)}
              </span>
            </div>

            {/* Sold Stock */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 block">
                {language === 'ur' ? 'فروخت شدہ اسٹاک' : 'Total Stock Sold'}
              </span>
              <span className="text-lg font-black block mt-0.5">
                {summary.totalSoldUnits.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300 block truncate font-medium">
                Rev: {formatCurrency(summary.overallRevenue)}
              </span>
            </div>

            {/* In-Hand Stock */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 block">
                {language === 'ur' ? 'کتنا پڑا ہے (باقی)' : 'Remaining In-Hand'}
              </span>
              <span className="text-lg font-black block mt-0.5">
                {summary.totalRemainingUnits.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-300 block truncate font-medium">
                Value: {formatCurrency(summary.totalRemainingCostValue)}
              </span>
            </div>

            {/* Sold Cost */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 block">
                {language === 'ur' ? 'فروخت مال کی لاگت' : 'Cost of Sold Stock'}
              </span>
              <span className="text-lg font-black block mt-0.5 truncate">
                {formatCurrency(summary.totalCostOfSold)}
              </span>
              <span className="text-[10px] text-white/60 block truncate">
                COGS Expense
              </span>
            </div>
          </div>
        </div>

        {/* Quick balance equation bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>
              {language === 'ur'
                ? `موجودہ غیر فروخت شدہ اسٹاک کی مالیت: ${formatCurrency(summary.totalRemainingCostValue)}`
                : `Current unsold inventory asset value: ${formatCurrency(summary.totalRemainingCostValue)}`}
            </span>
          </div>
          <div className="text-[11px] text-white/60">
            {sales.length} transactions recorded | {stockItems.length} active poultry products
          </div>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {t('todaySales')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(summary.todayTotal)}
            </h3>
            <p className="text-xs text-slate-500">
              {summary.todayCount} transactions today
            </p>
          </div>
        </div>

        {/* This Month's Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {t('monthSales')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(summary.monthTotal)}
            </h3>
            <p className="text-xs text-slate-500">
              {summary.monthCount} sales this month
            </p>
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {t('totalRevenue')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(summary.overallRevenue)}
            </h3>
            <p className="text-xs text-slate-500">
              {sales.length} total customer sales recorded
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              {t('lowStockAlerts')}
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                summary.lowStockCount > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3
              className={`text-2xl font-black ${
                summary.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {summary.lowStockCount} Items
            </h3>
            <p className="text-xs text-slate-500">
              {summary.lowStockCount > 0
                ? 'Replenishment recommended'
                : 'Inventory levels healthy'}
            </p>
          </div>
        </div>
      </div>

      {/* 📊 Comprehensive Stock Flow, Cost & Profit / Loss Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {language === 'ur'
                  ? 'سٹاک کی آمد، فروخت، لاگت اور منافع و نقصان کی تفصیل'
                  : 'Stock Added vs. Sold, Unit Costs & Profit / Loss'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ur'
                ? 'ہر آئٹم کا شامل شدہ اسٹاک، کتنی فروخت ہوئی، کتنا پڑا ہے، لاگت اور حاصل ہونے والا منافع یا نقصان'
                : 'Item-by-item breakdown of total added stock, sold quantity, in-hand stock, cost, revenue, and gross profit.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('stock')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start md:self-auto"
          >
            <span>{t('adminStock')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-3 ${
                isRtl ? 'right-3' : 'left-3'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name..."
              className={`w-full py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Eggs', 'Layer Birds', 'Feed', 'Manure'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 min-w-[160px]">{t('itemName')}</th>
                <th className="px-3 py-3.5 text-center min-w-[110px]">
                  {language === 'ur' ? 'کل شامل شدہ' : 'Total Added'}
                </th>
                <th className="px-3 py-3.5 text-center min-w-[100px]">
                  {language === 'ur' ? 'فروخت شدہ' : 'Total Sold'}
                </th>
                <th className="px-3 py-3.5 text-center min-w-[120px]">
                  {language === 'ur' ? 'کتنا پڑا ہے' : 'In-Hand Stock'}
                </th>
                <th className="px-3 py-3.5 text-right min-w-[110px]">
                  {language === 'ur' ? 'لاگت / ریٹ' : 'Cost / Rate'}
                </th>
                <th className="px-3 py-3.5 text-right min-w-[110px]">
                  {language === 'ur' ? 'سیل شدہ لاگت' : 'Sold Cost'}
                </th>
                <th className="px-3 py-3.5 text-right min-w-[110px]">
                  {language === 'ur' ? 'سیلز آمدنی' : 'Sales Rev'}
                </th>
                <th className="px-4 py-3.5 text-right min-w-[130px]">
                  {language === 'ur' ? 'منافع / نقصان' : 'Profit / Loss'}
                </th>
                <th className="px-4 py-3.5 text-right min-w-[120px]">
                  {language === 'ur' ? 'پڑے مال کی لاگت' : 'In-Hand Value'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No matching stock items found.
                  </td>
                </tr>
              ) : (
                filteredAnalytics.map((item) => {
                  const isItemProfit = item.profitOrLoss >= 0;
                  const isLow = item.currentStock <= item.lowStockThreshold;
                  const isOut = item.currentStock <= 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name & Category */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.nameUrdu && (
                            <span className="text-[11px] text-slate-500">
                              {item.nameUrdu}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Total Stock Added */}
                      <td className="px-3 py-3.5 text-center">
                        <span className="font-extrabold text-slate-900">
                          {item.totalAddedUnits.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 block">
                          {item.unit}
                        </span>
                      </td>

                      {/* Total Stock Sold */}
                      <td className="px-3 py-3.5 text-center">
                        <span className="font-extrabold text-emerald-700">
                          {item.totalSoldUnits.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 block">
                          {item.unit}
                        </span>
                      </td>

                      {/* Remaining / In-Hand Stock */}
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-black text-slate-900">
                            {item.currentStock.toLocaleString()} {item.unit}
                          </span>
                          {isOut ? (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              {t('outOfStock')}
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {t('lowStock')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {t('inStock')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Unit Cost & Rate */}
                      <td className="px-3 py-3.5 text-right">
                        <div className="text-xs font-semibold text-slate-500">
                          Cost: {formatCurrency(item.unitCostPrice)}
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          Rate: {formatCurrency(item.unitSaleRate)}
                        </div>
                      </td>

                      {/* Sold Cost (COGS) */}
                      <td className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600">
                        {formatCurrency(item.totalCostOfSold)}
                      </td>

                      {/* Sales Revenue */}
                      <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-900">
                        {formatCurrency(item.totalSalesRevenue)}
                      </td>

                      {/* Profit / Loss */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 ${
                              isItemProfit
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isItemProfit ? '+' : ''}
                            {formatCurrency(item.profitOrLoss)}
                          </span>
                          {item.totalSalesRevenue > 0 && (
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {item.profitMarginPct >= 0 ? '+' : ''}
                              {item.profitMarginPct.toFixed(1)}% margin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* In-Hand Stock Asset Value */}
                      <td className="px-4 py-3.5 text-right text-xs font-extrabold text-amber-950">
                        {formatCurrency(item.remainingStockCost)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Aggregate Row */}
            <tfoot className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
              <tr>
                <td className="px-4 py-3.5 uppercase tracking-wider font-extrabold">
                  {language === 'ur' ? 'کل میزان (ٹوٹل)' : 'Total Farm Aggregate'}
                </td>
                <td className="px-3 py-3.5 text-center font-black">
                  {summary.totalAddedUnits.toLocaleString()}
                </td>
                <td className="px-3 py-3.5 text-center font-black text-emerald-800">
                  {summary.totalSoldUnits.toLocaleString()}
                </td>
                <td className="px-3 py-3.5 text-center font-black">
                  {summary.totalRemainingUnits.toLocaleString()}
                </td>
                <td className="px-3 py-3.5 text-right text-slate-500">—</td>
                <td className="px-3 py-3.5 text-right font-black">
                  {formatCurrency(summary.totalCostOfSold)}
                </td>
                <td className="px-3 py-3.5 text-right font-black text-emerald-800">
                  {formatCurrency(summary.overallRevenue)}
                </td>
                <td className="px-4 py-3.5 text-right font-black">
                  <span
                    className={`px-2.5 py-1 rounded-lg ${
                      isProfit
                        ? 'bg-emerald-200 text-emerald-950 font-black'
                        : 'bg-rose-200 text-rose-950 font-black'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatCurrency(summary.netProfitOrLoss)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-black text-amber-950">
                  {formatCurrency(summary.totalRemainingCostValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sales Trend Chart (Last 7 / 30 Days) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <span>{t('salesTrend')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily revenue recorded across wholesale eggs and live layer bird orders.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              id="chart-range-7"
              onClick={() => setChartRange('7')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartRange === '7'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('last7Days')}
            </button>
            <button
              id="chart-range-30"
              onClick={() => setChartRange('30')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartRange === '30'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('last30Days')}
            </button>
          </div>
        </div>

        {/* Clean SVG Bar Chart */}
        <div className="pt-4">
          <div className="h-64 flex items-end gap-1 sm:gap-2 border-b border-slate-200 pb-2 relative">
            {chartData.days.map((item, idx) => {
              const heightPct =
                chartData.maxAmount > 0
                  ? Math.max(Math.round((item.amount / chartData.maxAmount) * 100), 3)
                  : 3;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Hover Tooltip */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                    <span className="text-[9px] text-slate-300">
                      {item.dateStr} ({item.count} sales)
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      item.amount > 0
                        ? 'bg-emerald-700 group-hover:bg-amber-500'
                        : 'bg-slate-100'
                    }`}
                  ></div>

                  {/* X-axis label */}
                  <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {chartRange === '7' || idx % 4 === 0 ? item.label : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>0 PKR</span>
            <span>Max: {formatCurrency(chartData.maxAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
