import { object, string, array } from 'yup';

export const createObjectStorageKeysSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 50 characters.')
    .max(50, 'Label must be between 3 and 50 characters.')
    .trim(),
  regions: array()
    .of(string())
    .min(1, 'Regions must include at least one region')
    .notRequired(),
});
