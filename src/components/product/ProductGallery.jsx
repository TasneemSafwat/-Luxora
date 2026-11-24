import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/format';
import { SmartImage } from '../common/SmartImage';
import { IconButton } from '../ui/IconButton';

/**
 * PDP gallery: thumbnail rail + main stage with hover-to-zoom on desktop and a
 * full-screen lightbox on click.
 */
export function ProductGallery({ images = [], title = '', className }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    setActive(0);
  }, [images]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  if (!images.length) return null;

  const go = (direction) => setActive((current) => (current + direction + images.length) % images.length);

  const handleMouseMove = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoom({
      active: true,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row-reverse lg:gap-6', className)}>
      {/* Main stage */}
      <div className="relative flex-1">
        <div
          ref={stageRef}
          onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
          onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
          onMouseMove={handleMouseMove}
          className="group relative aspect-[4/5] w-full overflow-hidden bg-cream-soft dark:bg-night-card"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <SmartImage
                src={images[active]}
                alt={`${title} — view ${active + 1}`}
                prompt={`${title} luxury product photography, editorial still life, warm neutral backdrop`}
                loading="eager"
                wrapperClassName="h-full w-full"
                className={cn(
                  'transition-transform duration-200 ease-out',
                  zoom.active && 'scale-[1.9] md:scale-[1.9]',
                )}
                style={zoom.active ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="absolute inset-y-0 start-0 flex w-12 items-center justify-start ps-3 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-md dark:bg-night-card/85">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="absolute inset-y-0 end-0 flex w-12 items-center justify-end pe-3 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-md dark:bg-night-card/85">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </span>
          </button>

          <div className="absolute bottom-3.5 end-3.5 hidden md:block">
            <IconButton
              label="Open full screen"
              size="sm"
              onClick={() => setLightboxOpen(true)}
              className="bg-white/85 backdrop-blur-md hover:bg-white dark:bg-night-card/85 dark:hover:bg-night-card"
            >
              <Expand className="h-4 w-4" />
            </IconButton>
          </div>

          <span className="absolute bottom-3.5 start-3.5 bg-white/85 px-2.5 py-1 text-2xs tabular-nums text-ink backdrop-blur-md dark:bg-night-card/85 dark:text-cream">
            {active + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <ul className="flex gap-3 overflow-x-auto pb-1 lg:w-24 lg:flex-col lg:overflow-visible no-scrollbar">
        {images.map((image, index) => (
          <li key={`${image}-${index}`} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={active === index}
              className={cn(
                'relative block h-24 w-20 overflow-hidden border transition-colors duration-300 lg:h-28 lg:w-full',
                active === index ? 'border-ink dark:border-cream' : 'border-transparent hover:border-line',
              )}
            >
              <SmartImage
                src={image}
                alt=""
                prompt={`${title} thumbnail, luxury product photography`}
                wrapperClassName="h-full w-full"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} gallery`}
          >
            <motion.img
              key={active}
              src={images[active]}
              alt={`${title} — enlarged view ${active + 1}`}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[86vh] max-w-[92vw] object-contain"
              onClick={(event) => event.stopPropagation()}
            />

            <IconButton
              label="Close gallery"
              onClick={() => setLightboxOpen(false)}
              className="absolute end-5 top-5 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </IconButton>

            <button
              type="button"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              className="absolute start-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>

            <button
              type="button"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation();
                go(1);
              }}
              className="absolute end-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductGallery;
