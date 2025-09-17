import React from "react";
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
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
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
