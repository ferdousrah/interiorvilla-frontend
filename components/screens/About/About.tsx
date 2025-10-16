// About Us
import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import {
  ExperienceSection,
  ApproachSection,
  MissionVisionSection,
  TeamSection,
  CTASection
} from "./sections";
import { PageHero } from "../../ui/PageHero";
import SEO from "../../../src/utils/SEO";

const About = (): JSX.Element => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/about?depth=1&draft=false&locale=undefined")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching About data:", err);
        setLoading(false);
      });
  }, []);

  const hero = data?.hero || { title: "About Us", heroImage: null };
  const seoDetails = data?.seoDetails;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      {/* SEO from CMS */}
      {seoDetails && (
        <SEO
          title={seoDetails.metaTitle}
          description={seoDetails.metaDescription}
          keywords={seoDetails.metaKey}
          extraJsonLd={seoDetails.seoStructuredData}
          url="https://interiorvillabd.com/about"
          type="AboutPage"
        />
      )}

      {/* Hero Section from CMS */}
      <PageHero
        title={hero?.title || "About Us"}
        bgImage={
          hero?.heroImage?.sizes?.large?.url
            ? `${hero.heroImage.sizes.large.url.replace(/\.[^.]+$/, ".webp")}`
            : "/image.webp" // ✅ fallback also in webp
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about", isActive: true },
        ]}
      />

      {/* Main Content */}
      {loading ? (
        <section className="w-full min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 [font-family:'Fahkwang',Helvetica]">Loading content...</p>
          </div>
        </section>
      ) : (
        <>
          <section className="w-full">
            <ExperienceSection />
            <ApproachSection />
            <MissionVisionSection />
            <TeamSection />
            <CTASection />
          </section>

          {/* Footer */}
          <FooterSection />
        </>
      )}
    </main>
  );
};

export { About };
