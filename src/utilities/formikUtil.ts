import { FormikBag, FormikErrors, FormikProps } from 'formik';
import { path, reduce,} from 'ramda';

import { Item } from 'src/components/EnhancedSelect/Select';

export interface GeneralAPIError {
  none: string;
}

export const defaultOptions = {
  enableReinitialize: false,
  validateOnBlur: true,
  validateOnChange: false
};

// Only validate the form onChange if the field has already been touched
export const handleTextFieldChange = <T extends {}>(e: any, props: FormikProps<T>) => {
  console.log('props: ' + JSON.stringify(props, null, 2));
  const { name, value } = e.target;

  props.setFieldValue(name, value);

  if (props.touched[name]) {
    console.log('name: ' + name);
    console.log('value: ' + value);
    props.validateField(name);
    // props.validateForm({ ...(props.values as {}), [name]: value });
  }
}

export const handleSelectFieldChange = <T extends {}>(item: Item, name: string, props: FormikProps<T>) => {

  props.setFieldValue(name, item);

  if (props.touched[name]) {
    props.validateField(name);
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

export const maybeGetErrorText = (fieldName: string, touched: any, errors: any) => {
  return touched[fieldName] && errors[fieldName]
    ? errors[fieldName]
    : undefined;
}