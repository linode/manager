import * as React from 'react';

import { FormattedAPIError } from 'src/types/FormattedAPIError';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

export const useErrors = (): [
  FormattedAPIError[],
  React.Dispatch<React.SetStateAction<FormattedAPIError[]>>,
  () => void
] => {
  const [errors, setErrors] = React.useState<FormattedAPIError[]>([]);

  // If there are errors, scroll them into view
  React.useEffect(() => {
    if (errors) {
      scrollErrorIntoView();
    }
  }, [errors]);

  const resetErrors = () => setErrors([]);

  return [errors, setErrors, resetErrors];
};
