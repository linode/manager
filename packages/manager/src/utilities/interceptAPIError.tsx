import type { FormattedAPIError } from 'src/types/FormattedAPIError';
interface Intercept {
  /** optional callback to fire when error is matched correctly */
  callback?: () => void;
  condition: (e: FormattedAPIError) => boolean;
  replacementText: JSX.Element;
}

export const interceptErrors = (
  errors: FormattedAPIError[],
  interceptors: Intercept[]
): FormattedAPIError[] =>
  errors.map((error) => {
    const matchedInterceptors = interceptors.filter((interceptor) =>
      interceptor.condition(error)
    );
    matchedInterceptors.forEach(({ callback }) => {
      if (callback) {
        callback();
      }
    });
    return {
      ...error,
      formattedReason: matchedInterceptors.length
        ? matchedInterceptors[0].replacementText
        : error.reason,
    };
  });
