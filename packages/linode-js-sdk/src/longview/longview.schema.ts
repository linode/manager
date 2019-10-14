import { object, string } from 'yup';

export const longviewClientCreate = object().shape({
  label: string()
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.')
    .required('Please enter a label.')
});
