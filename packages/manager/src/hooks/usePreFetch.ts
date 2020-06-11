import * as React from 'react';

export const PREFETCH_DELAY = 150;

/**
 * usePrefetch() allows consumers to make a one-time, delayed, and cancellable request. It accepts
 * a request function, which will be executed according to the following lifecycle:
 *
 * 1. Consumer calls makeRequest()
 * 2. usePrefetch sets a timeout for the specified delay duration
 * 3. Once the timeout is complete, usePrefetch evaluates the specified condition
 * 4. If true, usePrefetch executes the given request function.
 *
 * Example usage:
 *
 * const { makeRequest, cancelRequest } = usePrefetch(requestDomains, !domainsLoading);
 * <div onmouseenter={makeRequest} onfocus={makeRequest} onmouseleave={cancelRequest}>Domains</div>
 */

export const usePrefetch = (
  requestFn?: () => void,
  prefetchCondition = true,
  delay = PREFETCH_DELAY
) => {
  const timeoutID = React.useRef<number | null>(null);

  // We must store this in a ref so the handler inside setTimeout can "see" the current value.
  const prefetchConditionRef = React.useRef<boolean>(prefetchCondition);

  // Update the ref when the values change.
  React.useEffect(() => {
    prefetchConditionRef.current = prefetchCondition;
  }, [prefetchCondition]);

  const makeRequest = () => {
    timeoutID.current = window.setTimeout(() => {
      if (prefetchConditionRef.current && requestFn) {
        requestFn();
      }
    }, delay);
  };

  const cancelRequest = React.useCallback(() => {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
  }, []);

  const handlers = {
    onMouseEnter: makeRequest,
    onFocus: makeRequest,
    onMouseLeave: cancelRequest,
    onBlur: cancelRequest
  };

  return { makeRequest, cancelRequest, handlers };
};

export default usePrefetch;
