# Quick SEO Testing Guide

## Step-by-Step Testing

### 1. Start Production Server

Open a terminal and run:
```bash
npm run server
```

You should see:
```
✅ Server successfully started on port 3001
```

**Keep this terminal open!**

### 2. Test in Browser

Open your browser and go to:
```
http://localhost:3001
```

**Right-click anywhere** → **View Page Source** (or press Ctrl+U / Cmd+U)

### 3. Look for SEO Tags

In the page source, search (Ctrl+F) for these:

#### ✅ Check for Title:
```html
<title>Your CMS Title Here</title>
```

#### ✅ Check for Description:
```html
<meta name="description" content="Your CMS description here" />
```

#### ✅ Check for Keywords:
```html
<meta name="keywords" content="your, keywords, here" />
```

#### ✅ Check for Open Graph:
```html
<meta property="og:title" content="Your CMS Title Here" />
<meta property="og:description" content="Your CMS description here" />
```

If you see these tags **with content from your CMS** (not default/empty), **SEO is working!** ✅

### 4. Test Command Line (Optional)

Open a **NEW terminal** (keep server running in the first one) and run:

```bash
curl http://localhost:3001 | grep -i "meta name=\"description\""
```

You should see:
```html
<meta name="description" content="Your actual description from CMS" />
```

### 5. Test Different Pages

Try these URLs in your browser and check page source:

**Static Pages:**
- Home: `http://localhost:3001/`
- Portfolio: `http://localhost:3001/portfolio`
- About: `http://localhost:3001/about`
- Contact: `http://localhost:3001/contact`

**Service Pages:**
- Residential: `http://localhost:3001/services/residential-interior`
- Commercial: `http://localhost:3001/services/commercial-interior`
- Corporate Office: `http://localhost:3001/services/commercial-interior/corporate-and-office-interior-design`

**Dynamic Pages (use your actual slugs from CMS):**
- Blog Post: `http://localhost:3001/blog/your-blog-slug-here`
- Project: `http://localhost:3001/portfolio/project-details/your-project-slug-here`

Each should have **different** meta tags based on that page's CMS content.

**For dynamic pages (blogs and projects), also look for the featured image:**
```html
<meta property="og:image" content="https://interiorvillabd.com/uploads/..." />
```

### 6. Check Server Logs

Look at the terminal where your server is running. You should see:

```
✅ Injected SEO meta tags for: /
✅ Injected SEO meta tags for: /portfolio
✅ Injected SEO meta tags for: /about
```

If you see warnings like:
```
⚠️  No SEO data found for: /some-page
```

That page doesn't have SEO data in your CMS yet.

---

## Testing with Google Search Console

### Option A: Test Production Site

If your site is already live:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **URL Inspection**
3. Enter your URL: `https://interiorvillabd.com/portfolio`
4. Click **Test Live URL**
5. View results - you should see all meta tags! ✅

### Option B: Test Local Site (Using ngrok)

To test your local server with Google Search Console:

1. **Keep your server running** on port 3001

2. Open a **NEW terminal** and run:
   ```bash
   npx ngrok http 3001
   ```

3. You'll see output like:
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:3001
   ```

4. **Copy the https URL** (e.g., `https://abc123.ngrok.io`)

5. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)

6. Paste your ngrok URL and test

7. You should see all meta tags and structured data! ✅

**Important:** Keep both terminals open (server + ngrok) while testing

---

## Common Issues

### Issue: Can't see meta tags in page source

**Solution:**
- Make sure you're viewing `http://localhost:3001` (NOT 3000)
- Make sure you ran `npm run build` before `npm run server`
- Check terminal for "Server successfully started on port 3001"

### Issue: Meta tags are empty or generic

**Solution:**
- Check your CMS has `seoDetails` data for that page
- Test the API directly: `https://interiorvillabd.com/api/globals/home?depth=1&draft=false`
- Look for `seoDetails.metaTitle` and `seoDetails.metaDescription` in the response

### Issue: Some pages work, others don't

**Solution:**
- Check `src/utils/ssr-seo.js` → `routeToApiMap`
- Make sure your route is listed there
- Add missing routes following the existing pattern

### Issue: Server won't start

**Solution:**
- Check if port 3001 is already in use: `lsof -ti:3001` (Mac/Linux) or `netstat -ano | findstr :3001` (Windows)
- Kill the process or use a different port

---

## Quick Verification Checklist

Before deploying to production:

- [ ] `npm run build` completes successfully
- [ ] `npm run server` starts without errors
- [ ] Can access `http://localhost:3001` in browser
- [ ] Page source shows meta tags with CMS content
- [ ] Server logs show "✅ Injected SEO meta tags"
- [ ] Different pages show different meta tags
- [ ] Tested at least 3 pages (home, portfolio, about)

Once all ✅, your SEO is ready for production! 🎉

---

## For Production Deployment

When ready to deploy:

1. Push your code to your server
2. SSH into your server
3. Run:
   ```bash
   npm install
   npm run build
   npm run server
   ```
4. Use PM2 or similar to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name interior-villa
   pm2 save
   pm2 startup
   ```

5. Test your live domain in Google Search Console

6. Request re-indexing for important pages

7. Wait 1-2 weeks for Google to crawl and update

---

## Need Help?

If something isn't working:

1. Check server logs for error messages
2. Test API endpoints directly in browser
3. Verify CMS is returning `seoDetails` data
4. Make sure you're testing port 3001 (production) not 3000 (dev)
5. Review `IMPORTANT_SEO_SETUP.md` for detailed troubleshooting

Your dynamic SEO is now ready for Google Search Console! 🚀
