# Eva360 Dijital — V6

Premium responsive static website for Vercel.

## V6 portfolio and visual upgrade
- The “Fikirleri deneyime dönüştürüyoruz” area now focuses on Eva360's actual project work and service delivery.
- Featured work: Furkan Petshop (Shopify/e-commerce), Breathe (perfume brand/digital store), Mutlu Global Lojistik (corporate website), and Eva360 corporate IT/system-network solutions.
- Added four vivid, high-resolution generated project visuals under `assets/project-*.webp`.
- Portfolio cards now have luminous glass styling, richer contrast, ambient blue-violet light, image zoom, hover glow and pointer-responsive 3D tilt.
- Responsive portfolio grid: two columns on desktop/tablet and one on narrow mobile.
- Project descriptions distinguish named work examples from the IT services showcase. Visuals are concept mockups, not actual screenshots or performance claims.

## Main files
- `index.html` — page structure, SEO metadata and project descriptions
- `assets/style.css` — responsive styling, 3D hover and visual effects
- `assets/main.js` — interactions, scroll reveals, mobile navigation and contact mail draft
- `assets/scene3d.js` — Three.js WebGL hero scene
- `assets/project-furkan.webp`, `project-breathe.webp`, `project-mutlu.webp`, `project-it.webp` — project artwork
- `vercel.json` — Vercel configuration

## Deployment
1. Extract this ZIP.
2. Replace the files in the root of the connected GitHub repository with these files.
3. Commit changes.
4. Vercel automatically deploys the new commit.

Framework preset: Other. No build command is required.
