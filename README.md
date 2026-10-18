# StockDesk Inventory — Landing Page

Marketing site for **StockDesk Inventory**, inventory and POS control for busy counters. Starting in Uganda, priced in UGX, with MTN MoMo and Airtel Money billing.

- Site: [www.stockdeskinventory.com](https://www.stockdeskinventory.com) (the apex domain redirects to `www`)
- Product app: [app.stockdeskinventory.com](https://app.stockdeskinventory.com)

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home: hero with demo desk, product, how it works, roles, comparison, customers, pricing summary, FAQ, founders, CTA |
| `pricing.html` | Plans (Starter / Growth / Business) and pricing FAQ |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `404.html` | Not-found page (root-relative paths, so it works at any URL depth; Vercel serves it automatically) |

Shared assets: `styles.css`, `app.js`, `public/`. SEO files: `robots.txt`, `sitemap.xml`.

## Stack

- Static HTML, CSS, and vanilla JavaScript
- No build step or package manager required
- Fonts loaded from Google Fonts (Space Grotesk, Inter, IBM Plex Mono)

## Run locally

Internal links use clean URLs (`/pricing`, `/privacy`, `/#faq`), so serve the folder with a static server that supports them, for example:

```bash
npx serve .
```

Opening `index.html` straight from disk shows the page, but links between pages won't resolve.

## Deploy

Production is deployed by Vercel from `main` of [STOCKDESKLANDINGPAGE](https://github.com/mahadishaaqlubega/STOCKDESKLANDINGPAGE). `vercel.json` turns on `cleanUrls`, so `/pricing.html` redirects to `/pricing`; canonical tags and `sitemap.xml` use the clean URLs.

## Project structure

```
├── index.html
├── pricing.html
├── privacy.html
├── terms.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── vercel.json
├── styles.css
├── app.js
└── public/
    ├── logo.svg               brand mark (also used inline via the SVG sprite)
    ├── favicon.svg
    ├── favicon-32.png
    ├── apple-touch-icon.png   180×180
    ├── og-image.png           1200×630 link-preview image (WhatsApp, X, etc.)
    ├── image.webp             product screenshot (full size)
    ├── image-960.webp         product screenshot (phones)
    ├── image.png              product screenshot fallback
    └── grittrix-logo.png      partner mark
```

When updating the product screenshot, export it from a demo account (no real customer names or revenue) and regenerate both WebP sizes.

## Analytics

`app.js` forwards clicks on any element with `data-track` (for example `data-track="Signup" data-loc="hero"`) to Plausible or Google Analytics 4 if either is on the page. Until an analytics snippet is added to the `<head>` of each page, tracking does nothing. Signup and WhatsApp buttons are already tagged.

## Contact

- Email: [hello@stockdeskinventory.com](mailto:hello@stockdeskinventory.com)
- WhatsApp: [+256 742 226 839](https://wa.me/256742226839) · [+256 756 693 840](https://wa.me/256756693840)

## Collaboration

Built in collaboration with [Grittrix Technologies](https://grittrix.com).

## Founders

- Mahad Ishaaq Lubega
- Disan Nkangi

## License

Proprietary. All rights reserved © StockDesk Inventory.
