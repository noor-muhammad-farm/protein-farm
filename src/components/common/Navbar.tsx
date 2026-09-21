import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Egg,
  Globe,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus,
  PackageCheck,
  PhoneCall,
  Home,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
}

export function Navbar({ activeView, setActiveView, onOpenAuthModal }: NavbarProps) {
  const { currentUser, isAdmin, signOut } = useAuth();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Farm Title */}
          <div
            id="nav-logo-link"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Egg className="w-7 h-7 fill-amber-300 stroke-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-emerald-950 tracking-tight leading-tight">
                  {t('farmName')}
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-700 hidden sm:block">
                {t('farmTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeView === 'home'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </button>

            {/* Current Stock - visible only after login as required */}
            {currentUser && (
              <button
                id="nav-link-stock"
                onClick={() => handleNavClick('stock')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeView === 'stock'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('navStock')}</span>
              </button>
            )}

            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('contact')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeView === 'contact'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('navContact')}</span>
            </button>

            {/* Admin Portal link for authorized admins */}
            {isAdmin && (
              <button
                id="nav-link-admin"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeView.startsWith('admin')
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{t('navAdmin')}</span>
                <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              </button>
            )}
          </nav>

          {/* Right side controls: Language toggle + User / Auth buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Language Toggle Button */}
            <button
              id="nav-language-toggle"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="Toggle English / اردو"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight max-w-[140px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isAdmin ? 'text-amber-700 font-bold' : 'text-emerald-700'
                    }`}
                  >
                    {isAdmin ? t('adminBadge') : t('customerBadge')}
                  </span>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={() => signOut()}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('navLogin')}</span>
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('navRegister')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-language-toggle"
              onClick={toggleLanguage}
              className="p-2 text-slate-700 bg-slate-100 rounded-xl"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2"
        >
          <button
            id="mobile-nav-home"
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
              activeView === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>{t('navHome')}</span>
          </button>

          {currentUser && (
            <button
              id="mobile-nav-stock"
              onClick={() => handleNavClick('stock')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
                activeView === 'stock' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
              }`}
            >
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('navStock')}</span>
            </button>
          )}

          <button
            id="mobile-nav-contact"
            onClick={() => handleNavClick('contact')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
              activeView === 'contact' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span>{t('navContact')}</span>
          </button>

          {isAdmin && (
            <button
              id="mobile-nav-admin"
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-semibold ${
                activeView.startsWith('admin')
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>{t('navAdmin')}</span>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">
                    {currentUser.role}
                  </p>
                </div>
                <button
                  id="mobile-nav-logout"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-700 font-semibold rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-nav-login"
                  onClick={() => {
                    onOpenAuthModal('signin');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-xl"
                >
                  {t('navLogin')}
                </button>
                <button
                  id="mobile-nav-register"
                  onClick={() => {
                    onOpenAuthModal('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-semibold text-white bg-emerald-700 rounded-xl shadow-xs"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
