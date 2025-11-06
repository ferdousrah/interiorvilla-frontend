// generate-sitemap.js - Improved Version
import fs from "fs";
import fetch from "node-fetch";
import path from "path";

const BASE_URL = "https://interiorvillabd.com";
const CMS_URL = "https://cms.interiorvillabd.com/api";
const DIST_PATH = "/var/www/interior-villa/dist";
const SITEMAP_FILE = path.join(DIST_PATH, "sitemap.xml");

const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.9, changefreq: 'monthly' },
  { path: '/portfolio', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.7, changefreq: 'daily' },
  { path: '/contact', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/residential-interior', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/residential/apartment-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/residential/home-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/residential/duplex-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/corporate-and-office-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/buying-house-office-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/travel-agency-office-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/hotel-and-hospitality-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/restaurant-and-cafe-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/brand-showroom-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/mens-salon-and-lifestyle-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/hospital-and-clinic-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/pharmacy-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/dental-chamber-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/spa-and-beauty-parlor-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/resort-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/retail-shop-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/educational-institute-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/commercial-interior/fitness-center-interior-design', priority: 0.9, changefreq: 'monthly' },
  { path: '/services/architectural-consultancy', priority: 0.9, changefreq: 'monthly' },
];

// Fetch data with retry logic
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`⚠️ Attempt ${i + 1}/${retries} failed for ${url}:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Generate URL entry with proper escaping
function createUrlEntry({ loc, priority, lastmod, changefreq }) {
  const escapedLoc = loc
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return `
    <url>
      <loc>${escapedLoc}</loc>
      <priority>${priority}</priority>
      <lastmod>${lastmod}</lastmod>${changefreq ? `
      <changefreq>${changefreq}</changefreq>` : ''}
    </url>`;
}

async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');
  
  try {
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_PATH)) {
      fs.mkdirSync(DIST_PATH, { recursive: true });
    }

    // Fetch dynamic content
    console.log('📡 Fetching projects and blog posts...');
    const [projects, blogs] = await Promise.all([
      fetchWithRetry(`${CMS_URL}/projects?limit=100&depth=0`),
      fetchWithRetry(`${CMS_URL}/blog-posts?limit=100&depth=0`),
    ]);

    console.log(`✅ Fetched ${projects?.docs?.length || 0} projects`);
    console.log(`✅ Fetched ${blogs?.docs?.length || 0} blog posts`);

    // Generate URL entries
    const urls = [];

    // Static routes
    staticRoutes.forEach(route => {
      urls.push(createUrlEntry({
        loc: `${BASE_URL}${route.path}`,
        priority: route.priority,
        lastmod: new Date().toISOString(),
        changefreq: route.changefreq,
      }));
    });

    // Dynamic project pages
    if (projects?.docs?.length) {
      projects.docs.forEach(project => {
        if (!project.slug) {
          console.warn('⚠️ Project missing slug:', project.id);
          return;
        }
        
        const lastmod = project.updatedAt || project.createdAt || new Date().toISOString();
        urls.push(createUrlEntry({
          loc: `${BASE_URL}/portfolio/project-details/${project.slug}`,
          priority: 0.8,
          lastmod: new Date(lastmod).toISOString(),
          changefreq: 'monthly',
        }));
      });
    }

    // Dynamic blog pages
    if (blogs?.docs?.length) {
      blogs.docs.forEach(blog => {
        if (!blog.slug) {
          console.warn('⚠️ Blog post missing slug:', blog.id);
          return;
        }
        
        const lastmod = blog.updatedAt || blog.createdAt || new Date().toISOString();
        urls.push(createUrlEntry({
          loc: `${BASE_URL}/blog/${blog.slug}`,
          priority: 0.7,
          lastmod: new Date(lastmod).toISOString(),
          changefreq: 'weekly',
        }));
      });
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urls.join('')}
</urlset>`;

    // Write to file
    fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
    
    // Verify file was written
    const fileSize = fs.statSync(SITEMAP_FILE).size;
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`   📍 Location: ${SITEMAP_FILE}`);
    console.log(`   📊 Total URLs: ${urls.length}`);
    console.log(`   💾 File size: ${(fileSize / 1024).toFixed(2)} KB`);

    // Validate XML
    if (!xml.includes('<?xml') || !xml.includes('</urlset>')) {
      throw new Error('Generated XML appears to be malformed');
    }

    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Notify search engines
async function notifySearchEngines() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  console.log('📢 Notifying search engines...');
  
  const engines = [
    { name: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
  ];

  for (const engine of engines) {
    try {
      const response = await fetch(engine.url, { timeout: 5000 });
      if (response.ok) {
        console.log(`✅ ${engine.name} notified successfully`);
      } else {
        console.warn(`⚠️ ${engine.name} returned status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to notify ${engine.name}:`, error.message);
    }
  }
}

// Main execution
(async () => {
  const success = await generateSitemap();
  if (success) {
    await notifySearchEngines();
    console.log('🎉 Sitemap generation complete!');
  }
})();