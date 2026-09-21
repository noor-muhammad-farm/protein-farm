import { useLanguage } from '../../context/LanguageContext';
import { Egg, ShieldCheck, Feather, Truck, Award, HeartPulse } from 'lucide-react';

export function AboutUs() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Egg,
      title: t('feat1Title'),
      desc: t('feat1Desc'),
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      icon: Feather,
      title: t('feat2Title'),
      desc: t('feat2Desc'),
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      icon: ShieldCheck,
      title: t('feat3Title'),
      desc: t('feat3Desc'),
      color: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      icon: Truck,
      title: t('feat4Title'),
      desc: t('feat4Desc'),
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  ];

  return (
    <section id="about-section" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            {t('navAbout')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('aboutTitle')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('aboutSubtitle')}
          </p>
        </div>

        {/* Narrative Box */}
        <div className="mt-12 bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 max-w-4xl mx-auto space-y-5 text-slate-700 leading-relaxed text-base">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('farmName')}</h3>
              <p className="text-xs text-slate-500">Excellence in Commercial Layer Poultry</p>
            </div>
          </div>
          <p>{t('aboutText1')}</p>
          <p>{t('aboutText2')}</p>
        </div>

        {/* 4 Feature Columns */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                id={`about-feature-${idx}`}
                className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
