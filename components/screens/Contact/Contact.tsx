// components/screens/Contact/Contact.tsx
import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import { PageHero } from "../../ui/PageHero";
import { ContactSection } from "./sections";
import SEO from "../../../src/utils/SEO"; // ✅ SEO component

interface ContactData {
  hero?: {
    heroImage?: { url?: string };
    title?: string;
  };
  seoDetails?: {
    metaTitle: string;
    metaDescription: string;
    metaKey?: string;
    seoStructuredData?: string;
  };
}

const Contact = (): JSX.Element => {
  const [data, setData] = useState<ContactData | null>(null);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/contact?depth=1&draft=false")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch Contact data:", err));
  }, []);

  const seo = data?.seoDetails;
  const hero = data?.hero;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* ✅ Dynamic SEO from CMS */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url="https://interiorvillabd.com/contact"
          extraJsonLd={seo.seoStructuredData}
        />
      )}

      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      {/* Hero Section from CMS */}
      <PageHero
        title={hero?.title || "Contact Us"}
        bgImage={
          hero?.heroImage?.url
            ? hero.heroImage.url.replace(/\.(jpg|png)$/i, ".webp") // ✅ ensure .webp
            : "/image.png"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us", isActive: true },
        ]}
      />

      {/* Main Content Container */}
      <section className="w-full">
        <ContactSection />
      </section>

      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { Contact };
