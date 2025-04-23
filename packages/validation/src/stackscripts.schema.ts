import { array, boolean, object, string } from 'yup';

export const stackScriptSchema = object({
  script: string().required('Script is required.'),
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 128 characters.')
    .max(128, 'Label must be between 3 and 128 characters.'),
  images: array(string().required())
    .min(1, 'An image is required.')
    .required('An image is required.'),
  description: string(),
  is_public: boolean(),
  rev_note: string(),
});

export const updateStackScriptSchema = object({
  script: string(),
  label: string()
    .min(3, 'Label must be between 3 and 128 characters.')
    .max(128, 'Label must be between 3 and 128 characters.'),
  images: array(string().required()).min(1, 'An image is required.'),
  description: string(),
  is_public: boolean(),
  rev_note: string(),
});
