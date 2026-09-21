import { useLanguage } from '../../context/LanguageContext';
import { Egg, Heart, Globe } from 'lucide-react';

export function Footer() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100/80 border-t border-emerald-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-900">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Egg className="w-6 h-6 fill-emerald-950 stroke-emerald-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white block">
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
      </div>
    </footer>
  );
}
