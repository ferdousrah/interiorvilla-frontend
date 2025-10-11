# SEO Migration Guide: Client-Side to Server-Side Rendering

## Problem

Your current implementation uses **client-side rendering** with `useEffect` to fetch SEO data from CMS. This causes:

1. **Google crawls empty HTML** - SEO meta tags are not present in initial HTML
2. **Google Search Console doesn't detect dynamic SEO** - Tags are added after JavaScript runs
3. **Poor SEO performance** - Search engines index pages before dynamic content loads

## Solution: Server-Side Rendering with Next.js

Use Next.js `generateMetadata` function to fetch and render SEO data on the server before sending HTML to the browser.

---

## Step-by-Step Migration

### Step 1: Create Server Component with generateMetadata

**OLD WAY (Client-Side):**
```tsx
'use client'

import { useEffect, useState } from 'react';
import SEO from '@/utils/SEO';

export default function Page() {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetch('https://interiorvillabd.com/api/globals/home')
      .then(res => res.json())
      .then(data => setSeo(data.seoDetails));
  }, []);

  return (
    <>
      {seo && <SEO title={seo.metaTitle} description={seo.metaDescription} />}
      <div>Content...</div>
    </>
  );
}
```

**NEW WAY (Server-Side):**
```tsx
import { Metadata } from 'next';
import { fetchCMSSeoData, generateMetadataFromCMS, generateStructuredData } from '@/utils/next-seo';
import { StructuredData } from '@/components/ui/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const seoDetails = await fetchCMSSeoData(
    'https://interiorvillabd.com/api/globals/home?depth=1&draft=false'
  );

  return generateMetadataFromCMS(
    seoDetails,
    'Interior Villa - Premium Interior Design Services in Bangladesh',
    'Transform your space with expert interior design services',
    'https://interiorvillabd.com'
  );
}

export default async function Page() {
  const response = await fetch('https://interiorvillabd.com/api/globals/home?depth=1&draft=false', {
    next: { revalidate: 3600 }
  });
  const data = await response.json();

  const structuredData = generateStructuredData(data.seoDetails?.seoStructuredData);

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      <div>Content...</div>
    </>
  );
}
```

---

## Step 2: Dynamic Routes (e.g., Project Details)

**For pages with dynamic parameters:**

```tsx
import { Metadata } from 'next';
import { fetchCMSSeoData, generateMetadataFromCMS } from '@/utils/next-seo';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await fetch(
    `https://interiorvillabd.com/api/projects?where[slug][equals]=${params.slug}&depth=1&draft=false`,
    { next: { revalidate: 3600 } }
  );
  const data = await response.json();
  const seoDetails = data?.docs?.[0]?.seoDetails;

  return generateMetadataFromCMS(
    seoDetails,
    'Project Details - Interior Villa',
    'View our interior design project',
    `https://interiorvillabd.com/portfolio/project-details/${params.slug}`
  );
}

export default async function ProjectDetailsPage({ params }: Props) {
  const response = await fetch(
    `https://interiorvillabd.com/api/projects?where[slug][equals]=${params.slug}&depth=1&draft=false`,
    { next: { revalidate: 3600 } }
  );
  const project = await response.json();

  return (
    <main>
      {/* Your content */}
    </main>
  );
}
```

---

## Step 3: Add Structured Data (JSON-LD)

```tsx
import { StructuredData } from '@/components/ui/StructuredData';
import { buildOrganizationSchema, buildServiceSchema } from '@/utils/next-seo';

export default async function Page() {
  const schemas = [
    buildOrganizationSchema(),
    buildServiceSchema({
      name: 'Interior Design Services',
      description: 'Professional interior design for residential and commercial spaces',
      url: 'https://interiorvillabd.com'
    })
  ];

  return (
    <>
      <StructuredData data={schemas} />
      <main>Content...</main>
    </>
  );
}
```

---

## Step 4: Verify SEO Implementation

### 1. Check Initial HTML
```bash
curl https://your-domain.com | grep -i "meta"
```

You should see meta tags in the HTML response!

### 2. Test with Google Search Console
- Go to Google Search Console
- Use "URL Inspection" tool
- You should now see all meta tags and structured data

### 3. Test with Rich Results Test
Visit: https://search.google.com/test/rich-results
- Enter your URL
- Verify structured data is detected

---

## Key Differences

| Aspect | Client-Side (OLD) | Server-Side (NEW) |
|--------|------------------|-------------------|
| **SEO Tags** | Added after page load | Present in initial HTML |
| **Google Crawling** | Empty/incomplete HTML | Full HTML with SEO |
| **Performance** | Extra API call on client | Pre-rendered on server |
| **User Experience** | Flash of unstyled content | Instant content |
| **react-helmet-async** | Required | NOT needed |
| **generateMetadata** | Not available | Required |

---

## Migration Checklist

- [ ] Remove `'use client'` directive from page components
- [ ] Remove `react-helmet-async` imports
- [ ] Remove `useState` and `useEffect` for SEO data
- [ ] Add `generateMetadata` export function
- [ ] Move data fetching to server component
- [ ] Use `StructuredData` component for JSON-LD
- [ ] Test with URL Inspection in Google Search Console
- [ ] Verify meta tags in view-source of your page

---

## Common Pitfalls

### 1. Using 'use client' directive
❌ **Wrong:** `'use client'` at the top of page
✅ **Right:** Remove it for Server Components

### 2. Fetching data in useEffect
❌ **Wrong:** `useEffect(() => fetch(...))`
✅ **Right:** `await fetch(...)` in async component

### 3. Not using cache revalidation
❌ **Wrong:** `fetch(url)`
✅ **Right:** `fetch(url, { next: { revalidate: 3600 } })`

---

## Files Changed

1. **New:** `/src/utils/next-seo.ts` - Server-side SEO utilities
2. **New:** `/components/ui/StructuredData.tsx` - JSON-LD component
3. **Update:** All page components to use `generateMetadata`
4. **Remove:** `react-helmet-async` dependencies (optional cleanup)

---

## Need Help?

1. Check that your app is using Next.js App Router (not Pages Router)
2. Verify `next.config.js` is properly configured
3. Test locally with `npm run build && npm run start`
4. Use Google's Rich Results Test tool for validation
