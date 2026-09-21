import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../config/firebase';
import { SaleRecord, StockItem, StockHistoryEntry, PaymentStatus } from '../types';

const SALES_PATH = 'sales';
const STOCK_ITEMS_PATH = 'stock_items';
const STOCK_HISTORY_PATH = 'stock_history';

export function subscribeToSales(
  callback: (sales: SaleRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, SALES_PATH);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const sales: SaleRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SaleRecord, 'id'>),
      }));
      callback(sales);
    },
    (error) => {
      const err = handleFirestoreError(error, OperationType.GET, SALES_PATH);
      if (onError) onError(err);
    }
  );
}

export interface NewSaleInput {
  date: string;
  itemId: string;
  quantity: number;
  ratePerUnit: number;
  customerName: string;
  customerPhone: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdBy?: string;
}

/**
 * Record a sale using a Firestore transaction.
 * Automatically verifies available stock, blocks sale if insufficient stock,
 * reduces stock quantity atomically, logs the sale, and writes a stock history audit log.
 */
export async function recordSale(input: NewSaleInput): Promise<string> {
  const {
    date,
    itemId,
    quantity,
    ratePerUnit,
    customerName,
    customerPhone,
    paymentStatus,
    notes,
    createdBy,
  } = input;

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }
  if (ratePerUnit < 0) {
    throw new Error('Rate per unit cannot be negative.');
  }

  const stockRef = doc(db, STOCK_ITEMS_PATH, itemId);
  const saleRef = doc(collection(db, SALES_PATH));
  const historyRef = doc(collection(db, STOCK_HISTORY_PATH));
  const now = new Date().toISOString();
  const totalAmount = Math.round(quantity * ratePerUnit * 100) / 100;

  try {
    await runTransaction(db, async (txn) => {
      const stockSnap = await txn.get(stockRef);
      if (!stockSnap.exists()) {
        throw new Error('Selected stock item does not exist.');
      }

      const stockData = stockSnap.data() as StockItem;
      const currentStock = Number(stockData.quantity) || 0;

      // STRICT BLOCK IF QUANTITY EXCEEDS AVAILABLE STOCK
      if (quantity > currentStock) {
        throw new Error(
          `Insufficient stock! Requested: ${quantity} ${stockData.unit}, Available: ${currentStock} ${stockData.unit}.`
        );
      }

      const newStock = currentStock - quantity;

      // 1. Update stock item
      txn.update(stockRef, {
        quantity: newStock,
        lastUpdated: now,
      });

      // 2. Create Sale document
      const newSale: SaleRecord = {
        id: saleRef.id,
        date: date || now.split('T')[0],
        itemId,
        itemName: stockData.name,
        quantity,
        unit: stockData.unit,
        ratePerUnit,
        totalAmount,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentStatus,
        notes: notes?.trim() || '',
        createdAt: now,
        createdBy: createdBy || 'Admin',
      };
      txn.set(saleRef, removeUndefinedFields(newSale));

      // 3. Create Stock History Audit Entry
      const historyEntry: StockHistoryEntry = {
        id: historyRef.id,
        itemId,
        itemName: stockData.name,
        changeType: 'sale',
        quantity: -quantity,
        previousQuantity: currentStock,
        newQuantity: newStock,
        date: date || now.split('T')[0],
        notes: `Sale to ${customerName.trim()} (${paymentStatus})`,
        createdAt: now,
        createdBy: createdBy || 'Admin',
      };
      txn.set(historyRef, removeUndefinedFields(historyEntry));
    });

    return saleRef.id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      throw error;
    }
    throw handleFirestoreError(error, OperationType.WRITE, SALES_PATH);
  }
}

/**
 * Delete a sale and restore the deducted stock quantity via Firestore transaction.
 */
export async function deleteSaleWithStockRestoration(saleId: string, adminEmail?: string): Promise<void> {
  const saleRef = doc(db, SALES_PATH, saleId);
  const now = new Date().toISOString();

  try {
    await runTransaction(db, async (txn) => {
      const saleSnap = await txn.get(saleRef);
      if (!saleSnap.exists()) {
        throw new Error('Sale record not found.');
      }

      const saleData = saleSnap.data() as SaleRecord;
      const stockRef = doc(db, STOCK_ITEMS_PATH, saleData.itemId);
      const stockSnap = await txn.get(stockRef);

      if (stockSnap.exists()) {
        const currentStockData = stockSnap.data() as StockItem;
        const restoredQty = (Number(currentStockData.quantity) || 0) + saleData.quantity;

        txn.update(stockRef, {
          quantity: restoredQty,
          lastUpdated: now,
        });

        // Add compensation history log
        const historyRef = doc(collection(db, STOCK_HISTORY_PATH));
        const historyEntry: StockHistoryEntry = {
          id: historyRef.id,
          itemId: saleData.itemId,
          itemName: saleData.itemName,
          changeType: 'adjustment',
          quantity: saleData.quantity,
          previousQuantity: Number(currentStockData.quantity) || 0,
          newQuantity: restoredQty,
          date: now.split('T')[0],
          notes: `Cancelled sale #${saleId.substring(0, 6)} - Restored stock`,
          createdAt: now,
          createdBy: adminEmail || 'Admin',
        };
        txn.set(historyRef, removeUndefinedFields(historyEntry));
      }

      // Delete the sale document
      txn.delete(saleRef);
    });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, `${SALES_PATH}/${saleId}`);
  }
}

/**
 * Update an existing sale (e.g. payment status, notes, or customer info)
 */
export async function updateSaleRecord(
  saleId: string,
  updates: Partial<Pick<SaleRecord, 'paymentStatus' | 'notes' | 'customerName' | 'customerPhone'>>
): Promise<void> {
  const saleRef = doc(db, SALES_PATH, saleId);
  try {
    await updateDoc(saleRef, removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    throw handleFirestoreError(error, OperationType.UPDATE, `${SALES_PATH}/${saleId}`);
  }
}

/**
 * Export sales list to CSV file and trigger download in browser
 */
export function exportSalesToCSV(sales: SaleRecord[]): void {
  if (!sales || sales.length === 0) return;

  const headers = [
    'Sale ID',
    'Date',
    'Item Name',
    'Quantity',
    'Unit',
    'Rate per Unit (PKR)',
    'Total Amount (PKR)',
    'Customer Name',
    'Customer Phone',
    'Payment Status',
    'Notes',
    'Recorded At',
  ];

  const rows = sales.map((s) => [
    `"${s.id}"`,
    `"${s.date}"`,
    `"${s.itemName.replace(/"/g, '""')}"`,
    s.quantity,
    `"${s.unit}"`,
    s.ratePerUnit,
    s.totalAmount,
    `"${s.customerName.replace(/"/g, '""')}"`,
    `"${s.customerPhone.replace(/"/g, '""')}"`,
    `"${s.paymentStatus}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
    `"${s.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `noor_muhammad_farm_sales_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
