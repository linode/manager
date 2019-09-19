/** This nice little hook courtesy of: https://stackoverflow.com/a/36862446 */
import { useEffect, useState } from 'react';
import { throttle } from 'throttle-debounce';

/**
 * Give a component easy access to window height and width.
 * const { height, width } = useWindowDimensions();
 */
const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

export const useWindowDimensions = (
  shouldThrottle = true,
  throttleInMs = 300
) => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    const handleDimensions = () => setWindowDimensions(getWindowDimensions());

    const handleResize = shouldThrottle
      ? throttle(throttleInMs, handleDimensions)
      : handleDimensions;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
