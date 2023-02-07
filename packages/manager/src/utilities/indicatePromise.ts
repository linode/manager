export const indicatePromise = <T>(
  promise: Promise<T>,
  setIndicator: (indicate: boolean) => any
) => {
  setIndicator(true);
  return promise.finally(() => {
    setIndicator(false);
  });
};
