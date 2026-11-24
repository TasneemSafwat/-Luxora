import { useId, useState } from 'react';
import { cn } from '../../utils/format';

/*
 * Self-contained editorial artwork for banners.
 *
 * Why this exists: the hero, collection tiles, atelier banner and sign-in panels used to
 * request AI-generated pictures from a third-party endpoint at runtime. That meant a
 * different picture on every visit, slow first paint, and a blank brown box whenever the
 * service was blocked or down. These scenes are plain SVG: instant, deterministic, crisp
 * at any size, themed with the brand palette — and a real photograph can still be layered
 * on top through the `src` prop (it fades in once loaded and silently falls back to the art
 * if it fails).
 */

/** Gradient ids must be unique per instance and safe inside url(#…). */
function useSvgId(prefix) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (name) => `${prefix}-${name}-${raw}`;
}

/** An architectural arch path: flat base, semicircular top. */
const arch = (x, y, w, h) => {
  const r = w / 2;
  return `M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z`;
};

/* ————————————————————————————————— Scenes ————————————————————————————————— */

function HeroScene({ id }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a8d7c" />
          <stop offset="0.55" stopColor="#6d6254" />
          <stop offset="1" stopColor="#241f1b" />
        </linearGradient>
        <radialGradient id={id('sun')} cx="0.72" cy="0.28" r="0.55">
          <stop offset="0" stopColor="#f4e6cb" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#e3cfa8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e3cfa8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('window')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ead3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#c9ad80" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id('beam')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6ead3" stopOpacity="0.38" />
          <stop offset="1" stopColor="#f6ead3" stopOpacity="0" />
        </linearGradient>
        <filter id={id('soft')} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a322a" />
          <stop offset="1" stopColor="#14110f" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill={`url(#${id('wall')})`} />
      <rect width="1600" height="900" fill={`url(#${id('sun')})`} />

      {/* Three arched windows receding into the wall */}
      <g filter={`url(#${id('soft')})`} opacity="0.8">
        <path d={arch(930, 120, 170, 520)} fill="#2a241e" opacity="0.55" />
        <path d={arch(940, 132, 150, 508)} fill={`url(#${id('window')})`} />
        <path d={arch(1150, 90, 210, 560)} fill="#2a241e" opacity="0.55" />
        <path d={arch(1162, 104, 186, 546)} fill={`url(#${id('window')})`} />
        <path d={arch(1410, 140, 150, 500)} fill="#2a241e" opacity="0.55" />
        <path d={arch(1420, 152, 130, 488)} fill={`url(#${id('window')})`} opacity="0.9" />
      </g>

      {/* Mullions */}
      <g stroke="#2a241e" strokeOpacity="0.5" strokeWidth="3">
        <path d="M1015 270V640M1255 250V650M1485 290V640" />
      </g>

      {/* Light falling across the floor */}
      <g>
        <polygon points="940,640 1090,640 760,900 420,900" fill={`url(#${id('beam')})`} />
        <polygon points="1162,650 1348,650 1130,900 700,900" fill={`url(#${id('beam')})`} opacity="0.8" />
        <polygon points="1420,640 1550,640 1560,900 1180,900" fill={`url(#${id('beam')})`} opacity="0.6" />
      </g>

      <rect y="640" width="1600" height="260" fill={`url(#${id('floor')})`} opacity="0.55" />
      <path d="M0 640H1600" stroke="#f6ead3" strokeOpacity="0.12" />

      {/* Fine gold architectural lines */}
      <g fill="none" stroke="#b89b72" strokeOpacity="0.28" strokeWidth="1">
        <path d="M0 200Q800 120 1600 200" />
        <path d="M0 240Q800 160 1600 240" />
        <circle cx="1150" cy="330" r="360" />
        <circle cx="1150" cy="330" r="470" strokeOpacity="0.14" />
      </g>
    </svg>
  );
}

function AtelierScene({ id }) {
  return (
    <svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9e0d1" />
          <stop offset="1" stopColor="#c9baa0" />
        </linearGradient>
        <linearGradient id={id('f1')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8c8ab" />
          <stop offset="1" stopColor="#a58c68" />
        </linearGradient>
        <linearGradient id={id('f2')} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6d6" />
          <stop offset="1" stopColor="#bba988" />
        </linearGradient>
        <linearGradient id={id('f3')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c6a50" />
          <stop offset="1" stopColor="#4a3e2e" />
        </linearGradient>
        <linearGradient id={id('shade')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171717" stopOpacity="0" />
          <stop offset="1" stopColor="#171717" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <rect width="900" height="900" fill={`url(#${id('bg')})`} />

      {/* Draped fabric — three overlapping folds */}
      <path d="M-40 560C140 470 260 640 430 560S720 430 940 520V940H-40Z" fill={`url(#${id('f3')})`} />
      <path d="M-40 470C130 380 300 560 470 470S760 340 940 430V760C760 690 620 790 450 730S130 690 -40 770Z" fill={`url(#${id('f1')})`} />
      <path d="M-40 330C150 250 300 410 470 330S740 220 940 300V520C760 450 640 560 450 500S150 450 -40 520Z" fill={`url(#${id('f2')})`} />
      <rect width="900" height="900" fill={`url(#${id('shade')})`} />

      {/* Fold highlights */}
      <g fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="2">
        <path d="M-40 360C150 280 300 440 470 360S740 250 940 330" />
        <path d="M-40 500C130 410 300 590 470 500S760 370 940 460" />
      </g>

      {/* Gold thread */}
      <path d="M60 120C260 40 420 220 640 150S840 60 880 100" fill="none" stroke="#b89b72" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />

      {/* Measuring tape */}
      <g transform="translate(0 806)">
        <rect width="900" height="46" fill="#f2e8d3" />
        <rect y="40" width="900" height="6" fill="#171717" opacity="0.08" />
        {Array.from({ length: 45 }, (_, i) => (
          <path key={i} d={`M${i * 20 + 10} 0V${i % 5 === 0 ? 24 : 13}`} stroke="#171717" strokeOpacity="0.7" strokeWidth="1.2" />
        ))}
      </g>
    </svg>
  );
}

function PortraitScene({ id }) {
  return (
    <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e8170" />
          <stop offset="0.6" stopColor="#4d443a" />
          <stop offset="1" stopColor="#17140f" />
        </linearGradient>
        <linearGradient id={id('door')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e5c8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#b89b72" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.38" r="0.6">
          <stop offset="0" stopColor="#f3e5c8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f3e5c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="1000" fill={`url(#${id('bg')})`} />
      <rect width="800" height="1000" fill={`url(#${id('glow')})`} />

      {/* Nested arches, pushed to the trailing side so overlaid copy (logo, headline) stays on clean ground */}
      <g transform="translate(230 40)">
        <path d={arch(150, 150, 500, 850)} fill="none" stroke="#b89b72" strokeOpacity="0.25" />
        <path d={arch(205, 205, 390, 795)} fill="none" stroke="#b89b72" strokeOpacity="0.4" />
        <path d={arch(260, 260, 280, 740)} fill={`url(#${id('door')})`} />
      </g>
      <path d="M0 880H800" stroke="#f3e5c8" strokeOpacity="0.12" />
    </svg>
  );
}

/** Soft tinted arch used as a stand-in tile / product picture. */
function TileScene({ id, hue = 32 }) {
  const a = `hsl(${hue} 22% 78%)`;
  const b = `hsl(${hue} 18% 56%)`;
  const c = `hsl(${hue} 25% 38%)`;
  return (
    <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={id('arch')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="1" stopColor={c} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill={`url(#${id('bg')})`} />
      <path d={arch(150, 150, 300, 650)} fill={`url(#${id('arch')})`} />
      <circle cx="300" cy="330" r="150" fill="none" stroke="#fff" strokeOpacity="0.35" />
    </svg>
  );
}

const SCENES = { hero: HeroScene, atelier: AtelierScene, portrait: PortraitScene, tile: TileScene };

/**
 * <BannerArt variant="hero" /> fills its (positioned) parent.
 *
 * `src` is a photograph — or an ordered list of candidates (own file first, generated image next…).
 * Each is tried in turn and fades in over the artwork once loaded. The artwork is only the
 * last-resort fallback, so the banner is never an empty box while a picture loads or if every source fails.
 */
export function BannerArt({ variant = 'hero', src, alt = '', hue, className, imgClassName, priority = false }) {
  const makeId = useSvgId('ba');
  const Scene = SCENES[variant] ?? HeroScene;
  const sources = [].concat(src ?? []).filter(Boolean);
  const key = sources.join('|');

  const [state, setState] = useState({ key, index: 0, status: 'idle' }); // idle | loaded | error
  if (state.key !== key) setState({ key, index: 0, status: 'idle' });

  const current = sources[state.index];

  const handleError = () =>
    setState((previous) =>
      previous.index + 1 < sources.length
        ? { ...previous, index: previous.index + 1, status: 'idle' }
        : { ...previous, status: 'error' },
    );

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <Scene id={makeId} hue={hue} />
      {current && state.status !== 'error' && (
        <img
          key={current}
          src={current}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setState((previous) => ({ ...previous, status: 'loaded' }))}
          onError={handleError}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            state.status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

export default BannerArt;
