import { LandingHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero';
import { FeaturesSection } from '@/components/landing/features';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { PricingSection } from '@/components/landing/pricing';
import { FAQSection } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
