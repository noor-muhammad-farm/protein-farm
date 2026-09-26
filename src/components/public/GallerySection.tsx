import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GalleryPhoto } from '../../types';
import { subscribeToGalleryPhotos, DEFAULT_GALLERY_PHOTOS } from '../../services/galleryService';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Maximize2,
  X,
  Images,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export function GallerySection() {
  const { t, language, isRtl } = useLanguage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Subscribe to real-time gallery photos from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToGalleryPhotos(
      (data) => {
        if (data && data.length > 0) {
          setPhotos(data);
          // Keep current index bounded
          setCurrentIndex((prev) => (prev >= data.length ? 0 : prev));
        } else {
          // If firestore is empty, fall back to default curated farm photos
          setPhotos(DEFAULT_GALLERY_PHOTOS);
        }
      },
      (err) => {
        console.warn('Using default gallery photos due to listener fallback:', err);
        setPhotos(DEFAULT_GALLERY_PHOTOS);
      }
    );

    return () => unsubscribe();
  }, []);

  const totalPhotos = photos.length;

  // Auto-scroll timer
  useEffect(() => {
    if (!isAutoPlaying || totalPhotos <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPhotos);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, totalPhotos, currentIndex]);

  const handleNext = () => {
    if (totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrev = () => {
    if (totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleSelect = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      if (isRtl) handlePrev();
      else handleNext();
    } else if (isRightSwipe) {
      if (isRtl) handleNext();
      else handlePrev();
    }
  };

  const currentPhoto = photos[currentIndex] || DEFAULT_GALLERY_PHOTOS[0];

  return (
    <section
      id="gallery-section"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-emerald-950/5 border-b border-slate-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold tracking-wide uppercase shadow-xs">
            <Images className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ur' ? 'فارم تصویری گیلری' : 'Farm Photo Gallery'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ur'
              ? 'نور محمد پروٹین فارم کی کامیابیاں (Achievements of Noor Muhammad Protein Farm)'
              : 'Achievements of Noor Muhammad Protein Farm'}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {language === 'ur'
              ? 'ہمارے جدید کنٹرولڈ شیڈز، صحت مند لیئر مرغیوں اور روزانہ کی تازہ انڈوں کی چنائی کا براہِ راست مشاہدہ کریں۔'
              : 'Explore our state-of-the-art poultry sheds, flourishing layer flocks, and daily Grade-A fresh egg harvesting.'}
          </p>
        </div>

        {/* Main Showcase Slider Box */}
        <div
          className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Visual Slide */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] w-full max-h-[560px] overflow-hidden bg-slate-950 group">
            {/* The Active Image - Completely Clear with No Bottom Shadow */}
            <img
              key={currentPhoto.id}
              src={currentPhoto.imageUrl}
              alt={currentPhoto.title}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-105"
              loading="lazy"
            />

            {/* Top Bar inside image: Category badge, Slide counter, and Fullscreen button */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {currentPhoto.category && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-xs backdrop-blur-md shadow-md border border-emerald-400/30">
                    {currentPhoto.category}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/10">
                  {currentIndex + 1} / {totalPhotos}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-scroll toggle badge */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
                    isAutoPlaying
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-black/60 text-white/80 hover:bg-black/80'
                  }`}
                  title={isAutoPlaying ? 'Pause Auto Scroll' : 'Start Auto Scroll'}
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">
                        {language === 'ur' ? 'آٹو اسکرول فعال' : 'Auto Playing'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">
                        {language === 'ur' ? 'چلائیں' : 'Play Auto'}
                      </span>
                    </>
                  )}
                </button>

                {/* Lightbox / Zoom Button */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-md border border-white/20 shadow-md"
                  title="View Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Left & Right Navigation Arrows */}
            {totalPhotos > 1 && (
              <>
                <button
                  id="gallery-prev-btn"
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-2xl bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 border border-white/20 shadow-xl z-10"
                  aria-label="Previous Photo"
                >
                  {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>

                <button
                  id="gallery-next-btn"
                  onClick={handleNext}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-2xl bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 border border-white/20 shadow-xl z-10"
                  aria-label="Next Photo"
                >
                  {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}

            {/* Animated Auto-Advance Progress Line at Bottom */}
            {isAutoPlaying && totalPhotos > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                <div
                  key={`progress-${currentIndex}`}
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-[4500ms] ease-linear w-full animate-pulse"
                />
              </div>
            )}
          </div>

          {/* Photo Details Bar Below the Image - Clear & outside the image */}
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="max-w-3xl space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {language === 'ur' && currentPhoto.titleUrdu
                  ? currentPhoto.titleUrdu
                  : currentPhoto.title}
              </h3>
              {currentPhoto.description && (
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  {currentPhoto.description}
                </p>
              )}
            </div>
            {currentPhoto.category && (
              <span className="self-start sm:self-center px-3.5 py-1 rounded-full bg-emerald-700/80 text-white font-bold text-xs shadow-xs border border-emerald-500/30 shrink-0">
                {currentPhoto.category}
              </span>
            )}
          </div>

          {/* Interactive Thumbnails Bar Beneath Slide */}
          {totalPhotos > 1 && (
            <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/80">
              <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 mx-auto">
                  {photos.map((photo, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={photo.id || idx}
                        onClick={() => handleSelect(idx)}
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 shrink-0 ${
                          isActive
                            ? 'ring-2 ring-amber-400 scale-105 opacity-100 shadow-lg'
                            : 'opacity-50 hover:opacity-85 hover:scale-100'
                        }`}
                        title={photo.title}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-16 h-12 sm:w-20 sm:h-14 object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-amber-400/20 border-2 border-amber-400 rounded-xl" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full">
            <div>
              <h4 className="font-bold text-lg text-white">
                {language === 'ur' && currentPhoto.titleUrdu
                  ? currentPhoto.titleUrdu
                  : currentPhoto.title}
              </h4>
              <p className="text-xs text-slate-400">
                Photo {currentIndex + 1} of {totalPhotos}
              </p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Image */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 my-auto">
            <img
              src={currentPhoto.imageUrl}
              alt={currentPhoto.title}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />

            {/* Prev/Next in Lightbox */}
            {totalPhotos > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption in Lightbox */}
          <div className="text-center text-slate-300 text-sm max-w-2xl mx-auto pb-4">
            <p>{currentPhoto.description || currentPhoto.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
