// app/ProjectDetails/ProjectDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  ProjectInfoSection,
  BeforeAfterSection,
  ProjectGallerySection,
  CTASection,
} from "./sections";
import { ProjectProvider, useProject } from "./ProjectContext";
import SEO from "../../src/utils/SEO"; // ✅ import SEO component

const ProjectDetailsInner = () => {
  const { loading, error } = useProject();

  if (loading) {
    return (
      <>
        <section className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 [font-family:'Fahkwang',Helvetica]">Loading project...</p>
          </div>
        </section>
        <FooterSection />
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 [font-family:'Fahkwang',Helvetica]">Failed to load project: {error}</p>
          </div>
        </section>
        <FooterSection />
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <article className="w-full">
        <BeforeAfterSection />
        <ProjectGallerySection />
        <ProjectInfoSection />
        <CTASection />
      </article>
      <FooterSection />
    </>
  );
};

const ProjectDetails = (): JSX.Element => {
  const { slug } = useParams();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    // ✅ Fetch project by slug from Payload CMS
    fetch(
      `https://interiorvillabd.com/api/projects?where[slug][equals]=${slug}&depth=1&draft=false`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json?.docs?.[0]?.seoDetails) {
          setSeo(json.docs[0].seoDetails);
        }
      })
      .catch((err) => console.error("Failed to fetch project SEO:", err));
  }, [slug]);

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* ✅ Dynamic SEO per project */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url={`https://interiorvillabd.com/portfolio/project-details/${slug}`}
          extraJsonLd={seo.seoStructuredData}
        />
      )}

      <CustomCursor className="custom-cursor" />

      <ProjectProvider>
        <ProjectDetailsInner />
      </ProjectProvider>
    </main>
  );
};

export default ProjectDetails;
