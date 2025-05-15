import type { FormikProps } from 'formik';

/**
 * handleFormikBlur
 *
 * Blur event handler for Formik fields. Default behavior is to trim leading and trailing whitespace.
 *
 * @param e {event} The focus event
 * @param formikProps {partial FormikProps} Formik functions to set field value and handle blur event
 */
export const handleFormikBlur = <T extends {}>(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  formikProps: Partial<FormikProps<T>>
) => {
  if (formikProps.setFieldValue && formikProps.handleBlur) {
    const trimmedValue = e.target.value.trim();
    e.target.value = trimmedValue;
    formikProps.setFieldValue(e.target.name, trimmedValue);
    formikProps.handleBlur(e);
  }
};
