import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { StockPage } from './pages/public/StockPage';
import { AdminPage } from './pages/admin/AdminPage';
import { AuthModal } from './pages/auth/AuthModal';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Sync hash routing if user opens with #admin or #stock
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin' || hash === 'stock' || hash === 'home' || hash === 'contact' || hash === 'gallery') {
        setActiveView(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash when activeView changes
  const handleSelectView = (view: string) => {
    if (view === 'gallery') {
      if (activeView !== 'home') {
        setActiveView('home');
      }
      setTimeout(() => {
        const el = document.getElementById('gallery-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      window.location.hash = 'gallery';
      return;
    }

    if (view === 'contact') {
      if (activeView !== 'home') {
        setActiveView('home');
      }
      setTimeout(() => {
        const el = document.getElementById('contact-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      window.location.hash = 'contact';
      return;
    }

    // Security guard: If non-admin tries to open admin, redirect to home
    if (view === 'admin' && !isAdmin) {
      setActiveView('home');
      window.location.hash = 'home';
      return;
    }

    setActiveView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // If activeView is 'admin' and user is an admin, render the comprehensive Admin Panel
  if (activeView === 'admin') {
    if (!isAdmin) {
      // Non-admins redirected to storefront as required
      setActiveView('home');
    } else {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
          <AdminPage onExitAdmin={() => handleSelectView('home')} />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900 font-sans selection:bg-amber-300 selection:text-slate-950">
      <Navbar
        activeView={activeView}
        setActiveView={handleSelectView}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <div className="flex-1">
        {activeView === 'stock' ? (
          <StockPage onOpenAuthModal={handleOpenAuthModal} />
        ) : (
          <HomePage
            onOpenAuthModal={handleOpenAuthModal}
            onNavigateToStock={() => handleSelectView('stock')}
            onNavigateToContact={() => handleSelectView('contact')}
          />
        )}
      </div>

      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastContainer />
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
