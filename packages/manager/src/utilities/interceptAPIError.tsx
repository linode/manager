import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';

import { Typography } from 'src/components/Typography';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';
interface Intercept {
  /** optional callback to fire when error is matched correctly */
  callback?: () => void;
  condition: (e: APIError) => boolean;
  replacementText: JSX.Element;
}

export const interceptErrors = (
  errors: APIError[],
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
      formattedReason: matchedInterceptors.length ? (
        matchedInterceptors[0].replacementText
      ) : (
        <Typography>{error.reason}</Typography>
      ),
    };
  });
