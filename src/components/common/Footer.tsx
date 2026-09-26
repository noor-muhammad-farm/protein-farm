import { useLanguage } from '../../context/LanguageContext';
import { Heart, Globe } from 'lucide-react';
import { FarmLogo } from './FarmLogo';

export function Footer() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100/80 border-t border-emerald-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-900">
          
          <div className="flex items-center gap-3.5">
            <FarmLogo size="lg" showRing={true} className="shadow-lg shadow-black/30 ring-amber-400" />
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-white block">
                {t('farmName')}
              </span>
              <span className="text-xs text-amber-300 font-medium">
                {t('farmTagline')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span>© {new Date().getFullYear()} Noor Muhammad Protein Farm. All rights reserved.</span>
            <button
              id="footer-language-btn"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900 hover:bg-emerald-850 rounded-lg text-amber-300 font-medium transition-colors border border-emerald-800"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'اردو زبان' : 'English'}</span>
            </button>
          </div>

        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
          <p>Layer Poultry Farming & Commercial Egg Production Portal</p>
          <p className="flex items-center gap-1">
            <span>Pure Protein for a Healthier Community</span>
          </p>
        </div>

        {/* Developer Attribution */}
        <div className="mt-6 pt-5 border-t border-emerald-900/70 text-center text-xs text-emerald-300/80">
          <p className="tracking-wide">
            Developed by{' '}
            <a
              href="https://nasir-iqbal.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 underline-offset-2 transition-colors cursor-pointer"
            >
              Nasir Iqbal
            </a>{' '}
            & <span className="font-semibold text-amber-300 hover:text-amber-200 transition-colors">Haseeb Ijaz</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
