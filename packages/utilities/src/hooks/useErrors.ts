import * as React from 'react';

import { scrollErrorIntoView } from '../helpers/scrollErrorIntoView';

import type { APIError } from '@linode/api-v4/lib/types';

export const useErrors = (): [
  APIError[],
  React.Dispatch<React.SetStateAction<APIError[]>>,
  () => void,
] => {
  const [errors, setErrors] = React.useState<APIError[]>([]);

  // If there are errors, scroll them into view
  React.useEffect(() => {
    if (errors) {
      scrollErrorIntoView();
    }
  }, [errors]);

  const resetErrors = () => setErrors([]);

  return [errors, setErrors, resetErrors];
};
