export type UserRole = 'admin' | 'customer';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type StockCategory = 'Eggs' | 'Layer Birds' | 'Feed' | 'Manure' | 'Other';

export interface StockItem {
  id: string;
  name: string;
  nameUrdu?: string;
  category: StockCategory;
  quantity: number;
  unit: string; // e.g. "Crates (30 eggs)", "Birds", "50kg Bags", "Trolley/Tons"
  pricePerUnit: number;
  costPricePerUnit?: number; // Production or purchase cost per unit (لاگت فی یونٹ)
  lowStockThreshold: number;
  notes?: string;
  lastUpdated: string;
}

export type StockChangeType = 'add' | 'sale' | 'adjustment' | 'initial';

export interface StockHistoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  changeType: StockChangeType;
  quantity: number; // positive or negative
  previousQuantity: number;
  newQuantity: number;
  date: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export type PaymentStatus = 'Paid' | 'Pending';

export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  ratePerUnit: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ContactSettings {
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  managerName: string;
  managerPhone: string;
  managerWhatsApp: string;
  farmAddress: string;
  farmAddressUrdu?: string;
  farmEmail: string;
  mapEmbedUrl: string;
  mapsDirectUrl?: string;
  updatedAt?: string;
}

export type Language = 'en' | 'ur';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
