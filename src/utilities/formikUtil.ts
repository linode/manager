import { FormikBag, FormikErrors, FormikProps } from 'formik';
import { path, reduce,} from 'ramda';

export interface GeneralAPIError {
  none: string;
}

export const defaultOptions = {
  enableReinitialize: false,
  validateOnBlur: true,
  validateOnChange: false
};

// Only validate the form onChange if the field has already been touched
export const handleFormChange = <T extends {}>(e: any, props: FormikProps<T>) => {

  const { name, value } = e.target;

  props.setFieldValue(name, value);

  if (props.touched[name]) {
    props.validateForm({ ...(props.values as {}), [name]: value });
  }
}

// Makes a request and handles the appropriate success and failure actions. On success, returns response object
export const handleFormSubmission = <T, P>(request: any, successMessage: string, formikBag: FormikBag<T, P>): any => {
  return new Promise((resolve, reject) => {
    formikBag.setStatus(undefined);
    request()
      .then((response: any) => {
        formikBag.setSubmitting(false);
        formikBag.setStatus({ success: true, message: successMessage });
        resolve(response.data);
      })
      .catch((error: any) => {
        formikBag.setSubmitting(false);
        formikBag.setStatus(undefined);

        if (path(['response', 'data', 'errors'], error)) {
          const formErrors = createFormErrors<P>(error.response.data.errors);
          formikBag.setErrors(formErrors);
        } else {
          formikBag.setStatus({ success: false, message: 'An error occurred'});
        }
        reject(error);
      });
  });
}

// Transforms API errors to a format that Formik understands
export const createFormErrors = <T>(errors: any): FormikErrors<T & GeneralAPIError> => {
  return reduce((formErrors: any, apiError: Linode.ApiFieldError) => {
    const key = apiError.field || 'none';
    return { ...formErrors, [key]: apiError.reason }
  }, {}, errors);
}
