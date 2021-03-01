import { useEffect, useRef } from 'react';
import usePageVisibility from 'src/hooks/usePageVisibility';

export const usePolling = (
  requests: Function[],
  requestInterval: number = 10000
) => {
  const isVisible = usePageVisibility();
  const interval = useRef(0);
  const requestArray = useRef(requests);

  useEffect(() => {
    const _request = () => {
      requestArray.current.forEach((thisRequest) => thisRequest());
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
