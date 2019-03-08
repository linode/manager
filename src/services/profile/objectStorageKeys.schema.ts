import { object, string } from 'yup';

export const createObjectStorageKeysSchema = object({
  label: string()
    .min(1, 'Label must be between 3 and 50 characters.')
    .max(50, 'Label must be between 3 and 50 characters.')
    .trim()
});
