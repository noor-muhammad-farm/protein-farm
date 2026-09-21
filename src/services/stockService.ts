import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  deleteDoc,
  updateDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../config/firebase';
import { StockItem, StockHistoryEntry, StockCategory } from '../types';

const STOCK_ITEMS_PATH = 'stock_items';
const STOCK_HISTORY_PATH = 'stock_history';

// Default initial poultry inventory items
export const INITIAL_POULTRY_STOCK: Omit<StockItem, 'id' | 'lastUpdated'>[] = [
  {
    name: 'Fresh Table Eggs (Crates)',
    nameUrdu: 'فارم کے تازہ انڈے (کریٹس)',
    category: 'Eggs',
    quantity: 450,
    unit: 'Crates (30 Eggs)',
    pricePerUnit: 420,
    costPricePerUnit: 340,
    lowStockThreshold: 50,
    notes: 'Grade-A fresh daily collection, uniform size and rich yolk.',
  },
  {
    name: 'Wholesale Commercial Eggs (Boxes)',
    nameUrdu: 'ہول سیل انڈے (باکس / پیٹی)',
    category: 'Eggs',
    quantity: 65,
    unit: 'Boxes (360 Eggs)',
    pricePerUnit: 4950,
    costPricePerUnit: 4000,
    lowStockThreshold: 10,
    notes: 'Packed in export-quality 12-crate corrugated cartons.',
  },
  {
    name: 'Commercial Layer Birds (Active Layers)',
    nameUrdu: 'کمرشل لیئر مرغیاں (انڈے دینے والی)',
    category: 'Layer Birds',
    quantity: 2800,
    unit: 'Birds',
    pricePerUnit: 1450,
    costPricePerUnit: 1100,
    lowStockThreshold: 200,
    notes: 'Fully vaccinated BV-300 / Lohmann strain with 90%+ lay rate.',
  },
  {
    name: 'Ready-to-Lay Pullets (16-18 Weeks)',
    nameUrdu: 'تیار لیئر پولٹس (16-18 ہفتے)',
    category: 'Layer Birds',
    quantity: 1200,
    unit: 'Birds',
    pricePerUnit: 1250,
    costPricePerUnit: 950,
    lowStockThreshold: 150,
    notes: 'Debaked, dewormed, and all ND/IB/Gumboro vaccines completed.',
  },
  {
    name: 'Organic Layer Manure (Dry Fertilizer)',
    nameUrdu: 'مرغیوں کی خشک نامیاتی کھاد',
    category: 'Manure',
    quantity: 35,
    unit: 'Trolleys / Tons',
    pricePerUnit: 8500,
    costPricePerUnit: 2500,
    lowStockThreshold: 5,
    notes: 'High nitrogen and phosphorus organic manure ideal for citrus, wheat, and vegetables.',
  },
  {
    name: 'Layer Mash Phase-1 Feed (50kg)',
    nameUrdu: 'لیئر فیڈ فیز-1 (50 کلو بیگ)',
    category: 'Feed',
    quantity: 180,
    unit: '50kg Bags',
    pricePerUnit: 6800,
    costPricePerUnit: 5800,
    lowStockThreshold: 30,
    notes: 'Balanced calcium & amino acid formula for peak shell strength.',
  },
];

export function subscribeToStockItems(
  callback: (items: StockItem[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, STOCK_ITEMS_PATH);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: StockItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<StockItem, 'id'>),
      }));
      // Sort alphabetically by category and name
      items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
      callback(items);
    },
    (error) => {
      const err = handleFirestoreError(error, OperationType.GET, STOCK_ITEMS_PATH);
      if (onError) onError(err);
    }
  );
}

export function subscribeToStockHistory(
  callback: (history: StockHistoryEntry[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, STOCK_HISTORY_PATH);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const history: StockHistoryEntry[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<StockHistoryEntry, 'id'>),
      }));
      callback(history);
    },
    (error) => {
      const err = handleFirestoreError(error, OperationType.GET, STOCK_HISTORY_PATH);
      if (onError) onError(err);
    }
  );
}

export async function addStockItem(
  itemData: Omit<StockItem, 'id' | 'lastUpdated'>,
  userEmail?: string
): Promise<string> {
  const itemRef = doc(collection(db, STOCK_ITEMS_PATH));
  const historyRef = doc(collection(db, STOCK_HISTORY_PATH));
  const now = new Date().toISOString();

  try {
    await runTransaction(db, async (txn) => {
      const newItemPayload: Record<string, any> = {
        id: itemRef.id,
        name: itemData.name.trim(),
        nameUrdu: itemData.nameUrdu ? itemData.nameUrdu.trim() : '',
        category: itemData.category,
        quantity: Number(itemData.quantity) || 0,
        unit: itemData.unit.trim(),
        pricePerUnit: Number(itemData.pricePerUnit) || 0,
        costPricePerUnit: itemData.costPricePerUnit !== undefined ? Number(itemData.costPricePerUnit) : Math.round((Number(itemData.pricePerUnit) || 0) * 0.75),
        lowStockThreshold: Number(itemData.lowStockThreshold) || 0,
        notes: itemData.notes ? itemData.notes.trim() : '',
        lastUpdated: now,
      };

      const historyPayload: Record<string, any> = {
        id: historyRef.id,
        itemId: itemRef.id,
        itemName: itemData.name.trim(),
        changeType: 'initial',
        quantity: Number(itemData.quantity) || 0,
        previousQuantity: 0,
        newQuantity: Number(itemData.quantity) || 0,
        date: new Date().toISOString().split('T')[0],
        notes: (itemData.notes && itemData.notes.trim()) || 'Initial inventory created',
        createdAt: now,
        createdBy: userEmail || 'Admin',
      };

      txn.set(itemRef, removeUndefinedFields(newItemPayload));
      txn.set(historyRef, removeUndefinedFields(historyPayload));
    });

    return itemRef.id;
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, STOCK_ITEMS_PATH);
  }
}

export async function updateStockItem(
  id: string,
  updates: Partial<Omit<StockItem, 'id' | 'lastUpdated'>>
): Promise<void> {
  const itemRef = doc(db, STOCK_ITEMS_PATH, id);
  try {
    const rawUpdates: Record<string, any> = {
      lastUpdated: new Date().toISOString(),
    };

    if (updates.name !== undefined) rawUpdates.name = updates.name.trim();
    if (updates.nameUrdu !== undefined) rawUpdates.nameUrdu = updates.nameUrdu.trim();
    if (updates.category !== undefined) rawUpdates.category = updates.category;
    if (updates.quantity !== undefined) rawUpdates.quantity = Number(updates.quantity) || 0;
    if (updates.unit !== undefined) rawUpdates.unit = updates.unit.trim();
    if (updates.pricePerUnit !== undefined) rawUpdates.pricePerUnit = Number(updates.pricePerUnit) || 0;
    if (updates.costPricePerUnit !== undefined) rawUpdates.costPricePerUnit = Number(updates.costPricePerUnit) || 0;
    if (updates.lowStockThreshold !== undefined) rawUpdates.lowStockThreshold = Number(updates.lowStockThreshold) || 0;
    if (updates.notes !== undefined) rawUpdates.notes = updates.notes.trim();

    await updateDoc(itemRef, removeUndefinedFields(rawUpdates));
  } catch (error) {
    throw handleFirestoreError(error, OperationType.UPDATE, `${STOCK_ITEMS_PATH}/${id}`);
  }
}

export async function deleteStockItem(id: string): Promise<void> {
  const itemRef = doc(db, STOCK_ITEMS_PATH, id);
  try {
    await deleteDoc(itemRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, `${STOCK_ITEMS_PATH}/${id}`);
  }
}

export async function addStockBatch(
  itemId: string,
  quantityToAdd: number,
  date: string,
  notes?: string,
  userEmail?: string
): Promise<void> {
  if (quantityToAdd <= 0) {
    throw new Error('Quantity added must be greater than 0');
  }

  const itemRef = doc(db, STOCK_ITEMS_PATH, itemId);
  const historyRef = doc(collection(db, STOCK_HISTORY_PATH));
  const now = new Date().toISOString();

  try {
    await runTransaction(db, async (txn) => {
      const itemSnap = await txn.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error('Stock item not found');
      }

      const itemData = itemSnap.data() as StockItem;
      const prevQty = Number(itemData.quantity) || 0;
      const newQty = prevQty + Number(quantityToAdd);

      txn.update(itemRef, {
        quantity: newQty,
        lastUpdated: now,
      });

      const historyEntry: Record<string, any> = {
        id: historyRef.id,
        itemId,
        itemName: itemData.name,
        changeType: 'add',
        quantity: Number(quantityToAdd),
        previousQuantity: prevQty,
        newQuantity: newQty,
        date: date || now.split('T')[0],
        notes: (notes && notes.trim()) || 'Stock addition / production batch',
        createdAt: now,
        createdBy: userEmail || 'Admin',
      };

      txn.set(historyRef, removeUndefinedFields(historyEntry));
    });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, `${STOCK_ITEMS_PATH}/${itemId}`);
  }
}

export async function seedInitialStockIfEmpty(userEmail?: string): Promise<void> {
  const colRef = collection(db, STOCK_ITEMS_PATH);
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Seeding initial poultry stock for Noor Muhammad Protein Farm...');
      for (const item of INITIAL_POULTRY_STOCK) {
        await addStockItem(item, userEmail || 'System Seed');
      }
    }
  } catch (err) {
    console.warn('Stock seeding skipped (user may not be admin or already seeded):', err);
  }
}
