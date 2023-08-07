import { FormikProps } from 'formik';

export const handleFormikBlur = <T extends {}>(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  formikProps: Partial<FormikProps<T>>
) => {
  // Trim the leading and trailing whitespace from this field.
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
