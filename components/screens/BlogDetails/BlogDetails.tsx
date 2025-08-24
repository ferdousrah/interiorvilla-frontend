import React from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  BlogContentSection
} from "./sections";

const BlogDetails = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Container */}
      <article className="w-full">
        {/* Blog Content Section with Sidebar */}
        <BlogContentSection />
      </article>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { BlogDetails };