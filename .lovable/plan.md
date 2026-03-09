

## Blank Screen on Hostinger — Root Cause & Fix

The blank screen happens because of two issues:

1. **SPA routing**: Hostinger (Apache-based) doesn't know to serve `index.html` for all routes. You currently only have a `_redirects` file (Netlify format) which Hostinger ignores. You need an `.htaccess` file for Apache.

2. **Base path**: If your site is deployed to a subdirectory (not the root), Vite needs a `base` config.

### Changes

**1. Create `public/.htaccess`** — Apache rewrite rules for SPA routing:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**2. Verify Hostinger setup**:
- Build command: `npm run build`
- Publish directory: `dist`
- Make sure the contents of `dist/` are uploaded to the `public_html` folder (not the `dist` folder itself)

These two files (`.htaccess` + correct `dist` deployment) will fix the blank screen.

