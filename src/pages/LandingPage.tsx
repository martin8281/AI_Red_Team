import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { HumanInLoop } from '../components/landing/HumanInLoop';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col selection:bg-brand-primary selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <HumanInLoop />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};
