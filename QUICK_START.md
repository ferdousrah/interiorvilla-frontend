# Quick Start Guide

## The Error You Saw

The error happened because you tried to run `npm run server` **without building first**. The server needs the `dist` folder which is created during the build process.

## Correct Order

### 1. Build First (ALWAYS!)

```bash
npm run build
```

This creates the `dist` folder with your optimized production files.

### 2. Then Start Server

```bash
npm run server
```

Server will now start on port 3001 with SSR SEO! ✅

---

## Development vs Production

### During Development

Use this when you're coding and want hot reload:

```bash
npm run dev
```

- Runs on port 3000
- Hot module reloading
- Fast refresh
- **SEO is client-side** (not visible to Google)

### For SEO Testing / Production

Use this when you want to test SEO or run in production:

```bash
# Step 1: Build
npm run build

# Step 2: Start server
npm run server
```

- Runs on port 3001
- **SEO is server-side** (visible to Google) ✅
- Production optimized
- No hot reload

---

## Common Mistakes

### ❌ Wrong: Starting server without building

```bash
npm run server  # ERROR! No dist folder
```

**Result:** Server crashes with path-to-regexp error

### ✅ Correct: Build then serve

```bash
npm run build   # Creates dist folder
npm run server  # Starts server with dist folder ✅
```

---

## After Making Code Changes

### If you changed React components, pages, styles:

```bash
# Rebuild to see changes in production
npm run build

# Restart server (Ctrl+C to stop, then):
npm run server
```

### If you changed server.js or ssr-seo.js:

```bash
# Just restart server (no build needed)
# Ctrl+C to stop current server, then:
npm run server
```

---

## Testing Your SEO

Once server is running:

```bash
# In your browser:
http://localhost:3001

# Right-click → View Page Source
# Look for meta tags in <head> ✅

# Or test with curl:
curl http://localhost:3001 | grep "meta name=\"description\""
```

---

## Deployment to Production Server

When deploying to your live server:

```bash
# 1. Clone/pull your code
git pull

# 2. Install dependencies (if new)
npm install

# 3. Build
npm run build

# 4. Start server (use PM2 for production)
pm2 start server.js --name interior-villa
pm2 save
```

---

## Troubleshooting

### Server won't start / path-to-regexp error

**Cause:** No dist folder

**Solution:**
```bash
npm run build
npm run server
```

### Changes not showing up

**Cause:** Old build

**Solution:**
```bash
npm run build    # Rebuild
npm run server   # Restart server
```

### Port already in use

**Cause:** Server already running

**Solution:**
```bash
# Find and kill process on port 3001
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# On Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Then start again:
npm run server
```

---

## Remember

1. ✅ **Development:** `npm run dev` (port 3000)
2. ✅ **Production/SEO:** `npm run build` → `npm run server` (port 3001)
3. ✅ Always build before starting server
4. ✅ Google only sees SEO on port 3001 (production mode)

Your SSR SEO is ready! 🚀
