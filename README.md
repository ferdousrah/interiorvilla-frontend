# Interior Villa - SSR SEO Implementation

Complete server-side rendering solution for dynamic SEO meta tags visible to Google Search Console.

## Quick Start

### Development Mode (Port 3000)
```bash
npm run dev
```
- Hot module reloading
- Fast refresh
- Client-side SEO only

### Production Mode (Port 3001) - For SEO
```bash
npm run build
npm run server
```
- Server-side SEO ✅
- Google Search Console compatible
- Production optimized

## Important: Build First!

**Before running the server, you MUST build:**

```bash
# ALWAYS run this first
npm run build

# Then start server
npm run server
```

If you skip the build, you'll see an error about missing `dist` folder.

## What's Implemented

### SEO Features
✅ Server-side meta tag injection
✅ Dynamic blog posts with featured images
✅ Dynamic projects with featured images
✅ All 18 service pages supported
✅ Open Graph tags for social sharing
✅ Structured data (JSON-LD)
✅ Canonical URLs
✅ Automatic slug detection

### Supported Pages
- **Static:** Home, About, Contact, Portfolio, Blog, FAQ, Book Appointment
- **Services:** 3 residential + 15 commercial interior pages
- **Dynamic:** Blog posts (`/blog/:slug`) and Projects (`/portfolio/project-details/:slug`)

## Testing Your SEO

### 1. Start the Server
```bash
npm run build
npm run server
```

### 2. View in Browser
Open: `http://localhost:3001`

Right-click → View Page Source

Look for meta tags in `<head>` section

### 3. Test with Command Line
```bash
curl http://localhost:3001 | grep "meta name=\"description\""
```

You should see SEO meta tags with content from your CMS ✅

### 4. Test Dynamic Pages
```bash
# Test a blog post (replace with your slug)
curl http://localhost:3001/blog/your-slug | grep "og:image"

# Test a project (replace with your slug)
curl http://localhost:3001/portfolio/project-details/your-slug | grep "og:title"
```

## Documentation

- **`QUICK_START.md`** - Avoid common errors
- **`IMPORTANT_SEO_SETUP.md`** - Dev vs Production explained
- **`DYNAMIC_SEO_GUIDE.md`** - Complete guide for dynamic pages
- **`TEST_SEO.md`** - Step-by-step testing guide
- **`SSR_SEO_IMPLEMENTATION.md`** - Technical documentation

## Common Issues

### Error: "Missing parameter name" or path-to-regexp error

**Cause:** Trying to run server without building first, or Express 5 compatibility issue (fixed)

**Solution:**
```bash
npm run build
npm run server
```

### Error: "Build not found"

**Cause:** No `dist` folder exists

**Solution:**
```bash
npm run build
```

### Port 3001 already in use

**Solution:**
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Then restart:
npm run server
```

## How It Works

1. Request comes to server (e.g., `/portfolio`)
2. Server reads built `dist/index.html`
3. Server fetches SEO data from CMS API
4. Server injects meta tags into HTML `<head>`
5. Server sends complete HTML to browser/Google
6. Google sees all meta tags on first request ✅

## CMS Requirements

Your CMS API must return `seoDetails` for each page:

```json
{
  "seoDetails": {
    "metaTitle": "Page Title",
    "metaDescription": "Page description",
    "metaKey": "keyword1, keyword2",
    "seoStructuredData": "{...}"
  }
}
```

For dynamic pages (blog/projects), also include `featuredImage`:

```json
{
  "docs": [{
    "slug": "page-slug",
    "featuredImage": { "url": "/uploads/image.jpg" },
    "seoDetails": { ... }
  }]
}
```

## API Endpoint Mapping

Routes are mapped in `src/utils/ssr-seo.js`:

- Static pages → `/api/globals/:page-name`
- Blog posts → `/api/blog-posts?where[slug][equals]=:slug`
- Projects → `/api/projects?where[slug][equals]=:slug`

## Server Logs

Watch for these when server is running:

```bash
✅ Injected SEO meta tags for: /portfolio
✅ Injected SEO meta tags for: /blog/my-post
⚠️  No SEO data found for: /some-route
```

## Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
npm run build
pm2 start server.js --name interior-villa
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "server"]
```

## Google Search Console

Once deployed:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **URL Inspection**
3. Enter your page URL
4. Click **Test Live URL**
5. Verify all meta tags are visible ✅
6. Request re-indexing

## Development Workflow

### While Coding (Use Dev Server)
```bash
npm run dev
# Edit files, see changes instantly
```

### Before Committing (Test Production)
```bash
npm run build
npm run server
# Test SEO is working
```

### Before Deploying
```bash
npm run build
# Check build completes without errors
# Commit and push
```

## Tech Stack

- **Framework:** React 18 + React Router 7
- **Build Tool:** Vite 5
- **Server:** Express 5
- **SSR:** Custom middleware with CMS integration
- **CMS:** Payload CMS (headless)

## Support

If SEO isn't working:

1. ✅ Did you run `npm run build`?
2. ✅ Is server running on port 3001?
3. ✅ Can you see meta tags with curl?
4. ✅ Are server logs showing "Injected SEO"?
5. ✅ Does your CMS return `seoDetails`?

Check the documentation files for detailed troubleshooting.

---

**SSR SEO Implementation Complete** ✅

Your site is ready for Google Search Console!
