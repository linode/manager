import { APIError } from '@linode/api-v4/lib/types';

interface Intercept {
  condition: (e: APIError) => boolean;
  effect: () => void;
}

export const interceptErrors = (
  errors: APIError[],
  interceptors: Intercept[]
) =>
  errors.forEach((error) =>
    interceptors
      .filter(({ condition }) => condition(error))
      .forEach(({ effect: callback }) => callback())
  );
