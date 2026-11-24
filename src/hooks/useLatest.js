import { useEffect, useRef } from 'react';

/**
 * Keeps a ref pointing at the latest value. Lets long-lived listeners call the
 * newest callback without re-subscribing every render when callers pass inline
 * arrow functions (the common case for onClose / onOutsideClick handlers).
 */
export function useLatest(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export default useLatest;
