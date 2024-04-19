import { APIError } from '@linode/api-v4';
import React from 'react';

import { Typography } from './Typography';

export interface RenderErrorProps {
  error: APIError;
  matchers: ErrorMatcher[];
}

export const RenderError = ({ error, matchers }: RenderErrorProps) => {
  const firstMatch = matchers.find((matcher) => matcher.condition(error));
  return firstMatch !== undefined ? (
    typeof firstMatch.element == 'function' ? (
      firstMatch.element(error)
    ) : (
      firstMatch.element
    )
  ) : (
    <Typography>{error.reason}</Typography>
  );
};

export interface ErrorMatcher {
  condition: (e: APIError) => boolean;
  element: ((e: APIError) => JSX.Element) | JSX.Element;
}
