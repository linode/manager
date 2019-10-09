import { object, string } from 'yup';

export const longviewClientCreate = object().shape({
  label: string()
    .min(3)
    .max(32)
    .required('Please enter a label.')
});
