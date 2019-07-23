const scrollErrorIntoView = (errorGroup?: string) => {
  const errorScrollClassSelector = errorGroup
    ? `.error-for-scroll-${errorGroup}`
    : `.error-for-scroll`;
  const element = document.querySelectorAll(errorScrollClassSelector)[0];
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
};

export default scrollErrorIntoView;
