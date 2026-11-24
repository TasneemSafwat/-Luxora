import { useCallback, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../utils/format';

/**
 * Image with an intrinsic skeleton and a graceful failure state.
 * (`prompt` / `size` are accepted and ignored so existing call sites keep working;
 * the old runtime dependency on a third-party image generator was removed — a
 * shop should never depend on an unrelated service to paint its product grid.)
 */
// eslint-disable-next-line no-unused-vars
export function SmartImage({ src, alt = '', className, wrapperClassName, prompt, size, loading = 'lazy', ...props }) {
  const [state, setState] = useState({ src, status: src ? 'loading' : 'error' });

  // Reset when the source changes — derived during render instead of in an effect,
  // so there is no frame showing the previous image's state.
  if (state.src !== src) setState({ src, status: src ? 'loading' : 'error' });

  // A cached image can finish loading before React attaches onLoad.
  const imgRef = useCallback((node) => {
    if (node && node.complete) {
      setState((current) =>
        current.status === 'loading' ? { ...current, status: node.naturalWidth > 0 ? 'loaded' : 'error' } : current,
      );
    }
  }, []);

  const { status } = state;

  // `cn` just joins class names (no tailwind-merge), so "relative" + a caller's "absolute" would both
  // be emitted and the later rule in the stylesheet (relative) silently wins. That stacked the hover
  // image *below* the main one and made every product card roughly twice as tall. Only add our
  // default positioning when the caller didn't choose one.
  const hasPosition = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(wrapperClassName ?? '');

  return (
    <span className={cn(!hasPosition && 'relative', 'block overflow-hidden bg-cream-soft dark:bg-night-card', wrapperClassName)}>
      {status === 'loading' && <span className="skeleton absolute inset-0 block" aria-hidden="true" />}

      {status !== 'error' && src ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState((current) => ({ ...current, status: 'loaded' }))}
          onError={() => setState((current) => ({ ...current, status: 'error' }))}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...props}
        />
      ) : (
        <span role="img" aria-label={alt || undefined} className="flex h-full w-full items-center justify-center text-muted">
          <ImageOff className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

export default SmartImage;
