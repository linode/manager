import * as React from 'react';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

export const useErrors = (): [
  Linode.ApiFieldError[],
  React.Dispatch<React.SetStateAction<Linode.ApiFieldError[]>>,
  () => void
] => {
  const [errors, setErrors] = React.useState<Linode.ApiFieldError[]>([]);

  // If there are errors, scroll them into view
  React.useEffect(() => {
    if (errors) {
      scrollErrorIntoView();
    }
  }, [errors]);

  const resetErrors = () => setErrors([]);

  return [errors, setErrors, resetErrors];
};
