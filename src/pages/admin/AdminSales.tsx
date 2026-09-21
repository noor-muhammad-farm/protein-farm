import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { recordSale } from '../../services/salesService';
import { StockItem, SaleRecord, PaymentStatus } from '../../types';
import {
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminSalesProps {
  stockItems: StockItem[];
  recentSales: SaleRecord[];
  onNavigateToHistory: () => void;
}

export function AdminSales({ stockItems, recentSales, onNavigateToHistory }: AdminSalesProps) {
  const { currentUser } = useAuth();
  const { t, formatCurrency, isRtl } = useLanguage();
  const toast = useToast();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [ratePerUnit, setRatePerUnit] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set initial selected item when items load
  useEffect(() => {
    if (stockItems.length > 0 && !selectedItemId) {
      const firstWithStock = stockItems.find((i) => i.quantity > 0) || stockItems[0];
      setSelectedItemId(firstWithStock.id);
      setRatePerUnit(firstWithStock.pricePerUnit || 0);
    }
  }, [stockItems, selectedItemId]);

  const selectedItem = stockItems.find((i) => i.id === selectedItemId);

  // When item changes, sync default price
  const handleItemChange = (id: string) => {
    setSelectedItemId(id);
    const item = stockItems.find((i) => i.id === id);
    if (item) {
      setRatePerUnit(item.pricePerUnit);
    }
  };

  // Auto-calculated total amount
  const totalAmount = Math.max(0, Math.round(quantity * ratePerUnit * 100) / 100);

  // Stock check
  const availableStock = selectedItem ? selectedItem.quantity : 0;
  const exceedsStock = quantity > availableStock;

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedItem) {
      setErrorMsg('Please select a valid stock item.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (exceedsStock) {
      setErrorMsg(
        `Requested quantity (${quantity} ${selectedItem.unit}) exceeds available inventory (${availableStock} ${selectedItem.unit})!`
      );
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please enter customer name or business title.');
      return;
    }

    setSubmitting(true);
    try {
      await recordSale({
        date,
        itemId: selectedItem.id,
        quantity: Number(quantity),
        ratePerUnit: Number(ratePerUnit),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || '—',
        paymentStatus,
        notes: notes.trim(),
        createdBy: currentUser?.email || 'Admin',
      });

      toast.success(t('saleSuccess'), `Recorded sale for ${customerName.trim()} (${formatCurrency(totalAmount)}).`);

      // Reset form
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setErrorMsg(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record sale';
      setErrorMsg(msg);
      toast.error('Sale Transaction Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('recordSaleTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Record customer egg & poultry sales with automatic inventory deduction via Firestore transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Sales Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <form onSubmit={handleSubmitSale} className="space-y-5">
            
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Date & Item Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sale Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                  <input
                    id="sale-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t('selectItem')} *
                </label>
                <select
                  id="sale-item-select"
                  required
                  value={selectedItemId}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Stock Availability Bar */}
            {selectedItem && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  availableStock <= 0
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : availableStock <= selectedItem.lowStockThreshold
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span>
                    Current Stock in Sheds: <strong>{availableStock.toLocaleString()} {selectedItem.unit}</strong>
                  </span>
                </div>
                <span className="font-bold">
                  Standard Rate: {formatCurrency(selectedItem.pricePerUnit)}
                </span>
              </div>
            )}

            {/* Quantity and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t('saleQuantity')} *
                </label>
                <input
                  id="sale-quantity-input"
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full py-2.5 px-3 text-sm bg-slate-50 border rounded-xl focus:ring-2 focus:bg-white font-bold text-slate-900 ${
                    exceedsStock
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50'
                      : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
                {exceedsStock && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    Exceeds available stock ({availableStock})!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t('ratePerUnit')} *
                </label>
                <input
                  id="sale-rate-input"
                  type="number"
                  min={0}
                  required
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Number(e.target.value))}
                  className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Total Auto-calculated Box */}
            <div className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center justify-between shadow-inner">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {t('totalAmount')}
              </span>
              <span className="text-2xl font-black text-amber-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t('customerName')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                  <input
                    id="sale-customer-name-input"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Aslam Bakery / Rashid Dealer"
                    className="w-full py-2.5 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {t('customerPhone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                  <input
                    id="sale-customer-phone-input"
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full py-2.5 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Status Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {t('paymentStatus')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  id="sale-status-paid"
                  onClick={() => setPaymentStatus('Paid')}
                  className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('paid')} (Cash / Online)</span>
                </button>
                <button
                  type="button"
                  id="sale-status-pending"
                  onClick={() => setPaymentStatus('Pending')}
                  className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                    paymentStatus === 'Pending'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{t('pending')} (Credit / Khata)</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {t('notes')}
              </label>
              <input
                id="sale-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Delivery vehicle pickup, crates exchange, advance received"
                className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              id="sale-submit-btn"
              type="submit"
              disabled={submitting || exceedsStock || availableStock <= 0}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base"
            >
              <span>{submitting ? t('loading') : t('submitSale')}</span>
              <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>

        {/* Recent Sales Side Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Sales Recorded</h2>
              <p className="text-xs text-slate-500">Live feed of transactions</p>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              View Full History →
            </button>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {recentSales.slice(0, 8).map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {sale.customerName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sale.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {sale.quantity} × {sale.itemName}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>{sale.date}</span>
                  <span>{sale.customerPhone || '—'}</span>
                </div>
              </div>
            ))}

            {recentSales.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No sales recorded yet. Use the form on the left to record your first poultry sale.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
