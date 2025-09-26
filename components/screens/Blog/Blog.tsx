import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  BlogGridSection
} from "./sections";

import { PageHero } from "../../ui/PageHero";

const Blog = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <PageHero
        title="Blog"
        bgImage="/image.png"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", isActive: true },
        ]}
      />      

      {/* Main Content Container */}
      <section className="w-full">
        {/* Blog Grid Section */}
        <BlogGridSection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { Blog };