import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { GalleryPhoto } from '../../types';
import {
  subscribeToGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  seedDefaultGalleryPhotos,
  DEFAULT_GALLERY_PHOTOS,
} from '../../services/galleryService';
import {
  Images,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Eye,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';

export function AdminGallery() {
  const { currentUser } = useAuth();
  const { language, isRtl } = useLanguage();
  const { success, error: toastError } = useToast();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Add Photo Form State
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [titleUrdu, setTitleUrdu] = useState<string>('');
  const [category, setCategory] = useState<string>('Layers & Birds');
  const [description, setDescription] = useState<string>('');
  const [order, setOrder] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Delete modal state
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time gallery photos from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToGalleryPhotos(
      (data) => {
        setPhotos(data);
        setLoading(false);
      },
      (err) => {
        console.error('Gallery subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update default order to photos.length + 1
  useEffect(() => {
    if (photos.length > 0) {
      setOrder(photos.length + 1);
    }
  }, [photos]);

  // Compress and convert uploaded image file to lightweight Base64 JPEG
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError(
        language === 'ur' ? 'غلط فائل فارمیٹ' : 'Invalid File Format',
        language === 'ur' ? 'براہ کرم تصویر فائل منتخب کریں۔' : 'Please select a valid image file.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG at 0.78 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          setUploadPreview(compressedDataUrl);
          setImageUrl(compressedDataUrl);
        } else {
          setUploadPreview(src);
          setImageUrl(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleResetForm = () => {
    setImageUrl('');
    setUploadPreview(null);
    setTitle('');
    setTitleUrdu('');
    setDescription('');
    setOrder(photos.length + 1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalImageUrl = imageUrl.trim();
    if (!finalImageUrl) {
      toastError(
        language === 'ur' ? 'تصویر درکار ہے' : 'Photo Required',
        language === 'ur' ? 'براہ کرم تصویر اپ لوڈ کریں یا درست یو آر ایل درج کریں۔' : 'Please upload an image or provide a valid image URL.'
      );
      return;
    }

    if (!title.trim()) {
      toastError(
        language === 'ur' ? 'عنوان درکار ہے' : 'Title Required',
        language === 'ur' ? 'براہ کرم تصویر کا عنوان درج کریں۔' : 'Please provide a photo title.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await addGalleryPhoto({
        imageUrl: finalImageUrl,
        title: title.trim(),
        titleUrdu: titleUrdu.trim() || undefined,
        description: description.trim() || undefined,
        category,
        order: Number(order) || photos.length + 1,
        createdBy: currentUser?.email || 'admin',
      });

      success(
        language === 'ur' ? 'تصویر گیلری میں شامل کر دی گئی' : 'Photo Added to Gallery',
        language === 'ur' ? 'نئی تصویر ویب سائٹ پر براہ راست دکھائی دے گی۔' : 'The photo is now visible on the public website.'
      );

      handleResetForm();
      setActiveTab('list');
    } catch (err: any) {
      console.error('Failed to add photo:', err);
      toastError(
        language === 'ur' ? 'تصویر شامل نہ ہو سکی' : 'Failed to Add Photo',
        err?.message || 'Error occurred while saving to Firestore.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryPhoto(photoToDelete.id);
      success(
        language === 'ur' ? 'تصویر کامیابی سے ڈیلیٹ کر دی گئی' : 'Photo Deleted',
        language === 'ur' ? 'تصویر کو گیلری سے ہٹا دیا گیا ہے۔' : 'The photo was removed from the gallery.'
      );
      setPhotoToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      toastError(
        language === 'ur' ? 'ڈیلیٹ نہ ہو سکی' : 'Delete Failed',
        err?.message || 'Error occurred while deleting photo.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm(
      language === 'ur'
        ? 'کیا آپ فارم کی معیاری تصاویر گیلری میں شامل کرنا چاہتے ہیں؟'
        : 'Do you want to seed the standard farm showcase photos into your database?'
    )) {
      return;
    }

    try {
      await seedDefaultGalleryPhotos(currentUser?.email || undefined);
      success(
        language === 'ur' ? 'معیاری تصاویر شامل کر دی گئیں' : 'Showcase Photos Loaded',
        language === 'ur' ? 'تمام طے شدہ تصاویر کامیابی سے شامل ہو گئیں۔' : 'Standard photos populated successfully.'
      );
    } catch (err: any) {
      toastError('Failed to seed showcase photos', err?.message);
    }
  };

  const categories = [
    'Layers & Birds',
    'Fresh Eggs',
    'Farm Facility',
    'Packaging',
    'Biosecurity',
    'Feed & Nutrition',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
              <Images className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {language === 'ur' ? 'فارم تصاویر گیلری مینیجر' : 'Farm Photo Gallery Manager'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {language === 'ur'
                  ? 'ویب سائٹ پر دکھانے کے لیے تصاویر شامل کریں، ترتیب دیں یا ڈیلیٹ کریں۔'
                  : 'Add, reorder, preview, and delete showcase photos displayed on the public website.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'list'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Images className="w-4 h-4" />
            <span>{language === 'ur' ? 'تمام تصاویر' : 'All Photos'}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 text-white font-mono">
              {photos.length}
            </span>
          </button>

          <button
            id="admin-add-photo-tab-btn"
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'add'
                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ur' ? 'نئی تصویر شامل کریں' : 'Add New Photo'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">
                {language === 'ur' ? 'گیلری میں نئی تصویر شامل کریں' : 'Add Showcase Photo to Gallery'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ur'
                  ? 'آپ اپنے موبائل یا کمپیوٹر سے تصویر منتخب کر سکتے ہیں یا کسی بھی امیج کا لنک دے سکتے ہیں۔'
                  : 'Upload an image directly from your device or paste an external image link.'}
              </p>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-6">
              {/* Image Input Mode Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {language === 'ur' ? 'تصویر کا ذریعہ' : 'Photo Source'}
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('upload');
                      setImageUrl(uploadPreview || '');
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                      inputMode === 'upload'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'ur' ? 'ڈیوائس سے اپ لوڈ کریں' : 'Upload From Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('url');
                      if (imageUrl.startsWith('data:')) {
                        setImageUrl('');
                      }
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                      inputMode === 'url'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'ur' ? 'امیج یو آر ایل (لنک)' : 'Image URL'}</span>
                  </button>
                </div>
              </div>

              {/* Upload Input */}
              {inputMode === 'upload' ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-sm text-slate-800">
                      {language === 'ur'
                        ? 'تصویر منتخب کرنے کے لیے یہاں کلک کریں'
                        : 'Click to select photo from your phone or PC'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (auto-compressed for fast loading)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'ur' ? 'تصویر کا ڈائریکٹ لنک (URL)' : 'Direct Image Link (URL)'}
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUploadPreview(null);
                    }}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                    required
                  />
                </div>
              )}

              {/* Preview Box */}
              {(uploadPreview || (inputMode === 'url' && imageUrl.trim())) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'تصویر کا پیش نظارہ (Preview)' : 'Image Preview'}</span>
                  </p>
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] max-h-64 bg-slate-900 flex items-center justify-center">
                    <img
                      src={uploadPreview || imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        toastError('Image Preview Error', 'Unable to load photo from provided URL.');
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title (English) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'ur' ? 'عنوان (انگریزی)' : 'Title (English)'} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Modern Layer Shed & Birds"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                    required
                  />
                </div>

                {/* Title (Urdu) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'ur' ? 'عنوان (اردو)' : 'Title (Urdu - اختیاری)'}
                  </label>
                  <input
                    type="text"
                    value={titleUrdu}
                    onChange={(e) => setTitleUrdu(e.target.value)}
                    placeholder="مثال: جدید کنٹرولڈ پولٹری شیڈ"
                    dir="rtl"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'ur' ? 'کیٹیگری' : 'Category / Tag'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Index */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'ur' ? 'ترتیب نمبر' : 'Display Sequence Order'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {language === 'ur' ? 'تفصیل / تفصیلات' : 'Short Description (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details regarding this farm section, vaccination, hygiene, or egg collection..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    setActiveTab('list');
                  }}
                  className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                </button>

                <button
                  id="admin-submit-photo-btn"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'ur' ? 'شامل کی جا رہی ہے...' : 'Adding Photo...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'ur' ? 'گیلری میں محفوظ کریں' : 'Save & Publish Photo'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photos List / Grid */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Quick info toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900">{photos.length}</span>
              <span>{language === 'ur' ? 'تصاویر گیلری میں موجود ہیں' : 'photos active in public gallery'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
                title="Populate standard authentic showcase farm photos"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {language === 'ur' ? 'طے شدہ فارم تصاویر شامل کریں' : 'Load Curated Showcase'}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                {language === 'ur' ? 'تصاویر لوڈ ہو رہی ہیں...' : 'Loading gallery photos...'}
              </p>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'ur' ? 'کوئی تصویر موجود نہیں ہے' : 'No Photos in Gallery'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {language === 'ur'
                  ? 'ویب سائٹ کے لیے نئی تصاویر اپ لوڈ کریں یا پہلے سے تیار شدہ معیاری تصاویر لوڈ کریں۔'
                  : 'Start by uploading photos of your layer birds, egg production, and farm sheds.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('add')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ur' ? 'پہلی تصویر شامل کریں' : 'Add First Photo'}</span>
                </button>
                <button
                  onClick={handleSeedDefaults}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'ur' ? 'طے شدہ تصاویر لوڈ کریں' : 'Load Default Showcase'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  id={`admin-photo-card-${photo.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Photo Visual */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white font-mono text-[11px] backdrop-blur-md">
                        #{photo.order ?? idx + 1}
                      </span>
                      {photo.category && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-white font-semibold text-[11px] backdrop-blur-md">
                          {photo.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-slate-900 text-base leading-tight">
                        {photo.title}
                      </h3>
                      {photo.titleUrdu && (
                        <p className="text-xs font-semibold text-emerald-800" dir="rtl">
                          {photo.titleUrdu}
                        </p>
                      )}
                      {photo.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {photo.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions: Delete Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Active'}
                      </span>

                      <button
                        id={`delete-photo-${photo.id}`}
                        onClick={() => setPhotoToDelete(photo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
                        title="Delete photo from gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'ur' ? 'ڈیلیٹ کریں' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'ur' ? 'تصویر ڈیلیٹ کرنے کی تصدیق' : 'Confirm Photo Deletion'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'ur'
                  ? `کیا آپ واقعی اس تصویر "${photoToDelete.title}" کو گیلری سے ختم کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکے گا۔`
                  : `Are you sure you want to permanently delete "${photoToDelete.title}" from the public showcase?`}
              </p>
            </div>

            {/* Thumbnail preview */}
            <div className="rounded-xl overflow-hidden aspect-[16/9] max-h-36 bg-slate-900 border border-slate-200">
              <img
                src={photoToDelete.imageUrl}
                alt={photoToDelete.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                disabled={deleting}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </button>

              <button
                id="confirm-delete-photo-btn"
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'ur' ? 'ہاں، ڈیلیٹ کریں' : 'Yes, Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
