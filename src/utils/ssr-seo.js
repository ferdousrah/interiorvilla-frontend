const API_BASE = 'https://interiorvillabd.com/api';

const routeToApiMap = {
  '/': `${API_BASE}/globals/home?depth=1&draft=false`,
  '/about': `${API_BASE}/globals/about?depth=1&draft=false`,
  '/contact': `${API_BASE}/globals/contact?depth=1&draft=false`,
  '/blog': `${API_BASE}/globals/blog?depth=1&draft=false`,
  '/portfolio': `${API_BASE}/globals/portfolio?depth=1&draft=false`,
  '/services/residential-interior': `${API_BASE}/globals/residential-interior?depth=1&draft=false`,
  '/services/commercial-interior': `${API_BASE}/globals/commercial-interior?depth=1&draft=false`,
  '/services/architectural-consultancy': `${API_BASE}/globals/architectural-consultancy?depth=1&draft=false`,
  '/book-appointment': `${API_BASE}/globals/book-appointment?depth=1&draft=false`,
  '/faq': `${API_BASE}/globals/faq?depth=1&draft=false`,
};

export async function fetchSeoDataForRoute(path) {
  try {
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      const response = await fetch(
        `${API_BASE}/blog-posts?where[slug][equals]=${slug}&depth=1&draft=false`
      );
      const data = await response.json();
      return data?.docs?.[0]?.seoDetails || null;
    }

    if (path.startsWith('/portfolio/project-details/')) {
      const slug = path.replace('/portfolio/project-details/', '');
      const response = await fetch(
        `${API_BASE}/projects?where[slug][equals]=${slug}&depth=1&draft=false`
      );
      const data = await response.json();
      return data?.docs?.[0]?.seoDetails || null;
    }

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

  const { metaTitle, metaDescription, metaKey, seoStructuredData } = seoDetails;

  let tags = '';

  if (metaTitle) {
    tags += `<title>${escapeHtml(metaTitle)}</title>\n`;
    tags += `    <meta property="og:title" content="${escapeHtml(metaTitle)}" />\n`;
    tags += `    <meta name="twitter:title" content="${escapeHtml(metaTitle)}" />\n`;
  }

  if (metaDescription) {
    tags += `    <meta name="description" content="${escapeHtml(metaDescription)}" />\n`;
    tags += `    <meta property="og:description" content="${escapeHtml(metaDescription)}" />\n`;
    tags += `    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />\n`;
  }

  if (metaKey) {
    tags += `    <meta name="keywords" content="${escapeHtml(metaKey)}" />\n`;
  }

  if (canonicalUrl) {
    tags += `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n`;
    tags += `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n`;
  }

  tags += `    <meta property="og:type" content="website" />\n`;
  tags += `    <meta property="og:site_name" content="Interior Villa" />\n`;
  tags += `    <meta name="twitter:card" content="summary_large_image" />\n`;

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
