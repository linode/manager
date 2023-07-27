import { FormikProps } from 'formik';

export const handleTrimAndBlur = <T extends {}>(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  formikProps: FormikProps<T>
) => {
  // Trim the leading and trailing whitespace from this field.
  const trimmedValue = e.target.value.trim();
  formikProps.setFieldValue(e.target.name, trimmedValue);
  formikProps.handleBlur(e);
};
