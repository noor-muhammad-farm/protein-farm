import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout, AdminSection } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminStock } from './AdminStock';
import { AdminSales } from './AdminSales';
import { AdminSalesHistory } from './AdminSalesHistory';
import { AdminContactSettings } from './AdminContactSettings';
import { AdminGallery } from './AdminGallery';
import {
  subscribeToStockItems,
  subscribeToStockHistory,
} from '../../services/stockService';
import { subscribeToSales } from '../../services/salesService';
import { StockItem, StockHistoryEntry, SaleRecord } from '../../types';

interface AdminPageProps {
  onExitAdmin: () => void;
}

export function AdminPage({ onExitAdmin }: AdminPageProps) {
  const { currentUser, isAdmin } = useAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  // Subscriptions for administrative data
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const unsubStock = subscribeToStockItems(
      (data) => setStockItems(data),
      (err) => console.error('Error fetching stock items:', err)
    );

    const unsubHistory = subscribeToStockHistory(
      (data) => setStockHistory(data),
      (err) => console.error('Error fetching stock history:', err)
    );

    const unsubSales = subscribeToSales(
      (data) => setSales(data),
      (err) => console.error('Error fetching sales records:', err)
    );

    return () => {
      unsubStock();
      unsubHistory();
      unsubSales();
    };
  }, [currentUser, isAdmin]);

  return (
    <AdminLayout
      currentSection={currentSection}
      onSelectSection={setCurrentSection}
      onExitAdmin={onExitAdmin}
    >
      {currentSection === 'dashboard' && (
        <AdminDashboard
          stockItems={stockItems}
          sales={sales}
          stockHistory={stockHistory}
          onNavigate={setCurrentSection}
        />
      )}

      {currentSection === 'stock' && (
        <AdminStock stockItems={stockItems} stockHistory={stockHistory} />
      )}

      {currentSection === 'sales' && (
        <AdminSales
          stockItems={stockItems}
          recentSales={sales}
          onNavigateToHistory={() => setCurrentSection('history')}
        />
      )}

      {currentSection === 'history' && (
        <AdminSalesHistory sales={sales} stockItems={stockItems} />
      )}

      {currentSection === 'gallery' && <AdminGallery />}

      {currentSection === 'contact' && <AdminContactSettings />}
    </AdminLayout>
  );
}
