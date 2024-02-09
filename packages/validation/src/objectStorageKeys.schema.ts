import { object, string, array } from 'yup';

const labelErrorMessage = 'Label must be between 3 and 50 characters.';

export const createObjectStorageKeysSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, labelErrorMessage)
    .max(50, labelErrorMessage)
    .trim(),
  regions: array()
    .of(string())
    .min(1, 'Regions must include at least one region')
    .notRequired(),
});

export const updateObjectStorageKeysSchema = object({
  label: string()
    .notRequired()
    .min(3, labelErrorMessage)
    .max(50, labelErrorMessage)
    .trim(),
  regions: array()
    .of(string())
    .min(1, 'Regions must include at least one region')
    .notRequired(),
});
