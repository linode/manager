/** This nice little hook courtesy of: https://stackoverflow.com/a/36862446 */
import { useEffect, useState } from 'react';

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

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
