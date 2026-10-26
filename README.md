# Orelens portfolio

Static site for Orelens, a SaaS product-video studio in Bhopal founded by Nikunj Soni. The page covers launch films, product demos, feature-release clips, 9:16 social cuts, the process, work, and contact.

The site files live in `site/`. GitHub Pages publishes that folder, not the repository root. Paths are relative (`css/styles.css`, `js/main.js`, `assets/...`) so they resolve under the project sub-path. Do not prefix asset paths with `/`.

**Live URL:** https://orelens.github.io/orelens.portfolio/

## Publish on GitHub Pages

Pages is enabled for this repository. The source is **GitHub Actions** (workflow), not a branch folder. The workflow is `.github/workflows/pages.yml`. It runs on every push to `main`, uploads the `site` directory as the Pages artifact, and deploys it.

A pull request does not deploy. The workflow runs from `main` after the pull request is merged.

There is no custom domain (`CNAME`) and no Vercel or Netlify config. `site/.nojekyll` is kept with the published files.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/site/

To mirror the live sub-path `/orelens.portfolio/`, serve a parent directory in which the contents of `site/` are available as `orelens.portfolio`.

## Fonts

Inter is self-hosted at `site/assets/fonts/inter-latin.woff2` under the SIL Open Font License. The licence text is `site/assets/fonts/OFL-inter.txt`.

## Contact details used on the site

- Email: [graphicdesigner.nikunj@gmail.com](mailto:graphicdesigner.nikunj@gmail.com)
- WhatsApp username, shown as text: @nikunj.sonii
- Location: Bhopal, India
