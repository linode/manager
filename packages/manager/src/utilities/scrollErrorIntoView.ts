/**
 * @deprecated
 * Use `scrollErrorIntoViewV2` instead.
 */
export const scrollErrorIntoView = (
  errorGroup?: string,
  options?: ScrollIntoViewOptions
) => {
  const errorScrollClassSelector = errorGroup
    ? `.error-for-scroll-${errorGroup}`
    : `.error-for-scroll`;
  const element = document.querySelectorAll(errorScrollClassSelector)[0];
  if (element) {
    element.scrollIntoView({
      behavior: options?.behavior ?? 'auto',
      block: options?.block ?? 'center',
      inline: options?.inline ?? 'nearest',
    });
  }
};
