# Crowned by Busi

A responsive website for **Crowned by Busi**, a Randburg-based hair boutique selling modern, affordable weaves, wigs, closures and accessories.

**Module:** WEDE5020 (Web Development, Introduction)
**Student:** [MATONGWANE LUFUNO ANGELA ST10513622]
**GitHub repository:** [maongwaneangela-art]
**Live site:** [https://github.com/matongwaneangela-art/crowned-by-busi]

---

## Contents

1. [Part 3 summary](#part-3-summary)
2. [Features](#features)
3. [Pages](#pages)
4. [SEO discussion](#seo-discussion)
4. [SEO details](#seo)
5. [Forms and validation](#forms-and-validation)
6. [Security and performance](#security-and-performance)
7. [Folder structure](#folder-structure)
8. [How to run](#how-to-run)
9. [Deployment](#deployment)
10. [Changelog](#changelog)
11. [Technologies](#technologies)
12. [Image credits](#image-credits)
13. [References](#references)
14. [Author](#author)

---

## Part 3 summary

Part 2 was a single home page (`index.html`) with a hero slider and a shopping bag. Part 3 turns it into a complete multi-page site and adds JavaScript functionality, SEO and working forms.

| Part 3 requirement | Where it is |
| --- | --- |
| Accordion | FAQs on `contact.html` |
| Tabs | Story / Pledge / Care tabs on `about.html` |
| Modal | Quick-view product dialog on `products.html` |
| Interactive map | Leaflet + OpenStreetMap map on `contact.html` (`map.js`) |
| Animations and transitions | CSS transitions, scroll-reveal fade-in (JavaScript + CSS), card hover effects; all disabled when the visitor prefers reduced motion |
| Advanced DOM manipulation | Product cards, quotes, email previews and error messages are built with the DOM API (`createElement`, `replaceChildren`, templates), never with visitor input as HTML |
| Gallery with lightbox | `gallery.html` (`gallery.js`) |
| Dynamic content | `products.html` builds the product grid from `products-data.js` |
| Search, filter and sort | Search box, category filter and sort menu on `products.html`; category filter on `gallery.html` |
| On-page SEO | See [SEO](#seo) |
| Off-page SEO | See [SEO](#seo) |
| `robots.txt`, `sitemap.xml` | Root folder |
| Enquiry form | `enquiry.html` |
| Contact form | `contact.html` |
| JavaScript validation + error messages | `forms.js` |
| AJAX form submission | `forms.js` (`fetch`) on the contact form |
| Deployment | See [Deployment](#deployment) |

## Features

- Responsive layout for desktop, tablet and mobile
- Scrolling announcement bar, sticky light header (menu and search on the left, logo, bag on the right), Shop dropdown, hamburger menu below 1180 px and a "skip to main content" link
- Full-width photo slider on the home page: the photos slide sideways with arrows, dots, swiping (or mouse drag) and automatic sliding, which stops for visitors who prefer reduced motion
- Shopping bag that works on every page and is remembered between pages (`localStorage`)
- Product catalogue with live search, category filter, sorting, a quick-view modal and, on phones, a "Filter and sort" button that opens the search tools as a sheet
- Photo gallery with category filter and lightbox (arrow keys, swipe, Esc)
- Enquiry form that returns an instant quote or consultation confirmation
- Contact form that compiles a validated email and can send it in the background (AJAX)
- Interactive map with a "How far am I?" distance tool
- Swipeable New Arrivals row with a progress bar on phones, category image tiles with round arrow buttons, a patterned consultation banner, an info band (delivery, support, savings, instant answers) and a dark footer
- Footer sign-up form that checks the email and prepares a sign-up email to the shop
- Back-to-top button, custom 404 page, privacy policy and terms page

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero slider, new arrivals, specials, categories, about snippet |
| `products.html` | Dynamic catalogue with search, filter, sort and quick view |
| `gallery.html` | Photo gallery with lightbox |
| `about.html` | Our story, our pledge and care information, in tabs |
| `enquiry.html` | Price and availability enquiry, or consultation booking |
| `contact.html` | General message form, map, trading hours and FAQ accordion |
| `privacy.html` | Privacy policy (POPIA) and website terms |
| `404.html` | Friendly "page not found" page |

## SEO discussion

**1. What is SEO and what is its purpose?**
SEO (Search Engine Optimisation) is the practice of structuring a website's content and code so that search engines such as Google can find, understand and rank it. Its purpose in web development is to bring relevant visitors to the site without paying for adverts. For Crowned by Busi, it helps Randburg shoppers who search for "wigs" or "weaves" find the shop.

**2. How does SEO improve user experience (UX) and performance?**
Many SEO practices are also good UX. Clear headings and a single `<h1>` make pages easy to scan, descriptive `alt` text helps screen-reader users, and a responsive layout works on phones. Performance improves with compressed images, `loading="lazy"` and `decoding="async"`, so pages load faster, which search engines reward.

**3. What are the benefits of implementing SEO?**
More free (organic) traffic, better visibility in local searches, more trust because the site appears near the top of the results, and lower advertising costs. Structured data can also show prices and opening hours in the results, which brings in more customers.

**4. Specific SEO techniques used (HTML, CSS and JavaScript)**
- **HTML:** one `<h1>` per page, semantic tags (`<header>`, `<nav>`, `<main>`, `<footer>`), meaningful `alt` text, descriptive file names, and JSON-LD structured data (`Store` and `Product`) in `<script type="application/ld+json">`.
- **CSS:** media queries for a mobile-friendly layout, because Google ranks the mobile version of a page.
- **JavaScript:** loaded at the end of `<body>` so it does not block the page from showing. Product lists are built from `products-data.js`, and the structured data is written directly in the HTML so crawlers can read it.
- **Files:** `robots.txt` and `sitemap.xml` guide search engine crawlers.

**5. HTML meta elements: purpose and examples**
Meta elements give the browser and search engines information about a page without showing it on the page. They are placed in the `<head>`. Examples from `index.html`:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Crowned by Busi | Weaves, Wigs &amp; Closures in Randburg</title>
<meta name="description" content="Randburg-based hair boutique selling weaves, wigs, closures and accessories.">
<meta name="robots" content="index, follow">
<meta property="og:title" content="Crowned by Busi">
```
`charset` sets the text encoding, `viewport` makes the page responsive on phones, `description` is the summary shown under the title in the search results, `robots` tells crawlers whether to index the page, and the `og:` tags control how a link looks when shared on social media.

---

## SEO

**On-page**

- **Keyword research:** the target keywords are the words a Randburg shopper would search for: *Randburg*, *weaves*, *wigs*, *closures*, *human hair*, *bundles* and *satin bonnet*. They are used naturally in page titles, headings, descriptions and image alt text. [Add the tool or search you used to check them, for example Google autocomplete or Google Trends.]
- **Title tags and meta descriptions:** every page has its own unique title (under about 60 characters) and meta description (under about 160 characters).
- **Header tags:** each page has exactly one `<h1>`, followed by `<h2>` and `<h3>` in order. On the home page, the `<h1>` is the shop name under the photo slider.
- **Image optimisation:** descriptive file names, meaningful `alt` text, `loading="lazy"` and `decoding="async"` on images below the fold.
- **URL structure:** short, lowercase, descriptive file names (`products.html`, `gallery.html`, `enquiry.html`). Category links use readable parameters such as `products.html?category=Wigs`.
- **Internal linking:** the header, footer, hero buttons, category tiles and call-to-action strips link between pages.
- **Mobile-friendliness:** responsive layout, `viewport` meta tag, tap-sized buttons, and no horizontal scrolling at 390 px (checked in a test browser).
- **Structured data:** JSON-LD for the shop (`Store` with address, map position and opening hours) on the home and contact pages, and `Product` with `Offer` (price and stock) for every item on the products page, so search engines can show rich results.
- **Social sharing:** Open Graph and Twitter Card tags, plus a canonical link on every page.

**Off-page** (planned actions; these happen outside the code)

- **Backlinks:** ask local directories and Randburg business listings to link to the site, and ask hair-care bloggers to review products.
- **Social media:** share new arrivals and specials on Instagram, Facebook and WhatsApp (icon links are in the footer).
- **Local SEO:** create a Google Business Profile for the Randburg Square shop, keep the name, address and phone number the same everywhere, and encourage customer reviews. The contact page includes the address, map, trading hours and `Store` structured data to support this.

**Additional**

- `robots.txt` allows all crawlers and points to the sitemap.
- `sitemap.xml` lists every public page with `lastmod`, `changefreq` and `priority`.

## Forms and validation

**Enquiry form (`enquiry.html`)**: for customers who want a price or availability answer, or a consultation.

- Fields: name, email, cell number, enquiry type, product, length, quantity, collection or delivery, notes and consent.
- For a product enquiry, the answer shows stock status, price, quantity, bulk discount (5 or more items: 10% off), delivery fee (free over R1,200) and an estimated total.
- For a consultation, the visitor picks a date and topic. The date is checked against opening hours (closed on Sundays), and the answer confirms the R150 consultation fee, which is deducted from any purchase on the day.

**Contact form (`contact.html`)**: for general messages.

- Fields: name, email, cell number (optional), message type, subject, message and consent. A hidden honeypot field catches bots.
- Once valid, the details are compiled into an email with a subject line and body. The visitor can open it in their email app (`mailto:`), open it in Gmail, or copy the text.
- **AJAX:** if the form's `action` is set to a form service such as Formspree, the message is sent in the background with `fetch()` and the page does not reload. If the service is not connected or the network fails, the form falls back to the compiled email.

**Validation (both forms, `forms.js`)**

- HTML5 attributes (`required`, `type="email"`, `type="tel"`, `minlength`, `maxlength`, `pattern`) plus JavaScript checks.
- South African cell number format, email format, name length, quantity range, a real calendar date inside the booking window, and character limits with live counters.
- Error messages appear next to each field, the first invalid field gets focus, and `aria-invalid` and `aria-describedby` are set for screen readers.
- Visitor input is always inserted as text (`textContent`), never as HTML.

> **To receive messages automatically:** create a free form at [formspree.io](https://formspree.io), then replace `your-form-id` in the `action` attribute of the contact form in `contact.html`. Until then the contact form opens the compiled email instead.

## Security and performance

- **Content Security Policy** (a `<meta>` tag on every page, and in `_headers` for Netlify) limits scripts, styles, fonts and images to the sources the site actually uses.
- **Security headers** in `_headers` (Netlify only): `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`. GitHub Pages ignores this file but serves the site over HTTPS, and the CSP meta tag still applies.
- External libraries (Leaflet) use Subresource Integrity (`integrity` attribute) and `crossorigin`.
- External links use `rel="noopener noreferrer"`.
- Form input is validated on the client and inserted as text. Because the site is static, real validation of submitted data must also happen on the form service's server.
- **Page speed:** no frameworks (plain HTML, CSS and JavaScript), lazy-loaded images, `preconnect` for fonts, `preload` for the hero image, Leaflet loaded only on the contact page, product data loaded only on pages that need it, and 7-day caching for images in `_headers`.

## Folder structure

```
crowned-by-busi/
├── index.html          # Home
├── products.html       # Catalogue (search, filter, sort, quick view)
├── gallery.html        # Gallery with lightbox
├── about.html          # About (tabs)
├── enquiry.html        # Enquiry form
├── contact.html        # Contact form, map, FAQ accordion
├── privacy.html        # Privacy policy and terms
├── 404.html            # Page not found
├── style.css           # All styling and responsive breakpoints
├── script.js           # Shared: menu, hero slider, cart, accordion, tabs, animations
├── products-data.js    # Product catalogue data
├── products.js         # Catalogue: search, filter, sort, quick view
├── gallery.js          # Gallery filter and lightbox
├── forms.js            # Validation, enquiry answers, contact email and AJAX
├── map.js              # Leaflet map
├── robots.txt
├── sitemap.xml
├── _headers            # Security and caching headers (Netlify)
├── README.md
└── images/             # All photos used on the site
    ├── favicon.svg
    ├── crown-pattern.svg
    ├── hero-1.jpg ... hero-3.jpg
    ├── product-1.jpg ... product-4.jpg
    ├── special-1.jpg ... special-3.jpg
    └── category-1.jpg ... category-3.jpg
```

## How to run

1. Download or clone this repository.
2. Keep all files and the `images` folder together.
3. Open `index.html` in any web browser. (The map and fonts need an internet connection.)

## Deployment

**GitHub Pages**

1. Push the repository to GitHub.
2. Open the repository's **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site appears at `https://YOUR-USERNAME.github.io/crowned-by-busi/`.

**Netlify (alternative)**

1. Sign in at netlify.com and choose **Add new site > Import an existing project**.
2. Connect the GitHub repository. Leave the build command empty and set the publish directory to `/`.
3. Netlify reads `_headers` automatically.

**After deploying, replace the placeholder web address.** The files `robots.txt`, `sitemap.xml` and the canonical, Open Graph and JSON-LD tags contain `https://YOUR-USERNAME.github.io/crowned-by-busi/`. Use find-and-replace across the whole project to swap it for your real live address.

## Changelog

All notable changes, newest first.

### Part 3: 28 October 2026

**Feedback edits from Part 2**

Part 2 was not submitted on time because of technical issues, so no marks or marker feedback were received. Instead of inventing feedback, the Part 2 work was reviewed against the Part 2 requirements and the problems found were fixed. If the lecturer provides feedback later, new entries will be added here.

- **Navigation links fixed (`index.html`).** In Part 2 the Shop dropdown, category tiles, "Read our story", and several footer links pointed to `#` and went nowhere. They now link to real pages: for example `products.html?category=Wigs`, `about.html` and `contact.html`. The Home link is marked `aria-current="page"`.
- **One `<h1>` per page (`index.html`).** The three hero slides each used an `<h1>`. Only the first slide is an `<h1>` now. The other two are `<h2>` and use a shared `hero-title` class so they look the same. This improves the heading structure for SEO and screen readers.
- **Checkout message improved (`script.js`).** The Part 2 checkout used a browser `alert()` saying "Thank you for your order", which was misleading because no order is placed. It now explains that online checkout is coming soon and directs the customer to the enquiry page or the shop.
- **Shopping bag now remembered (`script.js`).** In Part 2 the bag emptied whenever the page changed. It is now saved in `localStorage` so it works across all pages and survives a refresh. Storage access is wrapped in `try/catch` so the site still works if storage is blocked.
- **Add to Cart handler made shared (`script.js`).** Part 2 attached a click handler to each button that existed when the page loaded. The cart now uses one delegated click handler, so Add to Cart also works on buttons created later by `products.js`, and the same cart code runs on every page.
- **Image loading and accessibility (`index.html`).** `loading="lazy"` was added to images below the fold. A "Skip to main content" link, a `<main>` landmark and a labelled navigation (`aria-label="Main navigation"`) were added.
- **Per-page metadata (`index.html`).** Added a canonical link, Open Graph and Twitter tags, a favicon, a theme colour, and JSON-LD structured data to the home page.
- **Shop dropdown always open (`style.css`).** In Part 2, `.main-nav ul { display: flex }` was more specific than `.dropdown { display: none }`, so the Shop dropdown was always visible and laid out sideways. A more specific `.main-nav .dropdown` rule hides it until the visitor hovers or tabs to it, and it opens as a vertical list.
- **Cart drawer shadow leaking (`style.css`).** The closed cart drawer's box-shadow showed as a grey strip on the right edge of every page. The shadow now only applies while the drawer is open.
- **Mobile dropdown links unreadable (`style.css`).** On mobile the Shop links were dark grey on the purple menu. The menu now has a light background, so they are readable.
- **README placeholders.** The Part 2 README had placeholder text for the live link and image sources. Sections for deployment, SEO, forms, security and references were added.

**New in Part 3**

- **New pages:** `products.html`, `gallery.html`, `about.html`, `enquiry.html`, `contact.html`, `privacy.html` and `404.html`, all using the same header, footer, cart drawer and styling as the home page.
- **Products page (`products.html`, `products.js`, `products-data.js`).** Product cards are generated from a data file using an HTML `<template>`. Added live search, a category filter, sort (featured, newest, price low to high, price high to low, name), a result counter, an empty state with a "clear filters" button, and URL parameters such as `?category=Wigs`, `?q=curly` and `?sort=newest` so links from other pages open pre-filtered.
- **Quick-view modal (`products.html`, `products.js`).** A native `<dialog>` that shows a larger product view with length and quantity choices, "Add to bag" and "Enquire" buttons. Esc and the close button close it.
- **Gallery and lightbox (`gallery.html`, `gallery.js`).** Photos open in a larger view with previous and next buttons, arrow-key and swipe support, a counter and a caption. A category filter changes which photos appear.
- **Accordion (`contact.html`, `script.js`).** Six FAQs use buttons with `aria-expanded` and `aria-controls` so each answer opens and closes on click.
- **Tabs (`about.html`, `script.js`).** Story, Pledge and Care tabs use the ARIA tab pattern, with Left, Right, Home and End keys moving between tabs.
- **Interactive map (`contact.html`, `map.js`).** Leaflet and OpenStreetMap show the shop with a popup. A "How far am I?" button uses the browser's location, only after the visitor presses it, and calculates the straight-line distance with the Haversine formula. If Leaflet cannot load, a text fallback with the address is shown.
- **Enquiry form (`enquiry.html`, `forms.js`).** Validated form that gives an instant quote (stock, price, bulk discount, delivery, total) or a consultation confirmation checked against opening hours.
- **Contact form (`contact.html`, `forms.js`).** Validated form that compiles an email (`mailto:`, Gmail link and copy button) and sends in the background with `fetch()` when a form endpoint is connected. Includes a honeypot field, a 12-second timeout and a fallback to the email if sending fails.
- **Validation engine (`forms.js`).** Inline error messages, live character counters, first-error focus, and ARIA attributes, for both forms.
- **Animations (`style.css`, `script.js`).** Scroll-reveal fade-in using `IntersectionObserver`, hover and transition effects on cards and buttons, and a back-to-top button. All motion is switched off when the visitor's device asks for reduced motion.
- **SEO.** Unique titles and descriptions on every page, heading hierarchy, descriptive alt text, canonical links, Open Graph and Twitter tags, JSON-LD structured data, `robots.txt` and `sitemap.xml`.
- **Security and performance.** Content Security Policy on every page, `_headers` file, Subresource Integrity on Leaflet, `rel="noopener noreferrer"` on external links, lazy-loaded images, `preconnect` and `preload` hints.
- **Restyle: modern online-store look (`style.css`, `script.js`, all pages).** The layout was redesigned after reviewing the Orlando Pirates official online store on a phone, taking the layout patterns (not its logo, photos, text or colours). **No brand colours were changed.** Every colour still comes from the Part 2 palette variables (purple, pink, white, charcoal). What changed:
  - A scrolling announcement bar at the top (free delivery, free collection, bulk discount, shop address) that pauses on hover and stops moving when the visitor's device asks for reduced motion.
  - A light header with the menu button and search on the left, the logo with "Hair boutique" in the middle and the bag on the right. The full menu sits in a row on large screens and in a slide-down menu below 1180 px.
  - Rounder shapes: pill buttons, 16 px rounded cards and inputs, and thin progress-style slider dots.
  - Headings in Barlow Semi Condensed and body text in Barlow (replacing Playfair Display and Poppins). Only the hero, page banners and section titles are uppercase.
  - A **swipeable New Arrivals row** on phones with a progress bar that moves as you scroll (`script.js`).
  - **Category image tiles** with the label at the bottom and a round white arrow button (replacing the round photos).
  - A scrolling marquee heading, a dark Specials section with rounded cards, and a **consultation banner** with a repeating crown pattern (`images/crown-pattern.svg`, drawn from the shop's own crown logo).
  - An **info band** with four icon columns: delivery and collection, support hours, bulk savings and instant answers. The details come from the shop settings in `forms.js`.
  - A dark **footer** with a sign-up form, link columns and social icons. Because the site has no server to store subscribers, the form validates the email and then prepares a sign-up email to the shop for the visitor to send. It does not claim the visitor is subscribed.
  - A **"Filter and sort" button** on phones (`script.js`). The search tools become a sheet that slides up from the bottom, and the header search icon opens it.
  - A **photo slider** on the home page (`index.html`, `script.js`, `style.css`). The hero is now a row of full-width photos with no text on top, as on store sites. Each photo slides in sideways, and can be changed with the arrows, the dots, a swipe on a phone or a mouse drag on a laptop. Each photo is a link, with a small label (for example "Shop the collection") at the bottom. The heading, tagline and buttons moved to a short intro directly under the slider, so the page still has exactly one `<h1>`. The shop name and logo in the header were not changed. A swipe does not accidentally open the photo's link, hidden photos are skipped by the Tab key, and the slider does not auto-slide or animate when the visitor prefers reduced motion. The older text-over-photo hero rules in `style.css` are no longer used.
- **Navigation breakpoint (`style.css`).** The menu now has 8 items, which no longer fit in one row on tablets and small laptops. The hamburger menu now starts at 1180 px instead of 680 px, and the header was tightened on phones (smaller logo, account icon hidden) so it never scrolls sideways.
- **`style.css`.** Added styles for the new pages and components (forms, errors, chips, tabs, accordion, dialogs, lightbox, gallery, map, toolbar, status badges), plus focus styles and reduced-motion rules. Existing Part 2 styles were kept.
- **Testing.** After the restyle, all 8 pages were rechecked at 8 widths from 360 px to 1440 px for sideways scrolling and JavaScript errors, and the new phone features (filter sheet, carousel progress bar, footer sign-up form, reduced motion) were tested in a browser. All eight pages were opened in an automated browser test with no JavaScript errors. Search, sorting, the lightbox, the accordion, both forms (empty, invalid and valid input) and the mobile menu all worked. No horizontal scrolling at 390 px width on the home, products, contact, enquiry and gallery pages.

### Part 2

- Home page with utility bar, sticky navigation and Shop dropdown.
- Auto-sliding hero banner with arrows and dots.
- New Arrivals product cards with Add to Cart.
- Slide-out shopping bag with quantity controls, remove and subtotal.
- Weekly specials, shop by category, About section and footer.
- Responsive layout and mobile hamburger menu.

## Technologies

- HTML5 (semantic elements, `<dialog>`, `<template>`, form validation attributes)
- CSS3 (custom properties, flexbox, grid, transitions, media queries)
- JavaScript (vanilla): DOM manipulation, `fetch`, `localStorage`, `IntersectionObserver`, Geolocation API
- [Leaflet](https://leafletjs.com/) 1.9.4 with OpenStreetMap tiles
- Google Fonts: Barlow Semi Condensed (headings) and Barlow (body text)
- Hosting: GitHub Pages or Netlify

## Image credits

Product images were sourced from Pinterest for educational use only. Original sources: [add the links or seller names here].

Map tiles and data: &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## References

Add your own access date to each reference in the format your institution requires (for example Harvard).

- Google Search Central (n.d.) *SEO starter guide*. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central (n.d.) *Introduction to structured data markup*. Available at: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Sitemaps.org (n.d.) *Sitemaps XML format*. Available at: https://www.sitemaps.org/protocol.html
- Leaflet (n.d.) *Leaflet: an open-source JavaScript library for interactive maps*. Available at: https://leafletjs.com/
- OpenStreetMap (n.d.) *Copyright and licence*. Available at: https://www.openstreetmap.org/copyright
- MDN Web Docs (n.d.) *`<dialog>`: The Dialog element*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- MDN Web Docs (n.d.) *Client-side form validation*. Available at: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
- MDN Web Docs (n.d.) *Using the Fetch API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN Web Docs (n.d.) *Intersection Observer API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- MDN Web Docs (n.d.) *Content Security Policy (CSP)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- W3C (n.d.) *ARIA Authoring Practices Guide: Accordion and Tabs patterns*. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/
- schema.org (n.d.) *Store*. Available at: https://schema.org/Store
- Formspree (n.d.) *Formspree documentation*. Available at: https://formspree.io/
- GitHub Docs (n.d.) *About GitHub Pages*. Available at: https://docs.github.com/en/pages
- Netlify Docs (n.d.) *Custom headers*. Available at: https://docs.netlify.com/manage/routing/headers/
- Information Regulator (South Africa) (n.d.) *Protection of Personal Information Act (POPIA)*. Available at: https://inforegulator.org.za/

## Author

[Matongwane lufuno], [RI], 2026
