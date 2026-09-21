import { useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FarmLogo } from '../../components/common/FarmLogo';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  History,
  Settings,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Globe,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';

export type AdminSection = 'dashboard' | 'stock' | 'sales' | 'history' | 'contact';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onExitAdmin: () => void;
  children: ReactNode;
}

export function AdminLayout({
  currentSection,
  onSelectSection,
  onExitAdmin,
  children,
}: AdminLayoutProps) {
  const { currentUser, isAdmin, loading, signOut } = useAuth();
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Security guard: If not an admin, redirect / display unauthorized banner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Admin Panel is reserved for authorized farm administrators. Your account (
            <span className="font-semibold text-slate-800">{currentUser?.email || 'Logged Out'}</span>)
            does not have administrative clearance.
          </p>
          <div className="pt-2">
            <button
              onClick={onExitAdmin}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Return to Public Farm Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: t('adminDashboard'), icon: LayoutDashboard },
    { id: 'stock', label: t('adminStock'), icon: Boxes },
    { id: 'sales', label: t('adminSales'), icon: ShoppingCart },
    { id: 'history', label: t('adminSalesHistory'), icon: History },
    { id: 'contact', label: t('adminContactSettings'), icon: Settings },
  ];

  const handleNav = (section: AdminSection) => {
    onSelectSection(section);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-emerald-900 text-amber-300"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <FarmLogo size="xs" showRing={false} />
          <span className="font-bold text-sm tracking-tight">Admin Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-1.5 text-xs bg-emerald-900 rounded-lg text-amber-300 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'UR' : 'EN'}</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="text-xs bg-white/10 px-2.5 py-1.5 rounded-lg text-emerald-100"
          >
            Storefront
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 z-40 w-72 bg-emerald-950 text-emerald-100 flex flex-col justify-between border-r border-emerald-900/80 transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Farm Branding */}
        <div>
          <div className="p-6 border-b border-emerald-900 flex items-center gap-3">
            <FarmLogo size="md" showRing={true} className="ring-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm text-white truncate">
                Noor Muhammad Farm
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                  Admin System
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-slate-950' : 'text-amber-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-emerald-900/80 space-y-3">
          {/* User Account Info */}
          <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Logged In Admin
              </span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-xs text-white font-semibold truncate mt-1">
              {currentUser.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="admin-lang-toggle"
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-900/60 hover:bg-emerald-900 text-xs font-semibold rounded-xl text-emerald-200 transition-colors border border-emerald-800"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            <button
              id="admin-back-storefront"
              onClick={onExitAdmin}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-900/60 hover:bg-emerald-900 text-xs font-semibold rounded-xl text-emerald-200 transition-colors border border-emerald-800"
              title="Return to public storefront"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              <span>Storefront</span>
            </button>
          </div>

          <button
            id="admin-logout-btn"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 text-xs font-semibold rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
