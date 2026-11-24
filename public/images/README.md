# Banner photography

The banners show real fashion photography (Unsplash / Pexels, free licences) and fall back to the
bundled images in this folder if those cannot be loaded. See `src/utils/bannerPhotos.js` for the
exact order and the photo credits.

## Use your own photos
Drop a file here with one of these names — it wins over everything else, no code changes needed:

| File                  | Where it shows                       | Recommended size | Look for |
|-----------------------|--------------------------------------|------------------|----------|
| `hero-custom.jpg`     | Home hero (full-bleed, text on left) | 2400 × 1200      | model in a gown / tailoring, subject on the RIGHT third, calm dark area on the left |
| `atelier-custom.jpg`  | "Made to measure" banner             | 1600 × 1400      | tailor's hands, fabric, measuring tape, atelier still life |
| `auth-custom.jpg`     | Sign-in / register side panel        | 1200 × 1800      | tall portrait, dark and quiet |

JPEG, under ~300 KB. `hero.jpg`, `atelier.jpg`, `auth.jpg` are the bundled last-resort fallbacks — leave them in place.
