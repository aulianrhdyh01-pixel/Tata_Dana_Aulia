import React from 'react';
import { 
  Navbar, 
  Hero, 
  ProblemSolution, 
  FeatureBlocks, 
  Testimonials, 
  PricingSection, 
  FaqAccordion, 
  FinalCta, 
  Footer 
} from '@/components/landing';
import { InteractiveSimulatorSection } from '@/components/simulator';

export const metadata = {
  title: 'TataDana — SaaS Manajemen Keuangan Pribadi Indonesia via Telegram Bot & AI',
  description: 'Catat pengeluaran & pemasukan semudah kirim pesan Telegram. Didukung AI Vision OCR Struk, Voice Note STT 60s, Multi-Wallet, Budget Alerts, dan Web Dashboard Real-time berstandar WIB.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Sticky Navbar with Orange Accents */}
      <Navbar />

      {/* Problem-Aware Hero Section with Trust Badges */}
      <Hero />

      {/* Problem vs Solution Section */}
      <ProblemSolution />

      {/* Real-Time Interactive Sandbox / Telegram Simulator Section */}
      <InteractiveSimulatorSection />

      {/* 3 Alternating Rich Feature Blocks */}
      <FeatureBlocks />

      {/* Authentic Indonesian User Stories */}
      <Testimonials />

      {/* Interactive Pricing Toggle (Starter vs Pro) */}
      <PricingSection />

      {/* 7+ Comprehensive Financial & Privacy FAQs */}
      <FaqAccordion />

      {/* High-Impact Final CTA */}
      <FinalCta />

      {/* Sleek 4-Column Footer */}
      <Footer />
    </main>
  );
}
