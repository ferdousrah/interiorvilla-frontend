import React from "react";
import { CustomCursor } from "../../../components/ui/cursor";
import { FooterSection } from "../../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  AboutSection,
  ProcessSection,
  ProjectsSection,
  CTASection
} from "./sections";

const BrandShowroomInterior = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Container */}
      <section className="w-full">
        {/* About Commercial Interior Section */}
        <AboutSection />
        
        {/* Our Process Section */}
        <ProcessSection />
        
        {/* Featured Projects Section */}
        <ProjectsSection />
        
        {/* CTA Section */}
        <CTASection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export default BrandShowroomInterior;