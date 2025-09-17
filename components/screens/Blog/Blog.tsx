import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  BlogGridSection
} from "./sections";

const Blog = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

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