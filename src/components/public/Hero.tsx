import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FarmLogo } from '../common/FarmLogo';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import hensHeroBg from '../../assets/images/hens_hero_bg_1790425293991.jpg';

interface HeroProps {
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  onNavigateToStock: () => void;
  onNavigateToContact: () => void;
}

export function Hero({ onOpenAuthModal, onNavigateToStock, onNavigateToContact }: HeroProps) {
  const { currentUser } = useAuth();
  const { t, isRtl } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-emerald-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Real Hens Background Photo - Clearly Visible */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src={hensHeroBg}
          alt="Layer Hens in Farm Shed Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-right lg:object-center"
        />
        {/* Dynamic gradient: darker on text side, crystal clear on hens side */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-950/25"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-emerald-950/40"></div>
      </div>

      {/* Subtle organic pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('farmTagline')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {t('farmName')}
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('farmSubtitle')}
            </p>

            {/* Feature pill highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs sm:text-sm text-emerald-200">
              <span className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-1 rounded-lg border border-emerald-700/40">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Grade-A Table Eggs</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-1 rounded-lg border border-emerald-700/40">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>BV-300 / Lohmann Layers</span>
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-1 rounded-lg border border-emerald-700/40">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Since 2024</span>
              </span>
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {currentUser ? (
                <button
                  id="hero-view-stock-btn"
                  onClick={onNavigateToStock}
                  className="w-full sm:w-auto px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-base group"
                >
                  <span>{t('navStock')}</span>
                  <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </button>
              ) : (
                <>
                  <button
                    id="hero-signin-btn"
                    onClick={() => onOpenAuthModal('signin')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <span>{t('navLogin')}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    id="hero-signup-btn"
                    onClick={() => onOpenAuthModal('signup')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <span>{t('navRegister')}</span>
                  </button>
                </>
              )}
              <button
                id="hero-contact-btn"
                onClick={onNavigateToContact}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-white/10 text-emerald-200 font-medium rounded-2xl transition-colors"
              >
                {t('navContact')}
              </button>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-emerald-50">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <FarmLogo size="lg" className="ring-2 ring-amber-400 shadow-xl" />
                  <div>
                    <h3 className="font-bold text-lg text-white">Noor Muhammad Farm</h3>
                    <p className="text-xs text-amber-300 font-medium">Layer Poultry & Table Eggs</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-emerald-300 block">Egg Collection</span>
                  <span className="text-2xl font-black text-white mt-1 block">Twice Daily</span>
                  <span className="text-[11px] text-emerald-400">Morning & Afternoon</span>
                </div>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-emerald-300 block">Flock Health</span>
                  <span className="text-2xl font-black text-amber-300 mt-1 block">100%</span>
                  <span className="text-[11px] text-emerald-400">Vet Supervised</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-600/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Wholesale crate orders, ready-to-lay pullets, and organic layer manure available with verified biosecure transport.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
