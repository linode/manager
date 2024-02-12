import { useState } from 'react';

/**
 * useFormValidateOnChange
 *
 * @description A hook that returns whether or not the form has been submitted at least once.
 * @returns { hasFormBeenSubmitted: boolean, setHasFormBeenSubmitted: (value: boolean) => void }
 */
export const useFormValidateOnChange = () => {
  const [hasFormBeenSubmitted, _setHasFormBeenSubmitted] = useState<boolean>(
    false
  );

  const setHasFormBeenSubmitted = (value: boolean) => {
    _setHasFormBeenSubmitted(value);
  };

  return { hasFormBeenSubmitted, setHasFormBeenSubmitted };
};
