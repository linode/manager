import { APIError } from '@linode/api-v4/lib/types';

interface Intercept {
  /** optional callback to fire when error is matched correctly */
  callback?: () => void;
  condition: (e: APIError) => boolean;
  replacementText: JSX.Element | string;
}

export const interceptErrors = (
  errors: APIError[],
  interceptors: Intercept[]
) => {
  return errors.map((thisError) => {
    return interceptors.reduce((acc, eachInterceptor) => {
      if (eachInterceptor.condition(thisError)) {
        acc = {
          reason: eachInterceptor.replacementText as string,
        };
        if (eachInterceptor.callback) {
          eachInterceptor.callback();
        }
      }
      return acc;
    }, thisError);
  });
};
