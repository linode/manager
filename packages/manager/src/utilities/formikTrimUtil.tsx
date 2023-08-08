import { FormikProps } from 'formik';

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
  const trimmedValue = e.target.value.trim();

  if (formikProps.setFieldValue && formikProps.handleBlur) {
    /* Input fields of type=email are trimmed by default by some browsers;
      reset the value and change it back to rerender with updated display text. */
    if (e.target.type === 'email') {
      e.target.value = '';
      e.target.value = trimmedValue;
    }
    formikProps.setFieldValue(e.target.name, trimmedValue);
    formikProps.handleBlur(e);
  }
};
