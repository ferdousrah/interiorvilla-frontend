import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  ExperienceSection,
  ApproachSection,
  MissionVisionSection,
  TeamSection,
  CTASection
} from "./sections";

const About = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Container */}
      <section className="w-full">
        {/* Experience Section */}
        <ExperienceSection />
        
        {/* Our Approach Section */}
        <ApproachSection />
        
        {/* Mission & Vision Section */}
        <MissionVisionSection />
        
        {/* Meet Our Team Section */}
        <TeamSection />
        
        {/* CTA Section */}
        <CTASection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { About };