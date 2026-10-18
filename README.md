# Orelens portfolio

Static site for Orelens, the Bhopal design and reels studio founded by Nikunj Soni. It presents the studio as a monthly creative team for brands in India and for agencies in the USA and Dubai.

**Live URL (after GitHub Pages is publishing from Actions):**
https://orelens.github.io/orelens.portfolio/

The site files live in `site/`. Paths are relative (`css/styles.css`, `assets/...`, `data/projects.json`) so they resolve under that sub-path. Do not prefix asset paths with `/`.

## Publish on GitHub Pages

The workflow is `.github/workflows/pages.yml`. It uses `actions/configure-pages`, `actions/upload-pages-artifact` (artifact path: `site`) and `actions/deploy-pages`. It runs on every push to `main`, and can also be started by hand from the Actions tab.

The workflow is on `main`. A run already tried to publish and stopped because Pages is not turned on, and the Actions token is not allowed to turn it on (`Create Pages site failed. Resource not accessible by integration`).

**Do this once, in the GitHub website:**

1. Open **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions**.
3. Re-run the failed **Deploy GitHub Pages** workflow on `main` (Actions tab), or push any commit to `main`.

If GitHub asks you to approve the `github-pages` environment, approve it under **Settings → Environments**.

After that run succeeds, the site is at https://orelens.github.io/orelens.portfolio/

A pull request does not deploy. The workflow runs from `main`.

## Preview locally

From the repository root, so the site is served at the same sub-path as GitHub Pages:

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/site/ for a quick look. Relative links work when the folder that contains `index.html` is the page URL. To mirror the live sub-path, serve a parent directory in which this repo is available as `orelens.portfolio`.

## Logo

Use the official logo files. Do not redraw the ring or the wordmark.

| File | Use |
|---|---|
| `site/assets/logo/orelens-logo.webp` and `.png` | Header, hero and footer. Transparent crop of the official mark, for the dark site background. |
| `site/assets/logo/orelens-logo-dark.webp` and `.png` | The official mark kept on its dark navy field. |
| `site/assets/og.png` (and `og.webp`) | Open Graph image. The official logo on that dark field, framed at 1200×630. |
| `site/assets/favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `site/favicon.ico` | Favicon, cropped from the ring area of the official logo. |

Accent colours on the site are sampled from that logo’s blue-violet glow: background `#05060E`, indigo `#1F2069`, violet `#4A51B9`, glow `#8484D2`.

## Add a project to the Work gallery

The gallery is rendered by `site/js/main.js` from `site/data/projects.json`. There are two arrays:

- `caseStudies` — further real projects for the filtered gallery. Treabrolabs is already on the page as the featured client section in `site/index.html`. If this array is empty, only that featured section and the concept tiles are shown.
- `concepts` — fictional pieces. Each one must stay labelled as concept work.

### 1. Add the image or video

Put the file in `site/assets/work/`. Prefer a 4:5 image (1080×1350). Use `.webp` with a `.jpg` or `.png` if you want a fallback, and point `src` at the file you want the page to load.

```text
site/assets/work/brand-refresh.webp
site/assets/work/reel-edit.mp4
site/assets/work/reel-edit-poster.webp
```

Paths in JSON are relative to `site/`, not to the domain root. `assets/work/brand-refresh.webp` is correct. `/assets/work/brand-refresh.webp` will break on GitHub Pages.

Only add work you have the right to show. Do not add a client name, logo or result unless that client has agreed in writing. Do not invent numbers, quotes or awards.

### 2. Add the JSON entry

A case study:

```json
{
  "id": "brand-refresh-2026",
  "title": "Brand refresh",
  "category": "branding",
  "kind": "case-study",
  "client": "Name the client only with written permission",
  "summary": "What they asked for, what was made, and the outcome they confirmed.",
  "media": {
    "type": "image",
    "src": "assets/work/brand-refresh.webp",
    "alt": "Describe the image for someone who cannot see it."
  }
}
```

A video:

```json
{
  "id": "reel-edit-example",
  "title": "Product reel",
  "category": "reels",
  "kind": "case-study",
  "summary": "A short edit. Describe the cut, not a result you cannot verify.",
  "media": {
    "type": "video",
    "src": "assets/work/reel-edit.mp4",
    "poster": "assets/work/reel-edit-poster.webp",
    "mime": "video/mp4",
    "alt": "Short description of the reel."
  }
}
```

A concept placeholder (fictional brand only):

```json
{
  "id": "concept-new-poster",
  "title": "Festival poster study",
  "category": "posters",
  "kind": "concept",
  "fictionalBrand": "A name you invented for the exercise",
  "summary": "What the concept is practising. State that it is not a client project.",
  "media": {
    "type": "image",
    "src": "assets/work/concept-new-poster.webp",
    "alt": "Describe the concept image, including that it is fictional."
  },
  "label": "CONCEPT WORK – FICTIONAL BRAND",
  "credit": "Concept by Orelens · not a real client"
}
```

`category` must be one of: `social`, `ads`, `posters`, `thumbnails`, `branding`, `reels`, `real-estate`, `restaurant-cafe`, `hotel`, `salon`. Niche categories are for concept work only: Real estate, Restaurant/Cafe, Hotel and Salon.

`kind` must be `case-study` or `concept`. Concept entries always show the concept label. When `caseStudies` has at least one valid entry, the “Case studies coming soon” panel is hidden and those entries appear above the concept work.

Commit the media file and the JSON change together, then push to `main`.

## Contact details used on the site

- WhatsApp (primary): [@nikunj.sonii](https://wa.me/nikunj.sonii) — label on the site: Chat on WhatsApp. WhatsApp documents this as the username link (`wa.me/YourUsername`) in [How to contact someone by username](https://faq.whatsapp.com/1561101675623754).
- Email: [graphicdesigner.nikunj@gmail.com](mailto:graphicdesigner.nikunj@gmail.com?subject=Project%20enquiry%20from%20website). Web compose fallback: https://mail.google.com/mail/?view=cm&fs=1&to=graphicdesigner.nikunj@gmail.com&su=Project%20enquiry
- Location: Bhopal, India

Plans say **Pricing on request**. Do not add prices, client counts, testimonials, awards or a founding year unless Nikunj has published them.

## Fonts

Montserrat and Inter are self-hosted from Google Fonts (SIL Open Font License). Licence texts are in `site/assets/fonts/`.
