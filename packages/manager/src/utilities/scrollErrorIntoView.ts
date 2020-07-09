const scrollErrorIntoView = (
  errorGroup?: string,
  options?: ScrollIntoViewOptions
) => {
  const errorScrollClassSelector = errorGroup
    ? `.error-for-scroll-${errorGroup}`
    : `.error-for-scroll`;
  const element = document.querySelectorAll(errorScrollClassSelector)[0];
  if (element) {
    element.scrollIntoView({
      behavior: options?.behavior ?? 'smooth',
      block: options?.block ?? 'start',
      inline: options?.inline ?? 'nearest'
    });
  }
};

export default scrollErrorIntoView;
