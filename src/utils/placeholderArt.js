/**
 * Deterministic, dependency-free product pictures for the offline fallback catalogue.
 * Returns a small SVG data URI, so the shop looks intentional even with no network —
 * and never depends on a third-party image generator.
 */

const HUES = {
  'womens-dresses': 18,
  'womens-bags': 30,
  'womens-jewellery': 42,
  'womens-shoes': 22,
  'womens-watches': 36,
  'mens-shirts': 205,
  'mens-shoes': 26,
  'mens-watches': 38,
  fragrances: 340,
};

const hash = (text) => [...String(text)].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 7);

/** variant 0 = full view, 1 = detail, 2 = editorial, 3 = surface */
export function productArt(title, category, variant = 0) {
  const hue = (HUES[category] ?? 32) + (hash(title) % 14) - 7;
  const light = `hsl(${hue} 24% ${80 - variant * 3}%)`;
  const dark = `hsl(${hue} 20% ${58 - variant * 4}%)`;
  const deep = `hsl(${hue} 26% 36%)`;

  const shapes = [
    `<path d='M150 170V280A150 150 0 0 1 450 280V740H150Z' fill='#fff' fill-opacity='.38'/><circle cx='300' cy='330' r='110' fill='none' stroke='#fff' stroke-opacity='.4'/>`,
    `<circle cx='300' cy='400' r='230' fill='#fff' fill-opacity='.22'/><circle cx='300' cy='400' r='140' fill='none' stroke='#fff' stroke-opacity='.5'/><circle cx='300' cy='400' r='60' fill='${deep}' fill-opacity='.35'/>`,
    `<path d='M0 560L600 300V800H0Z' fill='${deep}' fill-opacity='.28'/><path d='M120 220H480V700H120Z' fill='#fff' fill-opacity='.3'/>`,
    `<rect x='0' y='560' width='600' height='240' fill='${deep}' fill-opacity='.3'/><path d='M200 560V380A100 100 0 0 1 400 380V560Z' fill='#fff' fill-opacity='.4'/>`,
  ];

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${light}'/><stop offset='1' stop-color='${dark}'/></linearGradient></defs>` +
    `<rect width='600' height='800' fill='url(#g)'/>${shapes[variant % 4]}</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
