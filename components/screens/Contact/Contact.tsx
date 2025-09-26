import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  ContactSection
} from "./sections";

import { PageHero } from "../../ui/PageHero";

const Contact = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <PageHero
        title="Contact Us"
        bgImage="/image.png"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us", isActive: true },
        ]}
      />

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