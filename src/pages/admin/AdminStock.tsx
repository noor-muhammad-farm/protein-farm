import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  addStockItem,
  updateStockItem,
  deleteStockItem,
  addStockBatch,
} from '../../services/stockService';
import { StockItem, StockHistoryEntry, StockCategory } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  PackagePlus,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  History,
  X,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

interface AdminStockProps {
  stockItems: StockItem[];
  stockHistory: StockHistoryEntry[];
}

export function AdminStock({ stockItems, stockHistory }: AdminStockProps) {
  const { currentUser } = useAuth();
  const { t, formatCurrency, isRtl } = useLanguage();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');

  // Modal states
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states for New / Edit Item
  const [formName, setFormName] = useState('');
  const [formNameUrdu, setFormNameUrdu] = useState('');
  const [formCategory, setFormCategory] = useState<StockCategory>('Eggs');
  const [formQuantity, setFormQuantity] = useState<number>(100);
  const [formUnit, setFormUnit] = useState('Crates (30 Eggs)');
  const [formPrice, setFormPrice] = useState<number>(420);
  const [formCostPrice, setFormCostPrice] = useState<number>(340);
  const [formThreshold, setFormThreshold] = useState<number>(20);
  const [formNotes, setFormNotes] = useState('');

  // Form states for Add Batch
  const [batchItemId, setBatchItemId] = useState<string>(stockItems[0]?.id || '');
  const [batchQuantity, setBatchQuantity] = useState<number>(50);
  const [batchDate, setBatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchNotes, setBatchNotes] = useState('');

  const openAddItemModal = () => {
    setFormName('');
    setFormNameUrdu('');
    setFormCategory('Eggs');
    setFormQuantity(100);
    setFormUnit('Crates (30 Eggs)');
    setFormPrice(420);
    setFormCostPrice(340);
    setFormThreshold(20);
    setFormNotes('');
    setIsAddItemOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormNameUrdu(item.nameUrdu || '');
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormPrice(item.pricePerUnit);
    setFormCostPrice(item.costPricePerUnit !== undefined ? item.costPricePerUnit : Math.round(item.pricePerUnit * 0.75));
    setFormThreshold(item.lowStockThreshold);
    setFormNotes(item.notes || '');
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Validation Error', 'Item name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, {
          name: formName.trim(),
          nameUrdu: formNameUrdu.trim(),
          category: formCategory,
          quantity: Number(formQuantity),
          unit: formUnit.trim(),
          pricePerUnit: Number(formPrice),
          costPricePerUnit: Number(formCostPrice),
          lowStockThreshold: Number(formThreshold),
          notes: formNotes.trim(),
        });
        toast.success('Updated', `Successfully updated "${formName}".`);
        setEditingItem(null);
      } else {
        await addStockItem(
          {
            name: formName.trim(),
            nameUrdu: formNameUrdu.trim(),
            category: formCategory,
            quantity: Number(formQuantity),
            unit: formUnit.trim(),
            pricePerUnit: Number(formPrice),
            costPricePerUnit: Number(formCostPrice),
            lowStockThreshold: Number(formThreshold),
            notes: formNotes.trim(),
          },
          currentUser?.email || 'Admin'
        );
        toast.success('Created', `Successfully added new item "${formName}".`);
        setIsAddItemOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save item';
      toast.error('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchItemId) {
      toast.error('Validation Error', 'Please select a stock item.');
      return;
    }
    if (batchQuantity <= 0) {
      toast.error('Validation Error', 'Batch quantity must be greater than zero.');
      return;
    }

    setSaving(true);
    try {
      await addStockBatch(
        batchItemId,
        Number(batchQuantity),
        batchDate,
        batchNotes.trim() || 'Daily production collection',
        currentUser?.email || 'Admin'
      );
      toast.success('Stock Added', `Successfully added ${batchQuantity} units to stock.`);
      setIsAddBatchOpen(false);
      setBatchNotes('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add stock batch';
      toast.error('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;
    try {
      await deleteStockItem(deletingItemId);
      toast.success('Deleted', 'Stock item has been removed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error('Error', msg);
    } finally {
      setDeletingItemId(null);
    }
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const nameMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameUrdu && item.nameUrdu.includes(searchQuery));
    return matchesCategory && nameMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('adminStock')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Control poultry flock quantities, egg production batches, and view audit history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="stock-add-batch-btn"
            onClick={() => {
              if (stockItems.length > 0 && !batchItemId) {
                setBatchItemId(stockItems[0].id);
              }
              setIsAddBatchOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addStockBatch')}</span>
          </button>
          <button
            id="stock-add-item-btn"
            onClick={openAddItemModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            <span>{t('addNewItem')}</span>
          </button>
        </div>
      </div>

      {/* Tabs: Items List vs Full History Log */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-sm">
        <button
          id="tab-stock-items"
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'items'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Stock Items ({stockItems.length})
        </button>
        <button
          id="tab-stock-history"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('stockHistoryLog')}
        </button>
      </div>

      {activeTab === 'items' ? (
        /* Stock Items Section */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search
                className={`w-4 h-4 text-slate-400 absolute top-3.5 ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stock item..."
                className={`w-full py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Eggs', 'Layer Birds', 'Feed', 'Manure'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t('itemName')}</th>
                  <th className="px-4 py-3.5">{t('category')}</th>
                  <th className="px-4 py-3.5">{t('availableQuantity')}</th>
                  <th className="px-4 py-3.5">Sale Rate</th>
                  <th className="px-4 py-3.5">Cost Price</th>
                  <th className="px-4 py-3.5">{t('threshold')}</th>
                  <th className="px-4 py-3.5 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.nameUrdu && (
                        <div className="text-xs text-slate-500">{item.nameUrdu}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-emerald-800">
                      {item.category}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-slate-900">
                        {item.quantity.toLocaleString()}
                      </span>{' '}
                      <span className="text-xs text-slate-500">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {formatCurrency(item.pricePerUnit)}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-500">
                      {formatCurrency(item.costPricePerUnit !== undefined ? item.costPricePerUnit : Math.round(item.pricePerUnit * 0.75))}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        id={`edit-item-${item.id}`}
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-item-${item.id}`}
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock History Log Section */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">{t('stockHistoryLog')}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t('date')}</th>
                  <th className="px-4 py-3.5">{t('itemName')}</th>
                  <th className="px-4 py-3.5">{t('changeType')}</th>
                  <th className="px-4 py-3.5">{t('quantity')}</th>
                  <th className="px-4 py-3.5">{t('prevQty')}</th>
                  <th className="px-4 py-3.5">{t('newQty')}</th>
                  <th className="px-4 py-3.5">{t('notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No stock changes logged yet.
                    </td>
                  </tr>
                ) : (
                  stockHistory.map((h) => {
                    const isPositive = h.quantity > 0;
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {h.date}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {h.itemName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              h.changeType === 'sale'
                                ? 'bg-amber-100 text-amber-800'
                                : h.changeType === 'add'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {h.changeType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold">
                          <span
                            className={
                              isPositive ? 'text-emerald-700' : 'text-amber-700'
                            }
                          >
                            {isPositive ? `+${h.quantity}` : h.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {h.previousQuantity}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {h.newQuantity}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {h.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add or Edit Item */}
      {(isAddItemOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? 'Edit Stock Item' : t('addNewItem')}
              </h2>
              <button
                onClick={() => {
                  setIsAddItemOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('itemName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fresh Table Eggs"
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('itemNameUrdu')}
                  </label>
                  <input
                    type="text"
                    value={formNameUrdu}
                    onChange={(e) => setFormNameUrdu(e.target.value)}
                    placeholder="e.g. فارم کے تازہ انڈے"
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StockCategory)}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Eggs">Eggs</option>
                    <option value="Layer Birds">Layer Birds</option>
                    <option value="Feed">Feed</option>
                    <option value="Manure">Manure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('unit')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="e.g. Crates (30 Eggs), Birds"
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('quantity')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sale Rate (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Alert
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(Number(e.target.value))}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional details, strain, or packaging notes..."
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddItemOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  {saving ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Stock / Production Batch */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">
                  Production / Inward Batch
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {t('addStockBatch')}
                </h2>
              </div>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Stock Item *
                </label>
                <select
                  required
                  value={batchItemId}
                  onChange={(e) => setBatchItemId(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity to Add *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Number(e.target.value))}
                    className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Reference / Notes
                </label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="e.g. Shed-2 Morning egg collection"
                  className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  {saving ? t('loading') : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItemId)}
        title="Delete Stock Item"
        message={t('confirmDelete')}
        confirmLabel={t('yesDelete')}
        onCancel={() => setDeletingItemId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
