import React from "react";
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

const LoadingGate = ({ children }: { children: React.ReactNode }) => {
  const { loading, error } = useProject();
  
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">Loading project details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2">
            Failed to Load Project
          </h2>
          <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-300 [font-family:'Fahkwang',Helvetica] font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const ProjectDetailsInner = () => {
  return (
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
};

const ProjectDetails = (): JSX.Element => {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2">
            Invalid Project
          </h2>
          <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">
            No project ID provided in the URL.
          </p>
        </div>
      </div>
    );
  }

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