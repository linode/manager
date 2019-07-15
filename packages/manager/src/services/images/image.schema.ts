import { number, object, string } from 'yup';

export const createImageSchema = object().shape({
  disk_id: number()
    .typeError('Disk is required.')
    .required('Disk is required.'),
  label: string()
    .notRequired()
    .max(50, 'Length must be 50 characters or less.')
    .matches(
      /^[a-zA-Z0-9,.?\-_\s']+$/,
      'Image labels cannot contain special characters.'
    ),
  description: string()
    .notRequired()
    .min(1)
    .max(65000)
});

export const updateImageSchema = object().shape({
  label: string()
    .notRequired()
    .max(50, 'Length must be 50 characters or less.')
    .matches(
      /^[a-zA-Z0-9,.?\-_\s']+$/,
      'Image labels cannot contain special characters.'
    ),
  description: string()
    .notRequired()
    .max(65000, 'Length must be 65000 characters or less.')
});
