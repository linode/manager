import { useEffect, useState } from 'react';

export const useIsMobileDevice = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );
    };

    checkMobile();
    // eslint-disable-next-line scanjs-rules/call_addEventListener
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobileDevice };
};
