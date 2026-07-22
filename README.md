# DALXIIS Travel Landing Page

A responsive single-page travel guide concept that introduces destinations across Somaliland. The current version does not provide live booking, verified pricing, customer support, or payment processing.

Live website: [https://dalxiis-six.vercel.app/](https://dalxiis-six.vercel.app/)

## Features

- Fixed navigation bar with a mobile menu
- Full-screen hero section with a call-to-action button
- Responsive destination cards
- Smooth animations and hover effects
- Canonical, Open Graph, Twitter and structured-data metadata
- Search-engine crawl files and a custom 404 page
- No build step or package installation required

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.

For automatic browser refresh while editing, you can also serve the folder with a simple local development server such as VS Code Live Server.

## Project structure

```text
.
├── 404.html
├── index.html
├── robots.txt
├── sitemap.xml
└── README.md
```

## Technologies

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Font Awesome

## Search visibility setup

Canonical website: `https://dalxiis-six.vercel.app/`

- Sitemap: `https://dalxiis-six.vercel.app/sitemap.xml`
- Robots file: `https://dalxiis-six.vercel.app/robots.txt`

To connect Google Search Console:

1. Add the canonical website as a URL-prefix property in Google Search Console.
2. Verify ownership. For the HTML-tag method, place Google's verification `<meta>` tag inside the `<head>` of `index.html`, deploy it, and then click **Verify**.
3. Open **Sitemaps**, enter `sitemap.xml`, and submit it.
4. Use **URL Inspection** for `https://dalxiis-six.vercel.app/`, run the live test, and request indexing after the production deployment is verified.
5. Recheck Coverage/Page Indexing and Core Web Vitals after Google has crawled the site.

Search Console verification requires the site owner's Google account and is not completed by this repository change.

## Content that still needs verification

Before turning this concept into a commercial travel website, add only verified operator details, contact information, availability, prices, policies, and current travel guidance. Do not publish placeholder reviews or ratings. If it becomes a real local business, keep its name, address, and phone number consistent and connect a verified Google Business Profile.
