import { equals } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import usePageVisibility from 'src/hooks/usePageVisibility';
import usePrevious from 'src/hooks/usePrevious';

export const usePolling = (
  requests: Function[],
  requestInterval: number = 10000
) => {
  const isVisible = usePageVisibility();
  const interval = useRef(0);
  const prevRequests = usePrevious(requests);
  const [requestArray, setRequestArray] = useState(requests);

  /**
   * In order to avoid re-setting the interval on every render,
   * we keep a list of requests in local state and only update it
   * when the functions change. We could also not add requests to the
   * useEffect dependency array below, but that's bug-prone and strongly
   * recommended against by the docs.
   */
  useEffect(() => {
    if (equals(prevRequests, requests)) {
      setRequestArray(requests);
    }
  }, [requests, prevRequests]);

  useEffect(() => {
    const _request = () => {
      requestArray.forEach(thisRequest => thisRequest());
    };
    if (!isVisible) {
      // Page is not visible; clear any open intervals and don't make requests.
      window.clearInterval(interval.current);
      return;
    }
    // Page is visible; set a polling interval.
    interval.current = window.setInterval(_request, requestInterval);

    return () => {
      window.clearInterval(interval.current);
    };
  }, [isVisible, requestArray, requestInterval]);
};

export default usePolling;
