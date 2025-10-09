import React from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  BlogGridSection
} from "./sections";

const Blog = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Container */}
      <div className="w-full">
        {/* Blog Grid Section */}
        <BlogGridSection />
      </div>
      
      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Blog;