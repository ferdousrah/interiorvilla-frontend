import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  ContactSection
} from "./sections";

const Contact = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Container */}
      <section className="w-full">
        {/* Contact Section */}
        <ContactSection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { Contact };