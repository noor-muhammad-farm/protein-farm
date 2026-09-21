import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  getContactSettings,
  updateContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from '../../services/contactService';
import { ContactSettings } from '../../types';
import {
  Settings,
  Save,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function AdminContactSettings() {
  const { t, formatCurrency } = useLanguage();
  const toast = useToast();

  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContactSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContactSettings(settings);
      toast.success(
        'Settings Saved',
        'Contact settings updated. Public storefront now reflects your changes live!'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-semibold">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('adminContactSettings')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure farm leadership direct contact numbers, WhatsApp lines, address, and Google Map. Changes update the public storefront in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Owner Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Farm Owner Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.ownerName}
                    onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.ownerPhone}
                    onChange={(e) => setSettings({ ...settings, ownerPhone: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settings.ownerWhatsApp || ''}
                    onChange={(e) => setSettings({ ...settings, ownerWhatsApp: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Manager Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Farm Manager Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.managerName}
                    onChange={(e) => setSettings({ ...settings, managerName: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.managerPhone}
                    onChange={(e) => setSettings({ ...settings, managerPhone: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settings.managerWhatsApp || ''}
                    onChange={(e) => setSettings({ ...settings, managerWhatsApp: e.target.value })}
                    placeholder="+92 300 7654321"
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Farm Address & Email */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Farm Address & Digital Inquiries</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={settings.farmEmail}
                  onChange={(e) => setSettings({ ...settings, farmEmail: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farm Physical Address (English) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.farmAddress}
                  onChange={(e) => setSettings({ ...settings, farmAddress: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farm Address (Urdu)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={settings.farmAddressUrdu || ''}
                  onChange={(e) => setSettings({ ...settings, farmAddressUrdu: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Maps Embed URL
                </label>
                <input
                  type="url"
                  value={settings.mapEmbedUrl || ''}
                  onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Paste an embed link from Google Maps (Share → Embed a map) to render the live location on the public storefront.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? t('loading') : 'Save & Publish Contact Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4" />
              <span>Live Public Preview</span>
            </div>

            {/* Owner Preview Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-amber-300">
                Owner Contact Card
              </span>
              <h3 className="text-xl font-bold mt-1">{settings.ownerName}</h3>
              <p className="text-xs text-emerald-200 mt-1">{settings.ownerPhone}</p>
            </div>

            {/* Manager Preview Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700">
                Manager Contact Card
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{settings.managerName}</h3>
              <p className="text-xs text-slate-600 mt-1">{settings.managerPhone}</p>
            </div>

            {/* Address Preview */}
            <div className="text-xs text-slate-600 space-y-1 p-3 bg-slate-50 rounded-xl">
              <p><strong>Address:</strong> {settings.farmAddress}</p>
              <p><strong>Email:</strong> {settings.farmEmail}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
