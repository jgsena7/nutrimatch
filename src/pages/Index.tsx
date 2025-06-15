
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
