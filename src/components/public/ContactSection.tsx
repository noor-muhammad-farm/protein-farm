import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { subscribeToContactSettings, DEFAULT_CONTACT_SETTINGS } from '../../services/contactService';
import { ContactSettings } from '../../types';
import {
  Phone,
  MessageSquare,
  MapPin,
  Mail,
  User,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';

export function ContactSection() {
  const { t, language, isRtl } = useLanguage();
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    const unsub = subscribeToContactSettings((data) => {
      setContact(data);
    });
    return () => unsub();
  }, []);

  const formatWhatsAppUrl = (num: string, title: string) => {
    const cleanNumber = num.replace(/\D/g, '');
    const greeting = encodeURIComponent(
      `Hello ${title}, I am contacting you regarding Noor Muhammad Protein Farm order & inquiries.`
    );
    return `https://wa.me/${cleanNumber}?text=${greeting}`;
  };

  return (
    <section id="contact-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            {t('navContact')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('contactTitle')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('contactSubtitle')}
          </p>
        </div>

        {/* Contact Cards: Owner & Manager */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* 1. Owner Card */}
          <div
            id="contact-owner-card"
            className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-8 shadow-xl border border-emerald-800 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                      {t('ownerCardTitle')}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-0.5">
                      {contact.ownerName}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="my-6 space-y-3">
                <div className="flex items-center gap-3 text-emerald-100 text-sm">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium tracking-wide">{contact.ownerPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-200/80 text-xs">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Available for wholesale contracts & bulk commercial orders</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                id="owner-call-link"
                href={`tel:${contact.ownerPhone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{t('callNow')}</span>
              </a>
              <a
                id="owner-whatsapp-link"
                href={formatWhatsAppUrl(contact.ownerWhatsApp || contact.ownerPhone, contact.ownerName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('chatWhatsApp')}</span>
              </a>
            </div>
          </div>

          {/* 2. Manager Card */}
          <div
            id="contact-manager-card"
            className="bg-white text-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                      {t('managerCardTitle')}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                      {contact.managerName}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="my-6 space-y-3">
                <div className="flex items-center gap-3 text-slate-700 text-sm">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium tracking-wide">{contact.managerPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily deliveries, dispatch scheduling, and vehicle pickup inquiries</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                id="manager-call-link"
                href={`tel:${contact.managerPhone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>{t('callNow')}</span>
              </a>
              <a
                id="manager-whatsapp-link"
                href={formatWhatsAppUrl(contact.managerWhatsApp || contact.managerPhone, contact.managerName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('chatWhatsApp')}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Farm Address, Email & Map */}
        <div className="mt-12 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{t('addressLabel')}</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {language === 'ur' && contact.farmAddressUrdu ? contact.farmAddressUrdu : contact.farmAddress}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>{t('emailLabelContact')}</span>
              </div>
              <a
                href={`mailto:${contact.farmEmail}`}
                className="text-emerald-700 hover:text-emerald-900 font-medium text-sm underline"
              >
                {contact.farmEmail}
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Farm Visit Protocol:</strong> For poultry health and biosecurity reasons, vehicle tire wash and shoe disinfectant are mandatory before entering sheds.
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="lg:col-span-7 h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-200 relative">
            {contact.mapEmbedUrl ? (
              <iframe
                title="Noor Muhammad Protein Farm Location"
                src={contact.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-100">
                <MapPin className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-semibold">{t('farmName')}</p>
                <p className="text-xs text-slate-400 mt-1">{contact.farmAddress}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
