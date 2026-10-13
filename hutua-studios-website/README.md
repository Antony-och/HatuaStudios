# hutua studios website

Plain HTML, CSS and JavaScript. No build step: open `index.html` or upload the folder to any static host
(Netlify, Cloudflare Pages, GitHub Pages, or normal web hosting).

## Edit your content
- **Projects:** edit `projects.js` only. It feeds the home page, Work page, popups and case-study pages.
  Put images in `assets/work/` and point `image` at them. Add `video` for an mp4.
- **Showreel and photos:** `what-we-make.html` and `index.html` (search for `TODO`).
- **Contact:** set `TO` (your email) and optionally `FORM_ENDPOINT` (a form service URL) at the top of `main.js`.
  With no endpoint, the form opens the visitor's email app instead.
- **Contact details and socials:** the footer in every page, and `contact.html`.
- **Domain:** replace `YOUR-DOMAIN` in the page heads, `sitemap.xml` and `robots.txt` once you have one.

## Files
`index, services, what-we-make, work, process, contact, project (case study), 404` .html · `styles.css` · `main.js` · `projects.js` · `assets/`
