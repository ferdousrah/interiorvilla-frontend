import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import sendEmailHandler from './api/send-email.js';
import { fetchSeoDataForRoute, generateMetaTags, injectMetaTagsIntoHtml } from './src/utils/ssr-seo.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Add error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());

// API route
app.post('/api/send-email', sendEmailHandler);

// Team members API endpoint
app.get('/api/team-members', (req, res) => {
  // Proxy request to Payload CMS
  fetch('https://interiorvillabd.com/api/team-members?depth=1')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    });
});

// Projects API endpoint
app.get('/api/projects', (req, res) => {
  // Build query string from request parameters
  const queryParams = new URLSearchParams();
  
  // Forward all query parameters
  Object.keys(req.query).forEach(key => {
    if (req.query[key]) {
      queryParams.append(key, req.query[key]);
    }
  });
  
  const url = `https://interiorvillabd.com/api/projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log('Proxying request to:', url);
  
  // Proxy request to Payload CMS
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching projects:', error);
      // Return empty docs array instead of error to prevent crashes
      res.json({ docs: [], totalDocs: 0, totalPages: 0, page: 1, limit: 10 });
    });
});

// Testimonials API endpoint
app.get('/api/testimonials', (req, res) => {
  // Build query string from request parameters
  const queryParams = new URLSearchParams();
  
  // Forward all query parameters
  Object.keys(req.query).forEach(key => {
    if (req.query[key]) {
      queryParams.append(key, req.query[key]);
    }
  });
  
  const url = `https://interiorvillabd.com/api/testimonials${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log('Proxying testimonials request to:', url);
  
  // Proxy request to Payload CMS
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching testimonials:', error);
      // Return empty docs array instead of error to prevent crashes
      res.json({ docs: [], totalDocs: 0, totalPages: 0, page: 1, limit: 10 });
    });
});

// Offices API endpoint
app.get('/api/offices', (req, res) => {
  // Build query string from request parameters
  const queryParams = new URLSearchParams();
  
  // Forward all query parameters
  Object.keys(req.query).forEach(key => {
    if (req.query[key]) {
      queryParams.append(key, req.query[key]);
    }
  });
  
  const url = `https://interiorvillabd.com/api/offices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log('Proxying offices request to:', url);
  
  // Proxy request to Payload CMS
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching offices:', error);
      // Return empty docs array instead of error to prevent crashes
      res.json({ docs: [], totalDocs: 0, totalPages: 0, page: 1, limit: 10 });
    });
});

// Serve static files from dist directory (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// SSR middleware for SEO meta tags injection
app.use(async (req, res, next) => {
  try {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Skip static assets - let express.static handle them
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|json|xml|txt|map)$/i)) {
      return next();
    }

    // Check if dist/index.html exists
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    let html;

    try {
      html = readFileSync(indexPath, 'utf-8');
    } catch (readError) {
      console.error('Error reading index.html:', readError);
      return res.status(500).send('Build not found. Please run: npm run build');
    }

    // Fetch SEO data for the current route
    const seoData = await fetchSeoDataForRoute(req.path);

    if (seoData) {
      // Build canonical URL
      const canonicalUrl = `https://interiorvillabd.com${req.path}`;

      // Generate meta tags from SEO data
      const metaTags = generateMetaTags(seoData, canonicalUrl);

      // Inject meta tags into HTML
      html = injectMetaTagsIntoHtml(html, metaTags);

      console.log(`✅ Injected SEO meta tags for: ${req.path}`);
    } else {
      console.log(`⚠️  No SEO data found for: ${req.path}`);
    }

    // Send the modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error in SSR middleware:', error);
    // Fallback to sending the original file
    try {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } catch (sendError) {
      res.status(500).send('Error loading page. Please run: npm run build');
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌐 API endpoint available at: http://localhost:${PORT}/api/send-email`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});