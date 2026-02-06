"use client"

import Navbar from "../components/Navbar";
import TrustHighlights from "../components/TrustHighlights";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import IndustriesServed from "../components/IndustriesServed";
import TestimonialsSection from "../components/TestimonialsSection";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";
import HeroSection from "@/app/components/ProfessionalHeroSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <TrustHighlights />
        <AboutSection />
        <ServicesSection />
        <IndustriesServed />
        <TestimonialsSection />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
