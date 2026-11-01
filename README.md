# Pramod Shekapure — portfolio

A responsive, dark portfolio built with React, Vite, Tailwind CSS, and a lazy-loaded Three.js hero scene.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Personalize the portfolio

Edit [`src/data.js`](./src/data.js) to update the portfolio content, email address, social URLs, and profile image sources. The hero portrait uses 400px, 800px, and 1200px WebP/JPG variants in `public/assets/`; update the `image` paths there if you replace the photo.

The resume button downloads a text resume generated from the same portfolio data. The contact form validates and sanitizes its fields in the browser, then opens a prefilled email in the visitor's default email app. It does not store or transmit form data to a server. Update `email` in `src/data.js` before deployment.

## Deploy

### GitHub Pages

1. Push the project to the `main` branch of a GitHub repository.
2. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
3. The included workflow builds and deploys the site. If your default branch is not `main`, update the branch in `.github/workflows/deploy.yml`.

Vite's relative asset base supports both user sites and repository subpaths.

### Vercel or Netlify

Import the repository, use `npm run build` as the build command, and set `dist` as the publish/output directory. No environment variables or backend services are required.

The social profile URLs and public email in `src/data.js` are placeholders. Replace them before publishing.
