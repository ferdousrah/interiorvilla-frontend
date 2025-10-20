# Important: SEO Setup Instructions

## How Your App Runs

Your application has **two modes**:

### 1. Development Mode (`npm run dev`)
- Runs Vite dev server on port 3000
- Hot module reloading for fast development
- **⚠️ SEO meta tags are CLIENT-SIDE ONLY** (not visible to Google)
- Used for: Development and testing features

### 2. Production Mode (`npm run build` + `npm run server`)
- Builds optimized static files
- Runs Express server on port 3001
- **✅ SEO meta tags are SERVER-SIDE** (visible to Google)
- Used for: Production deployment

---

## Why This Matters for SEO

### Google Search Console Testing

When you test your site with **Google Search Console URL Inspection**, you MUST use the **production mode**:

```bash
# 1. Build your app
npm run build

# 2. Start production server
npm run server

# 3. Server runs on http://localhost:3001
# Now test this URL in Google Search Console
```

### Development vs Production

| Feature | Development (`npm run dev`) | Production (`npm run server`) |
|---------|----------------------------|------------------------------|
| **Port** | 3000 | 3001 |
| **SEO Tags** | Client-side (after JS) | Server-side (in HTML) ✅ |
| **Google Sees** | Empty HTML | Complete HTML with SEO ✅ |
| **Hot Reload** | Yes ✅ | No |
| **Build Required** | No | Yes |
| **Use For** | Development | Production / SEO Testing |

---

## Testing Your SEO Implementation

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Start Production Server
```bash
npm run server
```

Server will start on: `http://localhost:3001`

### Step 3: Verify Meta Tags in HTML

Open terminal and run:
```bash
curl http://localhost:3001 | grep -i "meta name=\"description\""
```

You should see something like:
```html
<meta name="description" content="Your page description from CMS" />
```

If you see this, **SEO is working!** ✅

### Step 4: Test with Google Search Console

1. Make sure your production server is running on port 3001
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Use **URL Inspection** tool
4. For local testing, you can use a tool like [ngrok](https://ngrok.com/) to create a public URL:
   ```bash
   npx ngrok http 3001
   ```
5. Test the ngrok URL in Google Search Console

---

## For Production Deployment

When deploying to your live server:

### Option 1: Using Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Build your app
npm run build

# Start server with PM2
pm2 start server.js --name "interior-villa"

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

### Option 2: Using Docker
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

### Option 3: Direct Node
```bash
# Build
npm run build

# Start server (use screen/tmux to keep it running)
node server.js
```

---

## Environment Setup

### Development
```bash
# .env.development
VITE_API_URL=http://localhost:3000
```

### Production
```bash
# .env.production
NODE_ENV=production
PORT=3001
```

---

## Verifying SEO is Working

### ✅ Success Indicators

1. **View Page Source** (Ctrl+U in browser):
   - Meta tags are visible in `<head>` section
   - Title and description are from your CMS
   - Structured data JSON-LD is present

2. **Google Search Console URL Inspection**:
   - Shows all meta tags
   - No errors about missing metadata
   - Structured data is detected

3. **Server Logs Show**:
   ```
   ✅ Injected SEO meta tags for: /portfolio
   ✅ Injected SEO meta tags for: /about
   ```

### ❌ Problem Indicators

1. **If you see** `⚠️ No SEO data found for: /some-route`:
   - Check that route is in `src/utils/ssr-seo.js` routeToApiMap
   - Verify CMS API endpoint is returning `seoDetails`
   - Test API endpoint directly in browser

2. **If meta tags are not in HTML**:
   - Make sure you ran `npm run build`
   - Verify you're testing port 3001 (not 3000)
   - Check server logs for errors

3. **If Google doesn't see meta tags**:
   - You're testing dev server (port 3000) instead of production (port 3001)
   - Server is not publicly accessible
   - Need to deploy or use ngrok for testing

---

## Common Questions

### Q: Why can't I test SEO in development mode?
**A:** Development mode (`npm run dev`) uses Vite's dev server which doesn't have SSR capabilities. SEO tags are added by JavaScript on the client, which Google doesn't execute during initial crawl.

### Q: Do I need to rebuild every time I change code?
**A:**
- **Development**: No, use `npm run dev` for instant updates
- **SEO Testing**: Yes, use `npm run build` then `npm run server`
- **Production**: Yes, rebuild and restart server

### Q: How do I test local site with Google Search Console?
**A:** Use ngrok to create a temporary public URL:
```bash
npx ngrok http 3001
# Copy the https URL and test it in Google Search Console
```

### Q: Can I use both servers at the same time?
**A:** Yes!
- Run `npm run dev` on port 3000 for development
- Run `npm run server` on port 3001 for SEO testing
- They won't conflict

---

## Quick Reference

```bash
# Development (no SEO)
npm run dev
# → http://localhost:3000

# Production (with SEO)
npm run build && npm run server
# → http://localhost:3001

# Test SEO in terminal
curl http://localhost:3001 | grep -i "meta"

# Test SEO with public URL
npx ngrok http 3001
# Test the https URL in Google Search Console
```

---

## Next Steps After Deployment

1. ✅ Deploy to production server
2. ✅ Verify site is accessible via your domain
3. ✅ Test URL in Google Search Console
4. ✅ Request re-indexing for important pages
5. ✅ Monitor Search Console for improvements
6. ✅ Wait 1-2 weeks for Google to re-crawl

---

## Support Checklist

If SEO is not working:

- [ ] Did you run `npm run build`?
- [ ] Is server running on port 3001?
- [ ] Are you testing port 3001 (not 3000)?
- [ ] Can you see meta tags with `curl http://localhost:3001`?
- [ ] Are server logs showing "Injected SEO meta tags"?
- [ ] Is your CMS API returning `seoDetails`?
- [ ] Did you add the route to `routeToApiMap` in `ssr-seo.js`?

If all above are ✅ and it's still not working, check server logs for error messages.
