import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Remove unused imports and dead code
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  define: {
    global: 'globalThis',
  },
  publicDir: 'public',
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true,
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        safari10: true,
        toplevel: true
      },
      format: {
        comments: false
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096, // Inline small assets
    rollupOptions: {
      external: [],
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Core React chunks
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // Animation libraries - split for better loading
          'animation': ['gsap', 'framer-motion'],
          'gsap-plugins': ['gsap/ScrollTrigger', 'gsap/SplitText', 'gsap/ScrollToPlugin'],
          
          // 3D and heavy libraries
          'three-vendor': ['three', 'three-stdlib'],
          
          // UI components
          'ui-components': [
            'lucide-react', 
            '@radix-ui/react-slot', 
            '@radix-ui/react-separator',
            '@radix-ui/react-tabs'
          ],
          
          // Media and carousel
          'media': ['@fancyapps/ui', 'embla-carousel-react'],
          
          // Utilities
          'utils': ['class-variance-authority', 'clsx', 'tailwind-merge']
        },
        // Optimize file naming for better caching
        chunkFileNames: (chunkInfo) => {
          return `assets/js/[name]-[hash:8].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash:8].[ext]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash:8].[ext]`;
          }
          return `assets/[name]-[hash:8].[ext]`;
        }
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      'framer-motion', // Load dynamically
      'gsap/SplitText',
      'gsap/ScrollTrigger', 
      'gsap/ScrollToPlugin',
      '@fancyapps/ui',
      'three',
      'three-stdlib',
      'vanilla-tilt'
    ]
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    }
  }
})