import { FormikProps } from 'formik';

export const handleTrimAndBlur = <T extends {}>(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  formikProps: Partial<FormikProps<T>>
) => {
  // Trim the leading and trailing whitespace from this field.
  const trimmedValue = e.target.value.trim();

  if (formikProps.setFieldValue && formikProps.handleBlur) {
    formikProps.setFieldValue(e.target.name, trimmedValue);
    formikProps.handleBlur(e);
  }
};
