# Smart TaxBridge website

The existing static website is edited in place. All 82 original routes remain; five supporting pages bring the total to 87. The shared templates use original copy, typography, icons, and page styles. No inherited application bundles, trackers, or marketing assets are loaded.

## Work on the site

- Edit `scripts/content.py` for page-specific copy and page types.
- Edit `scripts/build_site.py` for shared HTML templates.
- Edit `assets/pro/site.css` and `assets/pro/site.js` for appearance and browser interactions.
- Run `python scripts/build_site.py` to regenerate the HTML and search index.
- Preview from this folder with `python -m http.server 8000`, then open `http://localhost:8000`.
- Use an HTTP server; root-relative links intentionally support the existing site routes.

## Verification

`python scripts/verify_site.py` checks all pages at desktop and mobile widths, then exercises navigation, search, the service finder, resource filters, calculators, checklist downloads, and inquiry drafts. It requires Python Playwright and an installed Chromium browser. QA screenshots are written outside the site to the OS temporary directory.

## Business details to complete

The phone number and email are marked samples as requested. The inquiry form downloads a local draft; it does not send email or submit a lead. No fabricated prices, credentials, offices, testimonials, or service guarantees are published. Confirm real business details and service terms before connecting live inquiry handling.

The 2025 tax illustration excludes credits and many individual circumstances. Its assumptions and official IRS references are displayed beside the tool. It is not a full return calculation. Expense and paycheck tools perform only the arithmetic described on their pages.

## Typography

Figtree is self-hosted at `assets/pro/fonts/figtree-latin-wght.woff2` under the SIL Open Font License (`assets/pro/fonts/OFL.txt`), so pages make no third-party font requests.

## Original imagery

Asset: `assets/pro/tax-conversation.png`.
Generated using the built-in image generation tool; this is an illustrative fictional scene, not a staff photograph or client testimonial.

Final prompt:

> Use case: photorealistic-natural. Asset type: professional tax preparation website editorial hero photograph for Smart TaxBridge. Create a single landscape photograph, 3:2 composition. A relaxed woman entrepreneur in her early 40s wearing a cream knit shirt seated at an oak table in a bright contemporary home office, reviewing a few neatly arranged unbranded documents beside an open slim laptop, looking thoughtfully and warmly toward another adult at the edge of the frame. Natural candid photography, authentic skin texture, beautifully soft daylight, subtle film grain, premium editorial financial services campaign. Warm ivory walls, muted deep forest green decor, a softly blurred plant. Medium-wide composition, person on the right two-thirds, table and negative space on left, realistic hands and understated styling. No writing or readable text, no logos, no recognizable software, no cash, no watermark. Illustrative fictional scene, not a testimonial.

## Source references

- Design benchmark reviewed: https://turbotax.intuit.com/ — layout/navigation reference only.
- 2025 federal brackets: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
- 2025 standard deductions: https://www.irs.gov/publications/p501
- Each educational page links to a relevant official IRS resource where applicable.

Previous versions are stored outside this website under `C:/Saad/Backups/`.
