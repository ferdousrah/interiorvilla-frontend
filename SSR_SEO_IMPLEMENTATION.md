# Server-Side SEO Implementation Guide

## Problem Solved

Your website uses **client-side rendering** (Vite + React Router) with dynamic SEO data fetched from your CMS API using `useEffect`. This causes:

1. **Google sees empty HTML** - SEO meta tags are added after JavaScript runs
2. **Google Search Console doesn't detect dynamic SEO** - Tags aren't in the initial HTML response
3. **Poor SEO performance** - Search engines index incomplete pages

## Solution Implemented

I've implemented **Server-Side Meta Tag Injection** that fetches SEO data from your CMS API on the server and injects meta tags into the HTML **before** sending it to browsers and search engine crawlers.

---

## What Was Changed

### 1. Created SSR SEO Utility (`src/utils/ssr-seo.js`)

This utility provides three main functions:

#### `fetchSeoDataForRoute(path)`
- Fetches SEO data from your CMS API based on the route
- Handles static pages (home, about, contact, etc.)
- Handles dynamic pages (blog posts, project details)
- Returns `seoDetails` object or `null`

#### `generateMetaTags(seoDetails, canonicalUrl)`
- Generates HTML meta tags from SEO data
- Creates:
  - Title tag
  - Meta description
  - Meta keywords
  - Open Graph tags (og:title, og:description, og:url, og:type)
  - Twitter Card tags
  - Canonical link
  - JSON-LD structured data
- Properly escapes HTML to prevent XSS attacks

#### `injectMetaTagsIntoHtml(html, metaTags)`
- Injects generated meta tags into the HTML before `</head>`

### 2. Updated Server (`server.js`)

Modified the Express server to:
- Import SSR SEO utilities
- Read the built `index.html` file
- Fetch SEO data for the requested route
- Generate and inject meta tags
- Send the modified HTML to the client

**Key Features:**
- Skips injection for static assets (.js, .css, images)
- Logs successful injections and missing SEO data
- Falls back to original HTML if errors occur
- Works seamlessly with your existing setup

---

## How It Works

### Request Flow

```
1. User/Googlebot requests https://interiorvillabd.com/portfolio
                    ↓
2. Express server intercepts request
                    ↓
3. Server fetches SEO data from CMS API:
   https://interiorvillabd.com/api/globals/portfolio?depth=1&draft=false
                    ↓
4. Server generates meta tags from SEO data
                    ↓
5. Server injects tags into HTML <head>
                    ↓
6. Server sends complete HTML with SEO tags
                    ↓
7. Google sees all meta tags in initial HTML ✅
```

---

## Supported Routes

### Static Pages
- `/` - Home
- `/about` - About
- `/contact` - Contact
- `/blog` - Blog listing
- `/portfolio` - Portfolio
- `/services/residential-interior` - Residential Interior
- `/services/commercial-interior` - Commercial Interior
- `/services/architectural-consultancy` - Architectural Consultancy
- `/book-appointment` - Book Appointment
- `/faq` - FAQ

### Dynamic Pages
- `/blog/:slug` - Individual blog posts
- `/portfolio/project-details/:slug` - Individual projects

### Service Sub-Pages
All commercial and residential service pages are also mapped in the `routeToApiMap` object. If you need to add more routes, simply update this object in `src/utils/ssr-seo.js`.

---

## Testing Your SEO

### 1. Test Locally

Start your server:
```bash
npm run build
npm run server
```

Visit `http://localhost:3001` and check the HTML source:
```bash
curl http://localhost:3001 | grep -i "meta"
```

You should see meta tags in the initial HTML!

### 2. Test with Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Use **URL Inspection** tool
3. Enter your URL (e.g., `https://interiorvillabd.com/portfolio`)
4. Click "Test Live URL"
5. View "Tested Page" → You should see all meta tags ✅

### 3. Test with Rich Results Test

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your URL
3. Check if structured data is detected

### 4. View Page Source

In your browser:
1. Right-click → "View Page Source" (or Ctrl+U)
2. Search for your page title and description
3. They should be in the `<head>` section ✅

---

## Adding New Routes

To add SEO support for new routes:

1. Open `src/utils/ssr-seo.js`
2. Add your route to `routeToApiMap`:

```javascript
const routeToApiMap = {
  '/': `${API_BASE}/globals/home?depth=1&draft=false`,
  '/your-new-page': `${API_BASE}/globals/your-new-page?depth=1&draft=false`,
  // ... other routes
};
```

3. Make sure your CMS API returns `seoDetails` object with:
   - `metaTitle` - Page title
   - `metaDescription` - Page description
   - `metaKey` - Keywords (optional)
   - `seoStructuredData` - JSON-LD structured data (optional)

---

## API Endpoints Expected

Your CMS API should return data in this format:

```json
{
  "seoDetails": {
    "metaTitle": "Page Title",
    "metaDescription": "Page description for SEO",
    "metaKey": "keyword1, keyword2, keyword3",
    "seoStructuredData": "{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\"}"
  }
}
```

For collection items (blogs, projects):
```json
{
  "docs": [
    {
      "seoDetails": {
        "metaTitle": "Project Title",
        "metaDescription": "Project description",
        ...
      }
    }
  ]
}
```

---

## Debugging

### Check Server Logs

When the server runs, you'll see:
- `✅ Injected SEO meta tags for: /portfolio` - Success
- `⚠️  No SEO data found for: /some-page` - No SEO data available

### Common Issues

#### 1. Meta tags not showing
- Make sure you run `npm run build` before `npm run server`
- Check that `dist/index.html` exists
- Verify CMS API is returning `seoDetails`

#### 2. 404 errors for API
- Check your CMS API endpoints are correct
- Verify API is publicly accessible
- Test API URLs directly in your browser

#### 3. Server not starting
- Check port 3001 is not in use
- Verify all dependencies are installed: `npm install`

---

## Deployment

When deploying to production:

1. Build your app: `npm run build`
2. Start the server: `npm run server` or `node server.js`
3. Make sure your server is publicly accessible
4. Point your domain to the server
5. Test with Google Search Console URL Inspection

---

## Benefits

✅ **SEO tags in initial HTML** - Google sees everything immediately
✅ **Works with existing code** - No need to rewrite your components
✅ **Dynamic data from CMS** - Fetch SEO data from your API
✅ **Backward compatible** - Client-side rendering still works
✅ **Easy to maintain** - Add new routes easily
✅ **Proper escaping** - Prevents XSS attacks
✅ **Graceful fallbacks** - Falls back to original HTML if errors occur

---

## Performance

- SEO data is fetched on the server (one API call per page request)
- HTML generation is fast (string manipulation)
- No impact on client-side performance
- Consider adding caching for frequently accessed pages

### Optional: Add Caching

To improve performance, you can cache SEO data:

```javascript
const seoCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

export async function fetchSeoDataForRoute(path) {
  const cached = seoCache.get(path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await actualFetchFunction(path);
  seoCache.set(path, { data, timestamp: Date.now() });
  return data;
}
```

---

## Next Steps

1. ✅ Build and deploy your updated code
2. ✅ Test with Google Search Console URL Inspection
3. ✅ Monitor Google Search Console for indexing improvements
4. ✅ Request re-indexing for important pages
5. ✅ Wait 1-2 weeks for Google to re-crawl your site

---

## Support

If you encounter issues:

1. Check server logs for errors
2. Test API endpoints directly
3. Verify HTML source contains meta tags
4. Use Google's testing tools for validation

Your SEO should now be properly detected by Google Search Console! 🎉
