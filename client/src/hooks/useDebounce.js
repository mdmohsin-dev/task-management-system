import { useEffect, useState } from 'react';

/**
 * Debounces a fast-changing value (e.g. search input) so we don't fire an
 * API request on every keystroke.
 */
export function useDebounce(value, delayMs = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
