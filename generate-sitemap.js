// generate-sitemap.js
import fs from "fs";
import fetch from "node-fetch";

const BASE_URL = "https://interiorvillabd.com"; // frontend domain
const CMS_URL = "https://cms.interiorvillabd.com/api"; // Payload CMS API

async function generateSitemap() {
  const distPath = "/var/www/interior-villa/dist/sitemap.xml"; // ✅ full path to deployed dist

  const staticRoutes = [
    { path: '/', priority: 1.0 },
          { path: '/about', priority: 0.9 },
          { path: '/portfolio', priority: 0.9 },
          { path: '/blog', priority: 0.7 },
          { path: '/contact', priority: 0.9 },
          { path: '/services/residential-interior', priority: 0.9 },
          { path: '/services/residential/apartment-interior-design', priority: 0.9 },
          { path: '/services/residential/home-interior-design', priority: 0.9 },
          { path: '/services/residential/duplex-interior-design', priority: 0.9 },
          { path: '/services/commercial-interior', priority: 0.9 },
          {
            path: '/services/commercial-interior/corporate-and-office-interior-design',
            priority: 0.9,
          },
          {
            path: '/services/commercial-interior/buying-house-office-interior-design',
            priority: 0.9,
          },
          {
            path: '/services/commercial-interior/travel-agency-office-interior-design',
            priority: 0.9,
          },
          {
            path: '/services/commercial-interior/hotel-and-hospitality-interior-design',
            priority: 0.9,
          },
          {
            path: '/services/commercial-interior/restaurant-and-cafe-interior-design',
            priority: 0.9,
          },
          { path: '/services/commercial-interior/brand-showroom-interior-design', priority: 0.9 },
          {
            path: '/services/commercial-interior/mens-salon-and-lifestyle-interior-design',
            priority: 0.9,
          },
          {
            path: '/services/commercial-interior/hospital-and-clinic-interior-design',
            priority: 0.9,
          },
          { path: '/services/commercial-interior/pharmacy-interior-design', priority: 0.9 },
          { path: '/services/commercial-interior/dental-chamber-interior-design', priority: 0.9 },
          {
            path: '/services/commercial-interior/spa-and-beauty-parlor-interior-design',
            priority: 0.9,
          },
          { path: '/services/commercial-interior/resort-interior-design', priority: 0.9 },
          { path: '/services/commercial-interior/retail-shop-interior-design', priority: 0.9 },
          {
            path: '/services/commercial-interior/educational-institute-interior-design',
            priority: 0.9,
          },
          { path: '/services/commercial-interior/fitness-center-interior-design', priority: 0.9 },

          { path: '/services/architectural-consultancy', priority: 0.9 },
  ];

  try {
    const [projectsRes, blogsRes] = await Promise.all([
      fetch(`${CMS_URL}/projects?limit=100`),
      fetch(`${CMS_URL}/blog-posts?limit=100`),
    ]);

    const projects = await projectsRes.json();
    const blogs = await blogsRes.json();

    let urls = staticRoutes.map(
      (r) => `
    <url>
      <loc>${BASE_URL}${r.path}</loc>
      <priority>${r.priority}</priority>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`
    );

    if (projects?.docs) {
      urls = urls.concat(
        projects.docs.map((p) => {
          const lastmod = p.updatedAt || p.createdAt || new Date().toISOString();
          return `
    <url>
      <loc>${BASE_URL}/portfolio/project-details/${p.slug}</loc>
      <priority>0.8</priority>
      <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    </url>`;
        })
      );
    }

    if (blogs?.docs) {
      urls = urls.concat(
        blogs.docs.map((b) => {
          const lastmod = b.updatedAt || b.createdAt || new Date().toISOString();
          return `
    <url>
      <loc>${BASE_URL}/blog/${b.slug}</loc>
      <priority>0.7</priority>
      <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    </url>`;
        })
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    fs.writeFileSync(distPath, xml);
    console.log("✅ Sitemap updated:", distPath);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
    process.exit(1);
  }
}

generateSitemap();



// Notify Google & Bing after update
const notifySearchEngines = async () => {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log("✅ Notified Google & Bing about sitemap update.");
  } catch (err) {
    console.error("⚠️ Failed to notify search engines:", err);
  }
};

notifySearchEngines();

