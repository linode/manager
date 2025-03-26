import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

export const useErrors = (): [
  APIError[],
  React.Dispatch<React.SetStateAction<APIError[]>>,
  () => void
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
