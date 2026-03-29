import { Hero } from '@/components/marketing/Hero';
import { PlatformLogos } from '@/components/marketing/PlatformLogos';
import { FeatureShowcase } from '@/components/marketing/FeatureShowcase';
import { StatsCounter } from '@/components/marketing/StatsCounter';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { PricingTable } from '@/components/marketing/PricingTable';
import { TestimonialCarousel } from '@/components/marketing/TestimonialCarousel';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { CTASection } from '@/components/marketing/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformLogos />
      <FeatureShowcase />
      <StatsCounter />
      <HowItWorks />
      <PricingTable />
      <TestimonialCarousel />
      <FAQAccordion />
      <CTASection />
    </>
  );
}
