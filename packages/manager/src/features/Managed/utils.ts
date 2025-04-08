import { handleFieldErrors } from 'src/utilities/formikErrorUtils';
import { handleGeneralErrors } from 'src/utilities/formikErrorUtils';

import type { APIError } from '@linode/api-v4';
import type { FormikErrors } from 'formik';

interface HandleManagedErrorsProps<T> {
  apiError: APIError[];
  defaultMessage: string;
  setErrors: (errors: FormikErrors<T>) => void;
  setStatus: (status: unknown) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const handleManagedErrors = <T>({
  apiError,
  defaultMessage,
  setErrors,
  setStatus,
  setSubmitting,
}: HandleManagedErrorsProps<T>) => {
  const mapErrorToStatus = (generalError: string) =>
    setStatus({ generalError });

  handleFieldErrors(setErrors, apiError);
  handleGeneralErrors(mapErrorToStatus, apiError, defaultMessage);
  setSubmitting(false);
};
