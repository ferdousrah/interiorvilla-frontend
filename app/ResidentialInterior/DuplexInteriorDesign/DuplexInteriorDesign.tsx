// app/Services/Residential/DuplexInteriorDesign/DuplexInteriorDesign.tsx
import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../../components/ui/cursor";
import { FooterSection } from "../../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  AboutSection,
  ProcessSection,
  ProjectsSection,
  CTASection,
} from "./sections";
import { PageHero } from "../../../components/ui/PageHero";
import SEO from "../../../src/utils/SEO";

const DuplexInteriorDesign = (): JSX.Element => {
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(
          "https://interiorvillabd.com/api/services/4?depth=1&draft=false&locale=undefined"
        );
        if (!res.ok) throw new Error("Failed to fetch service data");
        const data = await res.json();
        setServiceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, []);

  const { hero, seoDetails, introSection, recentProjects } = serviceData || {};

  const metaTitle =
    seoDetails?.metaTitle || "Duplex Interior Design | Interior Villa";
  const metaDescription =
    seoDetails?.metaDescription || introSection?.description || "";
  const metaKeywords = seoDetails?.metaKey || "";
  const structuredData = seoDetails?.seoStructuredData || "";

  // ✅ Hero image (.webp fallback)
  const heroImage = hero?.heroImage?.url
    ? `https://interiorvillabd.com${hero.heroImage.url.replace(
        /\.(png|jpg|jpeg)$/i,
        ".webp"
      )}`
    : "/image.webp";

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      {/* ✅ SEO */}
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        image={heroImage}
        url="https://interiorvillabd.com/services/residential/duplex-interior-design"
        type="service"
        extraJsonLd={structuredData}
      />

      {/* ✅ Hero Section */}
      <PageHero
        title={hero?.title || "Duplex Interior Design"}
        bgImage={heroImage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services" },
          { label: "Residential Interior", href: "/services/residential-interior" },
          { label: "Duplex Interior Design", isActive: true },
        ]}
      />

      {loading ? (
        <section className="w-full min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 [font-family:'Fahkwang',Helvetica]">Loading content...</p>
          </div>
        </section>
      ) : error ? (
        <section className="w-full min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 [font-family:'Fahkwang',Helvetica]">Failed to load service data.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="w-full">
            <AboutSection
              title={introSection?.sectionTitle}
              description={introSection?.description}
            />
            <ProcessSection />
            <ProjectsSection
              //sectionTitle={recentProjects?.sectionTitle}
              description={recentProjects?.sectionDescription}
            />
            <CTASection />
          </section>

          {/* Footer */}
          <FooterSection />
        </>
      )}
    </main>
  );
};

export default DuplexInteriorDesign;
