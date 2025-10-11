const API_BASE = 'https://interiorvillabd.com/api';

const routeToApiMap = {
  '/': `${API_BASE}/globals/home?depth=1&draft=false`,
  '/about': `${API_BASE}/globals/about?depth=1&draft=false`,
  '/contact': `${API_BASE}/globals/contact?depth=1&draft=false`,
  '/blog': `${API_BASE}/globals/blog?depth=1&draft=false`,
  '/portfolio': `${API_BASE}/globals/portfolio?depth=1&draft=false`,
  '/book-appointment': `${API_BASE}/globals/book-appointment?depth=1&draft=false`,
  '/faq': `${API_BASE}/globals/faq?depth=1&draft=false`,

  // Main Service Pages
  '/services/residential-interior': `${API_BASE}/globals/residential-interior?depth=1&draft=false`,
  '/services/commercial-interior': `${API_BASE}/globals/commercial-interior?depth=1&draft=false`,
  '/services/architectural-consultancy': `${API_BASE}/globals/architectural-consultancy?depth=1&draft=false`,

  // Residential Interior Sub-pages
  '/services/residential/apartment-interior-design': `${API_BASE}/globals/apartment-interior-design?depth=1&draft=false`,
  '/services/residential/home-interior-design': `${API_BASE}/globals/home-interior-design?depth=1&draft=false`,
  '/services/residential/duplex-interior-design': `${API_BASE}/globals/duplex-interior-design?depth=1&draft=false`,

  // Commercial Interior Sub-pages
  '/services/commercial-interior/corporate-and-office-interior-design': `${API_BASE}/globals/corporate-office-interior?depth=1&draft=false`,
  '/services/commercial-interior/buying-house-office-interior-design': `${API_BASE}/globals/buying-house-office-interior?depth=1&draft=false`,
  '/services/commercial-interior/travel-agency-office-interior-design': `${API_BASE}/globals/travel-agency-office-interior?depth=1&draft=false`,
  '/services/commercial-interior/hotel-and-hospitality-interior-design': `${API_BASE}/globals/hotel-hospitality-interior?depth=1&draft=false`,
  '/services/commercial-interior/restaurant-and-cafe-interior-design': `${API_BASE}/globals/restaurant-cafe-interior?depth=1&draft=false`,
  '/services/commercial-interior/brand-showroom-interior-design': `${API_BASE}/globals/brand-showroom-interior?depth=1&draft=false`,
  '/services/commercial-interior/mens-salon-and-lifestyle-interior-design': `${API_BASE}/globals/salon-lifestyle-interior?depth=1&draft=false`,
  '/services/commercial-interior/hospital-and-clinic-interior-design': `${API_BASE}/globals/hospital-clinic-interior?depth=1&draft=false`,
  '/services/commercial-interior/pharmacy-interior-design': `${API_BASE}/globals/pharmacy-interior?depth=1&draft=false`,
  '/services/commercial-interior/dental-chamber-interior-design': `${API_BASE}/globals/dental-chamber-interior?depth=1&draft=false`,
  '/services/commercial-interior/spa-and-beauty-parlor-interior-design': `${API_BASE}/globals/spa-beauty-parlor-interior?depth=1&draft=false`,
  '/services/commercial-interior/resort-interior-design': `${API_BASE}/globals/resort-interior?depth=1&draft=false`,
  '/services/commercial-interior/retail-shop-interior-design': `${API_BASE}/globals/retail-shop-interior?depth=1&draft=false`,
  '/services/commercial-interior/educational-institute-interior-design': `${API_BASE}/globals/educational-institute-interior?depth=1&draft=false`,
  '/services/commercial-interior/fitness-center-interior-design': `${API_BASE}/globals/fitness-center-interior?depth=1&draft=false`,
};

export async function fetchSeoDataForRoute(path) {
  try {
    // Handle blog posts
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      const response = await fetch(
        `${API_BASE}/blog-posts?where[slug][equals]=${slug}&depth=1&draft=false`
      );
      const data = await response.json();
      const doc = data?.docs?.[0];

      if (!doc) return null;

      // Return seoDetails with featured image if available
      return {
        ...doc.seoDetails,
        featuredImage: doc.featuredImage?.url || doc.featuredImage,
      };
    }

    // Handle project details
    if (path.startsWith('/portfolio/project-details/')) {
      const slug = path.replace('/portfolio/project-details/', '');
      const response = await fetch(
        `${API_BASE}/projects?where[slug][equals]=${slug}&depth=1&draft=false`
      );
      const data = await response.json();
      const doc = data?.docs?.[0];

      if (!doc) return null;

      // Return seoDetails with featured image if available
      return {
        ...doc.seoDetails,
        featuredImage: doc.featuredImage?.url || doc.featuredImage,
      };
    }

    // Handle static/global pages
    const apiUrl = routeToApiMap[path];
    if (!apiUrl) return null;

    const response = await fetch(apiUrl);
    const data = await response.json();
    return data?.seoDetails || null;
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return null;
  }
}

export function generateMetaTags(seoDetails, canonicalUrl) {
  if (!seoDetails) return '';

  const { metaTitle, metaDescription, metaKey, seoStructuredData, featuredImage } = seoDetails;

  let tags = '';

  // Title tags
  if (metaTitle) {
    tags += `<title>${escapeHtml(metaTitle)}</title>\n`;
    tags += `    <meta property="og:title" content="${escapeHtml(metaTitle)}" />\n`;
    tags += `    <meta name="twitter:title" content="${escapeHtml(metaTitle)}" />\n`;
  }

  // Description tags
  if (metaDescription) {
    tags += `    <meta name="description" content="${escapeHtml(metaDescription)}" />\n`;
    tags += `    <meta property="og:description" content="${escapeHtml(metaDescription)}" />\n`;
    tags += `    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />\n`;
  }

  // Keywords
  if (metaKey) {
    tags += `    <meta name="keywords" content="${escapeHtml(metaKey)}" />\n`;
  }

  // Canonical URL
  if (canonicalUrl) {
    tags += `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n`;
    tags += `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n`;
  }

  // Open Graph type and site name
  tags += `    <meta property="og:type" content="website" />\n`;
  tags += `    <meta property="og:site_name" content="Interior Villa" />\n`;

  // Featured/OG Image (for projects and blog posts)
  if (featuredImage) {
    const imageUrl = featuredImage.startsWith('http')
      ? featuredImage
      : `https://interiorvillabd.com${featuredImage}`;
    tags += `    <meta property="og:image" content="${escapeHtml(imageUrl)}" />\n`;
    tags += `    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />\n`;
    tags += `    <meta property="og:image:width" content="1200" />\n`;
    tags += `    <meta property="og:image:height" content="630" />\n`;
    tags += `    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />\n`;
    tags += `    <meta name="twitter:card" content="summary_large_image" />\n`;
  } else {
    tags += `    <meta name="twitter:card" content="summary_large_image" />\n`;
  }

  // Structured Data
  if (seoStructuredData) {
    try {
      const jsonLd = typeof seoStructuredData === 'string'
        ? seoStructuredData.replace(/<script[^>]*>|<\/script>/g, '').trim()
        : JSON.stringify(seoStructuredData);

      tags += `    <script type="application/ld+json">${jsonLd}</script>\n`;
    } catch (error) {
      console.error('Error processing structured data:', error);
    }
  }

  return tags;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function injectMetaTagsIntoHtml(html, metaTags) {
  return html.replace('</head>', `${metaTags}</head>`);
}
