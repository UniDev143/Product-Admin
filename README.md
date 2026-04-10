# Product Admin

Admin dashboard for Moral Clean built with React + Vite.

## Environment

Set backend API URL using Vite environment variables.

- `.env.example` contains a template value.
- `.env.production` is set for production deployment.

Production value used here:

`VITE_API_BASE_URL=https://api.moralclean.com`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Vite output is generated in `dist`.

## Hostinger notes

- This project includes `public/.htaccess` for SPA route fallback to `index.html` on Apache.
- Deploy the built `dist` contents to `admin.moralclean.com` document root.
