import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  deleteSaleWithStockRestoration,
  updateSaleRecord,
  exportSalesToCSV,
} from '../../services/salesService';
import { SaleRecord, StockItem, PaymentStatus } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Search,
  Download,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  X,
  History,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface AdminSalesHistoryProps {
  sales: SaleRecord[];
  stockItems: StockItem[];
}

export function AdminSalesHistory({ sales, stockItems }: AdminSalesHistoryProps) {
  const { currentUser } = useAuth();
  const { t, formatCurrency, isRtl } = useLanguage();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedItemName, setSelectedItemName] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Edit Sale modal
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('Paid');
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Delete modal
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  // Filtered sales memo
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search term
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        sale.customerName.toLowerCase().includes(queryLower) ||
        sale.customerPhone.toLowerCase().includes(queryLower) ||
        sale.itemName.toLowerCase().includes(queryLower) ||
        (sale.notes && sale.notes.toLowerCase().includes(queryLower));

      // Date range
      const matchesFrom = !fromDate || sale.date >= fromDate;
      const matchesTo = !toDate || sale.date <= toDate;

      // Item
      const matchesItem = selectedItemName === 'All' || sale.itemName === selectedItemName;

      // Status
      const matchesStatus = statusFilter === 'All' || sale.paymentStatus === statusFilter;

      return matchesSearch && matchesFrom && matchesTo && matchesItem && matchesStatus;
    });
  }, [sales, searchQuery, fromDate, toDate, selectedItemName, statusFilter]);

  // Aggregate stats for current filter
  const stats = useMemo(() => {
    let total = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    filteredSales.forEach((s) => {
      total += s.totalAmount || 0;
      if (s.paymentStatus === 'Paid') paidTotal += s.totalAmount || 0;
      if (s.paymentStatus === 'Pending') pendingTotal += s.totalAmount || 0;
    });

    return { total, paidTotal, pendingTotal, count: filteredSales.length };
  }, [filteredSales]);

  // Open edit modal
  const openEditModal = (sale: SaleRecord) => {
    setEditingSale(sale);
    setEditStatus(sale.paymentStatus);
    setEditCustomerName(sale.customerName);
    setEditCustomerPhone(sale.customerPhone);
    setEditNotes(sale.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    setSavingEdit(true);
    try {
      await updateSaleRecord(editingSale.id, {
        customerName: editCustomerName.trim(),
        customerPhone: editCustomerPhone.trim(),
        paymentStatus: editStatus,
        notes: editNotes.trim(),
      });
      toast.success('Sale Updated', 'Changes saved successfully.');
      setEditingSale(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update sale';
      toast.error('Error', msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSaleId) return;
    try {
      await deleteSaleWithStockRestoration(deletingSaleId, currentUser?.email || 'Admin');
      toast.success(
        'Sale Deleted',
        'The sale has been cancelled and stock was restored back to the farm inventory.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete sale';
      toast.error('Error', msg);
    } finally {
      setDeletingSaleId(null);
    }
  };

  const handleExport = () => {
    if (filteredSales.length === 0) {
      toast.warning('No Records', 'There are no sales matching the selected filters to export.');
      return;
    }
    exportSalesToCSV(filteredSales);
    toast.success('Export Successful', `Exported ${filteredSales.length} sales to CSV.`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setSelectedItemName('All');
    setStatusFilter('All');
  };

  // Distinct item names from sales or stock
  const distinctItemNames = Array.from(
    new Set([...stockItems.map((i) => i.name), ...sales.map((s) => s.itemName)])
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('adminSalesHistory')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Comprehensive audit ledger of commercial egg, layer bird, and manure customer orders.
          </p>
        </div>

        <button
          id="export-sales-csv-btn"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Aggregate Banner for Filtered View */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Transactions
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {stats.count}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Filtered Total
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block truncate">
            {formatCurrency(stats.total)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Total Paid
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-1 block truncate">
            {formatCurrency(stats.paidTotal)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Pending / Khata
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-900 mt-1 block truncate">
            {formatCurrency(stats.pendingTotal)}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-3 ${
                isRtl ? 'right-3' : 'left-3'
              }`}
            />
            <input
              id="sales-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, or notes..."
              className={`w-full py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          {/* Date From */}
          <div>
            <input
              id="sales-filter-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="From Date"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              title="From date"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              id="sales-filter-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To Date"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              title="To date"
            />
          </div>

          {/* Item Filter */}
          <div>
            <select
              id="sales-filter-item-select"
              value={selectedItemName}
              onChange={(e) => setSelectedItemName(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Items</option>
              {distinctItemNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom row: Payment status + Clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {['All', 'Paid', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {(searchQuery || fromDate || toDate || selectedItemName !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">{t('date')}</th>
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">Item & Qty</th>
                <th className="px-5 py-3.5">Rate</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">{t('paymentStatus')}</th>
                <th className="px-5 py-3.5">{t('notes')}</th>
                <th className="px-5 py-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                    No sales records found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{sale.customerName}</div>
                      <div className="text-xs text-slate-500">{sale.customerPhone || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{sale.itemName}</div>
                      <div className="text-xs text-slate-500">
                        {sale.quantity} {sale.unit}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {formatCurrency(sale.ratePerUnit)}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sale.paymentStatus === 'Paid' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{sale.paymentStatus}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                      {sale.notes || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        id={`edit-sale-${sale.id}`}
                        onClick={() => openEditModal(sale)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit sale details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-sale-${sale.id}`}
                        onClick={() => setDeletingSaleId(sale.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel sale & restore stock"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Sale Record</h2>
              <button
                onClick={() => setEditingSale(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>
                  <strong>Item:</strong> {editingSale.itemName} ({editingSale.quantity}{' '}
                  {editingSale.unit})
                </div>
                <div>
                  <strong>Amount:</strong> {formatCurrency(editingSale.totalAmount)}
                </div>
                <div>
                  <strong>Date:</strong> {editingSale.date}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending (Khata)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  {savingEdit ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSaleId)}
        title="Cancel Sale & Restore Stock"
        message="Are you sure you want to delete this sale record? Doing so will reverse the transaction and restore the sold quantity back to your inventory."
        confirmLabel="Yes, Cancel & Restore"
        onCancel={() => setDeletingSaleId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
