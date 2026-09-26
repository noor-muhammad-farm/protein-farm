import { Hero } from '../../components/public/Hero';
import { GallerySection } from '../../components/public/GallerySection';
import { AboutUs } from '../../components/public/AboutUs';
import { ContactSection } from '../../components/public/ContactSection';

interface HomePageProps {
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  onNavigateToStock: () => void;
  onNavigateToContact: () => void;
}

export function HomePage({
  onOpenAuthModal,
  onNavigateToStock,
  onNavigateToContact,
}: HomePageProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Hero
        onOpenAuthModal={onOpenAuthModal}
        onNavigateToStock={onNavigateToStock}
        onNavigateToContact={onNavigateToContact}
      />
      <GallerySection />
      <AboutUs />
      <ContactSection />
    </main>
  );
}
