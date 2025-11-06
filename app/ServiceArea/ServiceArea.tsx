import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import { HeroSection, BlogContentSection } from "./sections";
import SEO from "../../src/utils/SEO";

const ServiceAreaDetails = (): JSX.Element => {
  const { slug } = useParams();
  const [serviceArea, setServiceArea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    fetch(
      `https://interiorvillabd.com/api/service-areas?where[slug][equals]=${slug}&depth=1&draft=false`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json?.docs?.[0]) {
          const area = json.docs[0];
          setServiceArea({
            ...area,
            name: area.areaName,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch service area details:", err);
        setLoading(false);
      });
  }, [slug]);

  const seo = serviceArea?.seoDetails;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!serviceArea) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Service area not found</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url={`https://interiorvillabd.com/service-areas/${slug}`}
          image={serviceArea?.featuredImage?.url}
        />
      )}

      <CustomCursor className="custom-cursor" />

      <HeroSection serviceArea={serviceArea} />

      <article className="w-full">
        <BlogContentSection serviceArea={serviceArea} />
      </article>

      <FooterSection />
    </main>
  );
};

export { ServiceAreaDetails };
