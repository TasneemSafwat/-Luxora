/**
 * Banner photography.
 *
 * Every banner tries its sources in order and uses the first one that loads:
 *   1. env override         VITE_HERO_IMAGE=https://…           (your own campaign photo / CDN)
 *   2. your own file         /images/hero-custom.jpg             (drop it into public/images — wins over everything below)
 *   3. real fashion photos   Unsplash / Pexels (free licences, hot-linking is allowed)
 *   4. bundled artwork       /images/hero.jpg                    (ships with the app, so a banner is never empty)
 * The built-in SVG scene is shown underneath while a photo is loading.
 *
 * Photo credits (Unsplash License / Pexels License — free for commercial use, attribution not required):
 *   hero   – Yichen Wang        unsplash.com/photos/G94UKfrKRPA   (moody studio editorial)
 *            Vadim Yefremov     unsplash.com/photos/eWwYAgaF24I   (fashion editorial, fallback)
 *   auth   – John Marfe Bitoon  unsplash.com/photos/yCDTlmEBFg8   (satin gloves, pearl necklace)
 *   atelier– Pexels photos 4620613 / 4620630 (tailor fitting a garment in a fashion atelier)
 */

const sources = (...list) => list.filter(Boolean);

const unsplash = (id, params) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&fm=jpg&${params}`;
const pexels = (id, width) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const HERO_PHOTOS = sources(
  import.meta.env.VITE_HERO_IMAGE,
  '/images/hero-custom.jpg',
  unsplash('1760400265609-5be03fd161ea', 'w=2400'),
  unsplash('1768818565983-29d3f4d76869', 'w=2400'),
  '/images/hero.jpg',
);

export const ATELIER_PHOTOS = sources(
  import.meta.env.VITE_ATELIER_IMAGE,
  '/images/atelier-custom.jpg',
  pexels(4620613, 1600),
  pexels(4620630, 1600),
  '/images/atelier.jpg',
);

export const AUTH_PHOTOS = sources(
  import.meta.env.VITE_AUTH_IMAGE,
  '/images/auth-custom.jpg',
  unsplash('1760969485983-c7b370a1532f', 'w=1200&h=1800&crop=faces,entropy'),
  '/images/auth.jpg',
);
