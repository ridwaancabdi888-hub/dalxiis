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

1. Clone the repository and enter its folder:

```bash
git clone https://github.com/ridwaancabdi888-hub/dalxiis.git
cd dalxiis
```

2. Start a local HTTP server from the repository root:

```bash
# Windows
py -m http.server 8000

# macOS/Linux
python3 -m http.server 8000
```

3. Open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly also works for most features, but using a local server more closely matches the deployed website and avoids browser restrictions on local files. Press `Ctrl+C` in the terminal to stop the server.

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
