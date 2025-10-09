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

const LoadingGate = ({ children }: { children: React.ReactNode }) => {
  const { loading, error } = useProject();
  if (loading) return <div className="w-full py-24 text-center text-[#626161]">Loading project…</div>;
  if (error) return <div className="w-full py-24 text-center text-red-600">Failed to load project: {error}</div>;
  return <>{children}</>;
};

const ProjectDetailsInner = () => (
  <>
    <HeroSection />
    <article className="w-full">
      <BeforeAfterSection />
      <ProjectGallerySection />
      <ProjectInfoSection />
      <CTASection />
    </article>
  </>
);

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
        <LoadingGate>
          <ProjectDetailsInner />
        </LoadingGate>
      </ProjectProvider>

      <FooterSection />
    </main>
  );
};

export default ProjectDetails;
