import { object, string } from 'yup';

export const createObjectStorageKeysSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 50 characters.')
    .max(50, 'Label must be between 3 and 50 characters.')
    .trim()
});
