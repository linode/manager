const windowIsNarrowerThan = (breakpoint: number): boolean => {
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
};

export default windowIsNarrowerThan;
