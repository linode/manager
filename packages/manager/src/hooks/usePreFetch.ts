import * as React from 'react';

/**
 * usePreFetch() accepts an array of dependencies and fetches them from the API if they are not
 * already in the Redux Store.
 *
 * It's similar to useReduxLoad(), but it only fetches data if it hasn't been requested at all yet.
 * In other words, there's no refresh interval. It's meant to give a "head start", if for example
 * the user hovers over the "Domains" link, we want to request the data in the background because
 * they may end up clicking it. But if we already have some domains data, we don't re-fetch, since
 * that would trigger loading states, etc. We leave the ultimate authority to the consumers of the
 * data to decide when the data should be refreshed.
 *
 * Example usage:
 * const preFetch = usePreFetch();
 *
 * <div onmouseenter={() => preFetch(['linodes', 'images'])}>Linodes</div>
 */

export const usePreFetch = (
  requestFn: () => void,
  clearanceToMakeRequest: boolean,
  delay = PREFETCH_DELAY
) => {
  const timeoutID = React.useRef<number | null>(null);

  // We keep track of this so that the consumer can use `prefetch` on both onmouseenter and onfocus.
  // Otherwise, `prefetch` would be called twice, since onfocus is fired on click as well.
  const [hasQueuedForPreFetch, setHasQueuedForPreFetch] = React.useState<
    boolean
  >(false);

  // We must store this in a ref so the handler inside setTimeout can "see" the current value.
  const clearanceToMakeRequestRef = React.useRef<boolean>(
    clearanceToMakeRequest
  );

  // Update the ref when the values change.
  React.useEffect(() => {
    clearanceToMakeRequestRef.current = clearanceToMakeRequest;
  }, [clearanceToMakeRequest]);

  const prefetch = () => {
    timeoutID.current = window.setTimeout(() => {
      if (!hasQueuedForPreFetch && clearanceToMakeRequestRef.current) {
        setHasQueuedForPreFetch(true);
        requestFn();
      }
    }, delay);

    // More entity types will go here.
  };

  const clearTimeoutID = React.useCallback(() => {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
  }, []);

  return { prefetch, clearTimeoutID };
};

// Useful for consumers that may want to delay the prefetch request.
export const PREFETCH_DELAY = 2000;

export default usePreFetch;
