# Dynamic SEO Implementation Guide

## Overview

Your SSR SEO solution now supports **ALL pages** including dynamic content:

✅ **Static Pages** - Home, About, Contact, Portfolio, etc.
✅ **Service Pages** - All 18 service sub-pages
✅ **Dynamic Blog Posts** - Individual blog articles
✅ **Dynamic Projects** - Individual project details

---

## How It Works

### 1. Static Pages

For pages like `/about`, `/contact`, `/portfolio`:

```
Request: https://interiorvillabd.com/about
         ↓
Server:  Fetches from https://interiorvillabd.com/api/globals/about
         ↓
Returns: seoDetails { metaTitle, metaDescription, metaKey, seoStructuredData }
         ↓
Result:  HTML with meta tags injected ✅
```

### 2. Service Sub-Pages

For service pages like `/services/commercial-interior/corporate-and-office-interior-design`:

```
Request: /services/commercial-interior/corporate-and-office-interior-design
         ↓
Server:  Fetches from /api/globals/corporate-office-interior
         ↓
Returns: seoDetails for that specific service
         ↓
Result:  HTML with service-specific meta tags ✅
```

**All 18 Service Pages Supported:**

**Residential:**
- `/services/residential/apartment-interior-design`
- `/services/residential/home-interior-design`
- `/services/residential/duplex-interior-design`

**Commercial:**
- `/services/commercial-interior/corporate-and-office-interior-design`
- `/services/commercial-interior/buying-house-office-interior-design`
- `/services/commercial-interior/travel-agency-office-interior-design`
- `/services/commercial-interior/hotel-and-hospitality-interior-design`
- `/services/commercial-interior/restaurant-and-cafe-interior-design`
- `/services/commercial-interior/brand-showroom-interior-design`
- `/services/commercial-interior/mens-salon-and-lifestyle-interior-design`
- `/services/commercial-interior/hospital-and-clinic-interior-design`
- `/services/commercial-interior/pharmacy-interior-design`
- `/services/commercial-interior/dental-chamber-interior-design`
- `/services/commercial-interior/spa-and-beauty-parlor-interior-design`
- `/services/commercial-interior/resort-interior-design`
- `/services/commercial-interior/retail-shop-interior-design`
- `/services/commercial-interior/educational-institute-interior-design`
- `/services/commercial-interior/fitness-center-interior-design`

### 3. Dynamic Blog Posts

For blog posts like `/blog/10-modern-interior-design-trends`:

```
Request: /blog/10-modern-interior-design-trends
         ↓
Server:  Extracts slug: "10-modern-interior-design-trends"
         ↓
         Fetches: /api/blog-posts?where[slug][equals]=10-modern-interior-design-trends
         ↓
Returns: seoDetails + featuredImage from the blog post
         ↓
Result:  HTML with post-specific meta tags + OG image ✅
```

**Features:**
- Unique title and description per post
- Featured image for social sharing
- Article-specific structured data
- Automatic slug detection

### 4. Dynamic Project Details

For projects like `/portfolio/project-details/luxury-apartment-dhaka`:

```
Request: /portfolio/project-details/luxury-apartment-dhaka
         ↓
Server:  Extracts slug: "luxury-apartment-dhaka"
         ↓
         Fetches: /api/projects?where[slug][equals]=luxury-apartment-dhaka
         ↓
Returns: seoDetails + featuredImage from the project
         ↓
Result:  HTML with project-specific meta tags + OG image ✅
```

**Features:**
- Unique title and description per project
- Project featured image for social sharing
- Project-specific structured data
- Automatic slug detection

---

## What Gets Injected

### For Static Pages

```html
<title>About Interior Villa - Leading Interior Design Company</title>
<meta name="description" content="Learn about Interior Villa's 10+ years..." />
<meta name="keywords" content="interior design, dhaka, bangladesh" />
<meta property="og:title" content="About Interior Villa..." />
<meta property="og:description" content="Learn about..." />
<meta property="og:url" content="https://interiorvillabd.com/about" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Interior Villa" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://interiorvillabd.com/about" />
<script type="application/ld+json">{...structured data...}</script>
```

### For Dynamic Pages (Blog/Project)

**Everything from static pages PLUS:**

```html
<meta property="og:image" content="https://interiorvillabd.com/uploads/project-image.jpg" />
<meta property="og:image:secure_url" content="https://interiorvillabd.com/uploads/project-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:image" content="https://interiorvillabd.com/uploads/project-image.jpg" />
```

This means when you share a project or blog post on **Facebook, Twitter, LinkedIn**, it will show:
- ✅ Custom title
- ✅ Custom description
- ✅ Beautiful featured image

---

## CMS Requirements

### For Static Pages

Your CMS API endpoint should return:

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

### For Dynamic Pages (Blog Posts & Projects)

Your CMS API endpoint should return:

```json
{
  "docs": [
    {
      "slug": "project-slug",
      "title": "Project Title",
      "featuredImage": {
        "url": "/uploads/image.jpg"
      },
      "seoDetails": {
        "metaTitle": "Custom SEO Title",
        "metaDescription": "Custom SEO description",
        "metaKey": "keywords",
        "seoStructuredData": "{...}"
      }
    }
  ]
}
```

**Important:** The `featuredImage` can be:
- An object with `url` property: `{ url: "/uploads/image.jpg" }`
- A direct string: `"/uploads/image.jpg"`
- A full URL: `"https://cms.interiorvillabd.com/uploads/image.jpg"`

The system handles all formats automatically!

---

## Testing Dynamic Pages

### Test Blog Post SEO

```bash
# 1. Start production server
npm run build
npm run server

# 2. Test a blog post
curl http://localhost:3001/blog/your-blog-slug | grep -i "og:image"

# You should see:
# <meta property="og:image" content="https://interiorvillabd.com/uploads/..." />
```

### Test Project SEO

```bash
# Test a project
curl http://localhost:3001/portfolio/project-details/your-project-slug | grep -i "og:title"

# You should see the project-specific title
```

### Test Service Pages

```bash
# Test a service page
curl http://localhost:3001/services/commercial-interior/corporate-and-office-interior-design | grep -i "meta name=\"description\""

# You should see the service-specific description
```

---

## How to Add More Dynamic Routes

If you have other dynamic content (e.g., team members, testimonials), you can easily add them:

1. Open `src/utils/ssr-seo.js`

2. Add a new condition in `fetchSeoDataForRoute`:

```javascript
// Handle team members
if (path.startsWith('/team/')) {
  const slug = path.replace('/team/', '');
  const response = await fetch(
    `${API_BASE}/team-members?where[slug][equals]=${slug}&depth=1&draft=false`
  );
  const data = await response.json();
  const doc = data?.docs?.[0];

  if (!doc) return null;

  return {
    ...doc.seoDetails,
    featuredImage: doc.photo?.url || doc.photo,
  };
}
```

3. Rebuild and test!

---

## Debugging

### Server Logs

When server is running, watch for:

```
✅ Injected SEO meta tags for: /blog/my-blog-post
✅ Injected SEO meta tags for: /portfolio/project-details/my-project
⚠️  No SEO data found for: /some-route
```

### Common Issues

#### Issue: "No SEO data found" for dynamic pages

**Possible Causes:**
1. CMS API not returning data for that slug
2. Slug doesn't exist in CMS
3. API endpoint is wrong

**Solution:**
```bash
# Test the API directly
curl "https://interiorvillabd.com/api/blog-posts?where[slug][equals]=your-slug&depth=1&draft=false"

# Check if it returns docs array with seoDetails
```

#### Issue: Featured image not showing

**Possible Causes:**
1. CMS not returning `featuredImage` field
2. Image path is incorrect
3. Field name is different in your CMS

**Solution:**
Check your CMS API response structure and adjust this line in `ssr-seo.js`:
```javascript
featuredImage: doc.featuredImage?.url || doc.featuredImage,
// If your field is named differently, change it:
// featuredImage: doc.thumbnail?.url || doc.mainImage?.url,
```

#### Issue: Service page shows "No SEO data found"

**Possible Causes:**
1. CMS global slug name doesn't match the one in `routeToApiMap`
2. Global doesn't exist in CMS

**Solution:**
1. Check your CMS globals list
2. Update the mapping in `routeToApiMap` to match your CMS global names

Example:
```javascript
// If your CMS global is named "corporate-office" not "corporate-office-interior"
'/services/commercial-interior/corporate-and-office-interior-design':
  `${API_BASE}/globals/corporate-office?depth=1&draft=false`,
```

---

## API Endpoint Mapping Reference

Here's the complete mapping of routes to API endpoints:

| Route | API Endpoint | Type |
|-------|--------------|------|
| `/` | `/api/globals/home` | Global |
| `/about` | `/api/globals/about` | Global |
| `/contact` | `/api/globals/contact` | Global |
| `/blog` | `/api/globals/blog` | Global |
| `/portfolio` | `/api/globals/portfolio` | Global |
| `/blog/:slug` | `/api/blog-posts?where[slug][equals]=:slug` | Collection |
| `/portfolio/project-details/:slug` | `/api/projects?where[slug][equals]=:slug` | Collection |
| `/services/residential-interior` | `/api/globals/residential-interior` | Global |
| `/services/residential/apartment-interior-design` | `/api/globals/apartment-interior-design` | Global |
| (etc...) | (see full list in ssr-seo.js) | Global |

---

## Social Media Preview

When your pages are shared on social media:

### Blog Posts
- ✅ Custom title from CMS
- ✅ Custom description from CMS
- ✅ Featured image
- ✅ Professional card appearance

### Projects
- ✅ Project name as title
- ✅ Project description
- ✅ Project featured image
- ✅ Rich preview card

### Service Pages
- ✅ Service-specific title
- ✅ Service description
- ✅ Professional branding

---

## Performance Notes

- Each page request makes ONE API call to fetch SEO data
- API calls happen on the server (fast)
- Consider adding caching for high-traffic pages
- Images are referenced, not downloaded by the server

---

## Next Steps

1. ✅ Make sure all CMS pages have `seoDetails` filled in
2. ✅ Verify all blog posts have `featuredImage` set
3. ✅ Verify all projects have `featuredImage` set
4. ✅ Test each type of page (static, service, blog, project)
5. ✅ Deploy to production
6. ✅ Test with Google Search Console
7. ✅ Share a project on Facebook to see rich preview
8. ✅ Monitor server logs for any "No SEO data found" warnings
9. ✅ Request re-indexing in Google Search Console

Your dynamic SEO is fully implemented and ready for Google! 🚀
