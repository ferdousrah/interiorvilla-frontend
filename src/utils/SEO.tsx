// utils/SEO.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  extraJsonLd?: string | object; // ✅ accept raw string or object
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  extraJsonLd,
}) => {
  // Normalize extraJsonLd (handle string <script>...</script> from Payload)
  let jsonLdContent: object | null = null;

  if (typeof extraJsonLd === "string") {
    try {
      // Strip <script> tags if present
      const clean = extraJsonLd.replace(/<script[^>]*>|<\/script>/g, "").trim();
      jsonLdContent = JSON.parse(clean);
    } catch (err) {
      console.error("Invalid JSON-LD string in SEO:", err);
    }
  } else if (typeof extraJsonLd === "object") {
    jsonLdContent = extraJsonLd;
  }

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Structured Data */}
      {jsonLdContent && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLdContent)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;


/* -----------------------------------------------
   Page-specific SEO data presets
------------------------------------------------ */
export const seoData = {
  home: {
    title: "Interior Villa - Premium Interior Design Services in Bangladesh",
    description:
      "Transform your space with Interior Villa's expert interior design services. Specializing in residential, commercial, and architectural consultancy in Bangladesh. 9+ years of experience, 1000+ projects completed.",
    keywords:
      "interior design, Bangladesh, residential interior, commercial interior, architectural consultancy, home design, office design, interior decorator, Dhaka",
    url: "https://interiorvillabd.com",
    type: "website",
  },
  about: {
    title: "About Us - Interior Villa | Leading Interior Design Company in Bangladesh",
    description:
      "Learn about Interior Villa's journey, mission, and expert team. 9+ years of experience in creating beautiful, functional spaces across Bangladesh with 1000+ completed projects.",
    keywords:
      "about interior villa, interior design company Bangladesh, interior design team, mission vision, experience",
    url: "https://interiorvillabd.com/about",
    type: "website",
  },
  contact: {
    title: "Contact Us - Interior Villa | Get Your Free Design Consultation",
    description:
      "Contact Interior Villa for your interior design needs. Located in Dhaka, Bangladesh. Call +88 01748981590 or email info@interiorvillabd.com for free consultation.",
    keywords:
      "contact interior villa, interior design consultation, Dhaka interior designer, free consultation",
    url: "https://interiorvillabd.com/contact",
    type: "website",
  },
  blog: {
    title: "Interior Design Blog - Tips, Trends & Inspiration | Interior Villa",
    description:
      "Discover the latest interior design trends, tips, and inspiration from Interior Villa's experts. Get insights into creating beautiful, functional spaces.",
    keywords:
      "interior design blog, design tips, home decor trends, interior inspiration, design ideas",
    url: "https://interiorvillabd.com/blog",
    type: "website",
  },
  portfolio: {
    title: "Portfolio - Interior Villa | Our Best Interior Design Projects",
    description:
      "Explore Interior Villa's portfolio of stunning residential, commercial, and architectural projects. See our expertise in transforming spaces across Bangladesh.",
    keywords:
      "interior design portfolio, residential projects, commercial projects, architectural consultancy, before after",
    url: "https://interiorvillabd.com/portfolio",
    type: "website",
  },
  residentialInterior: {
    title: "Residential Interior Design Services | Interior Villa Bangladesh",
    description:
      "Transform your home with Interior Villa's residential interior design services. Personalized designs, premium materials, and expert craftsmanship for your dream home.",
    keywords:
      "residential interior design, home interior, house design, bedroom design, living room design, kitchen design",
    url: "https://interiorvillabd.com/residential-interior",
    type: "service",
  },
  commercialInterior: {
    title: "Commercial Interior Design Services | Interior Villa Bangladesh",
    description:
      "Enhance your business space with Interior Villa's commercial interior design services. Office design, retail spaces, and corporate interiors that boost productivity.",
    keywords:
      "commercial interior design, office design, retail interior, corporate interior, workspace design",
    url: "https://interiorvillabd.com/commercial-interior",
    type: "service",
  },
  architecturalConsultancy: {
    title: "Architectural Consultancy Services | Interior Villa Bangladesh",
    description:
      "Expert architectural consultancy services from Interior Villa. Structural design, building planning, and technical documentation for your construction projects.",
    keywords:
      "architectural consultancy, building design, structural planning, architectural services, construction planning",
    url: "https://interiorvillabd.com/architectural-consultancy",
    type: "service",
  },
  bookAppointment: {
    title:
      "Book an Appointment - Interior Villa | Schedule Your Free Design Consultation",
    description:
      "Schedule a free consultation with Interior Villa's expert designers. Book your appointment today and start transforming your space with professional interior design services in Bangladesh.",
    keywords:
      "book appointment, interior design consultation, free consultation, schedule meeting, interior designer appointment, design consultation Bangladesh",
    url: "https://interiorvillabd.com/book-appointment",
    type: "website",
  },
  faq: {
    title:
      "FAQ - Interior Villa | Frequently Asked Questions About Interior Design",
    description:
      "Find answers to common questions about Interior Villa's interior design services, pricing, timelines, and process. Get all the information you need before starting your project.",
    keywords:
      "interior design FAQ, frequently asked questions, interior design process, pricing questions, design consultation FAQ",
    url: "https://interiorvillabd.com/faq",
    type: "website",
  },
  notFound: {
    title: "Page Not Found - Interior Villa | 404 Error",
    description:
      "The page you're looking for doesn't exist. Explore Interior Villa's interior design services, portfolio, and blog to find what you need.",
    keywords: "404 error, page not found, interior villa, interior design services",
    url: "https://interiorvillabd.com/404",
    type: "website",
  },
} as const;

/* -----------------------------------------------
   JSON-LD helpers to use in pages
------------------------------------------------ */

/** BlogPosting / Article schema */
export function buildBlogPostingSchema(opts: {
  headline: string;
  description: string;
  image?: string;
  url: string;
  datePublished: string; // ISO
  dateModified?: string; // ISO
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
}) {
  const {
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified,
    authorName = "Interior Villa",
    publisherName = "Interior Villa",
    publisherLogo = "https://interiorvillabd.com/interior-villa-dark.png",
  } = opts;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image: image ? [image] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: { "@type": "ImageObject", url: publisherLogo },
    },
  };
}

/** Portfolio Project schema (CreativeWork) */
export function buildProjectSchema(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string; // ISO
  location?: string;
}) {
  const { name, description, url, image, datePublished, location } = opts;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url,
    image: image ? [image] : undefined,
    datePublished,
    contentLocation: location
      ? { "@type": "Place", name: location }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Interior Villa",
      logo: {
        "@type": "ImageObject",
        url: "https://interiorvillabd.com/interior-villa-dark.png",
      },
    },
  };
}

/** Service schema (for your Services pages) */
export function buildServiceSchema(opts: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
}) {
  const { name, description, url, areaServed = "Bangladesh" } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    areaServed,
    provider: {
      "@type": "Organization",
      name: "Interior Villa",
      url: "https://interiorvillabd.com",
    },
    url,
  };
}

/** BreadcrumbList schema */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
