# Eva360 Dijital — V4

Premium, responsive static website for Vercel.

## Included
- `index.html` — page structure and SEO metadata
- `assets/style.css` — responsive dark visual system and motion design
- `assets/main.js` — scroll reveals, interactions, FAQ and contact mail draft
- `assets/scene3d.js` — real-time Three.js hero scene (loaded from jsDelivr CDN)
- `assets/glass-orb.jpg` — visual fallback / ambient artwork
- `vercel.json` — Vercel routing and security headers

## 3D scene
The hero visual uses Three.js 0.180.0 with a custom animated shader, reflective liquid-like knot geometry, orbit rings, lighting and pointer/scroll response. If the CDN or WebGL is unavailable, the existing CSS and image layers remain as a visual fallback. The 3D scene is not an embedded Spline project; it is a custom Three.js scene.

## Contact form
The contact form opens the visitor's default email application with a prefilled message to `merhaba@eve360dijital.com`. It does not store or transmit form data to a server.

## Deploy to Vercel
1. Upload the contents of this folder to the root of your GitHub repository (not the containing folder).
2. In Vercel, import or open the connected repository.
3. Set Framework Preset to **Other** and leave the build command empty.
4. Deploy. Vercel redeploys automatically after each GitHub commit.

## Notes
- Update the email address in `index.html` and `assets/main.js` if the contact address changes.
- Team counts and department labels reflect the information supplied by Eva360.
- Portfolio visuals are concept illustrations, not representations of named client projects.
