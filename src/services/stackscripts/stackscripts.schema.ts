import { array, boolean, object, string } from 'yup';

export const stackScriptSchema = object({
  script: string().required('Script is required.'),
  label: string().required('Label is required.'),
  images: array().of(string()).required('An image is required.'),
  description: string(),
  is_public: boolean(),
  rev_note: string(),
});

export const updateStackScriptSchema = object({
  script: string(),
  label: string(),
  images: array().of(string()),
  description: string(),
  is_public: boolean(),
  rev_note: string(),
});
