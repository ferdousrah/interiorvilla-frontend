import { Metadata } from 'next';

export interface CMSSeoDetails {
  metaTitle: string;
  metaDescription: string;
  metaKey?: string;
  seoStructuredData?: string | object;
}

export async function fetchCMSSeoData(
  endpoint: string
): Promise<CMSSeoDetails | null> {
  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Failed to fetch SEO data from ${endpoint}`);
      return null;
    }

    const data = await response.json();
    return data?.seoDetails || null;
  } catch (error) {
    console.error('Error fetching CMS SEO data:', error);
    return null;
  }
}

export function generateMetadataFromCMS(
  seoDetails: CMSSeoDetails | null,
  fallbackTitle: string,
  fallbackDescription: string,
  canonicalUrl: string
): Metadata {
  if (!seoDetails) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const metadata: Metadata = {
    title: seoDetails.metaTitle || fallbackTitle,
    description: seoDetails.metaDescription || fallbackDescription,
    keywords: seoDetails.metaKey?.split(',').map(k => k.trim()),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoDetails.metaTitle || fallbackTitle,
      description: seoDetails.metaDescription || fallbackDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Interior Villa',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoDetails.metaTitle || fallbackTitle,
      description: seoDetails.metaDescription || fallbackDescription,
    },
  };

  return metadata;
}

export function generateStructuredData(
  seoStructuredData?: string | object
): object | null {
  if (!seoStructuredData) return null;

  try {
    if (typeof seoStructuredData === 'string') {
      const clean = seoStructuredData.replace(/<script[^>]*>|<\/script>/g, '').trim();
      return JSON.parse(clean);
    }
    return seoStructuredData;
  } catch (error) {
    console.error('Error parsing structured data:', error);
    return null;
  }
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Interior Villa',
    url: 'https://interiorvillabd.com',
    logo: 'https://interiorvillabd.com/interior-villa-dark.png',
    description: 'Premium Interior Design Services in Bangladesh',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+88 01748981590',
      contactType: 'customer service',
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildServiceSchema(opts: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
}) {
  const { name, description, url, areaServed = 'Bangladesh' } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    areaServed,
    provider: {
      '@type': 'Organization',
      name: 'Interior Villa',
      url: 'https://interiorvillabd.com',
    },
    url,
  };
}

export function buildProjectSchema(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  location?: string;
}) {
  const { name, description, url, image, datePublished, location } = opts;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    url,
    image: image ? [image] : undefined,
    datePublished,
    contentLocation: location
      ? { '@type': 'Place', name: location }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Interior Villa',
      logo: {
        '@type': 'ImageObject',
        url: 'https://interiorvillabd.com/interior-villa-dark.png',
      },
    },
  };
}
