import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  getContactSettings,
  updateContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  NOOR_MUHAMMAD_MAP_EMBED_URL,
  NOOR_MUHAMMAD_MAPS_DIRECT_URL,
  getEmbedUrlFromMapsUrl,
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
  Upload,
  Camera,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

export function AdminContactSettings() {
  const { t, language } = useLanguage();
  const toast = useToast();

  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // File input refs for uploading
  const ownerFileInputRef = useRef<HTMLInputElement>(null);
  const managerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContactSettings();
        if (!data.managerPhone || data.managerPhone.includes('7654321')) {
          data.managerPhone = '+923016119000';
        }
        if (!data.managerWhatsApp || data.managerWhatsApp.includes('7654321')) {
          data.managerWhatsApp = '923016119000';
        }
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Helper to compress image file to JPEG data URL
  const processImageFile = (
    file: File,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error(
        language === 'ur' ? 'فائل فارمیٹ درست نہیں' : 'Invalid Image',
        language === 'ur' ? 'براہ کرم کوئی تصویر منتخب کریں۔' : 'Please select an image file (JPG, PNG, WebP).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          onSuccess(compressed);
        } else {
          onSuccess(src);
        }
      };
      img.onerror = () => {
        toast.error('Error', 'Failed to process image.');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContactSettings(settings);
      toast.success(
        language === 'ur' ? 'ترتیبات محفوظ ہو گئیں' : 'Settings Saved',
        language === 'ur'
          ? 'رابطہ کی تفصیلات اور تصاویر کامیابی سے اپ ڈیٹ ہو گئیں!'
          : 'Contact details & leadership photos updated successfully!'
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
          {language === 'ur'
            ? 'فارم اونر اور مینیجر کے فون نمبرز، واٹس ایپ، تصاویر اور فارم لوکیشن سیٹ کریں۔'
            : 'Configure farm leadership direct contact numbers, WhatsApp lines, photos, address, and Google Map.'}
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
                <span>{language === 'ur' ? 'فارم اونر کی تفصیلات اور تصویر' : 'Farm Owner Details & Photo'}</span>
              </div>

              {/* Owner Photo Picker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {language === 'ur' ? 'اونر کی تصویر (Owner Photo)' : 'Owner Photo'}
                </label>
                <div className="flex items-center gap-4">
                  {/* Photo Preview / Avatar */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-emerald-950/10 border-2 border-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                    {settings.ownerPhotoUrl ? (
                      <img
                        src={settings.ownerPhotoUrl}
                        alt="Owner Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-amber-500" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={ownerFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (dataUrl) => {
                            setSettings({ ...settings, ownerPhotoUrl: dataUrl });
                          });
                        }
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => ownerFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'ur' ? 'تصویر اپلوڈ کریں' : 'Upload Photo'}</span>
                      </button>

                      {settings.ownerPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, ownerPhotoUrl: '' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ur' ? 'تصویر ہٹائیں' : 'Remove Photo'}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={settings.ownerPhotoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, ownerPhotoUrl: e.target.value })}
                      placeholder="یا تصویر کا لنک درج کریں (Or enter image URL)"
                      className="w-full py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
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
                <span>{language === 'ur' ? 'فارم مینیجر کی تفصیلات اور تصویر' : 'Farm Manager Details & Photo'}</span>
              </div>

              {/* Manager Photo Picker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {language === 'ur' ? 'مینیجر کی تصویر (Manager Photo)' : 'Manager Photo'}
                </label>
                <div className="flex items-center gap-4">
                  {/* Photo Preview / Avatar */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-emerald-950/10 border-2 border-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    {settings.managerPhotoUrl ? (
                      <img
                        src={settings.managerPhotoUrl}
                        alt="Manager Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={managerFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (dataUrl) => {
                            setSettings({ ...settings, managerPhotoUrl: dataUrl });
                          });
                        }
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => managerFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'ur' ? 'تصویر اپلوڈ کریں' : 'Upload Photo'}</span>
                      </button>

                      {settings.managerPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, managerPhotoUrl: '' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ur' ? 'تصویر ہٹائیں' : 'Remove Photo'}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={settings.managerPhotoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, managerPhotoUrl: e.target.value })}
                      placeholder="یا تصویر کا لنک درج کریں (Or enter image URL)"
                      className="w-full py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
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
                    placeholder="+923016119000"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Google Maps Embed URL / Place Link
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        mapEmbedUrl: NOOR_MUHAMMAD_MAP_EMBED_URL,
                        mapsDirectUrl: NOOR_MUHAMMAD_MAPS_DIRECT_URL,
                      })
                    }
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Reset to Official Farm Pin
                  </button>
                </div>
                <input
                  type="url"
                  value={settings.mapEmbedUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const converted = getEmbedUrlFromMapsUrl(val);
                    setSettings({ ...settings, mapEmbedUrl: converted });
                  }}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Supports both Google Maps Share / Place links and Embed URLs. Automatically formatted for live preview.
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
                <span>{saving ? t('loading') : (language === 'ur' ? 'رابطہ کی تفصیلات اور تصاویر محفوظ کریں' : 'Save & Publish Contact Details')}</span>
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
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-md">
                {settings.ownerPhotoUrl ? (
                  <img src={settings.ownerPhotoUrl} alt="Owner" className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-7 h-7 text-emerald-950" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-300">
                  Owner Contact Card
                </span>
                <h3 className="text-lg font-bold text-white truncate">{settings.ownerName}</h3>
                <p className="text-xs text-emerald-200 truncate">{settings.ownerPhone}</p>
              </div>
            </div>

            {/* Manager Preview Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-md">
                {settings.managerPhotoUrl ? (
                  <img src={settings.managerPhotoUrl} alt="Manager" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-emerald-950" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-300">
                  Manager Contact Card
                </span>
                <h3 className="text-lg font-bold text-white truncate">{settings.managerName}</h3>
                <p className="text-xs text-emerald-200 truncate">{settings.managerPhone}</p>
              </div>
            </div>

            {/* Address Preview */}
            <div className="text-xs text-slate-600 space-y-1 p-3 bg-slate-50 rounded-xl">
              <p><strong>Address:</strong> {settings.farmAddress}</p>
              <p><strong>Email:</strong> {settings.farmEmail}</p>
            </div>

            {/* Live Map Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Map Location Preview</span>
                </span>
                <a
                  href={settings.mapsDirectUrl || NOOR_MUHAMMAD_MAPS_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px]"
                >
                  <span>Verify on Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  title="Map Preview"
                  src={getEmbedUrlFromMapsUrl(settings.mapEmbedUrl)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
