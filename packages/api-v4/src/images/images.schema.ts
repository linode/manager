import { number, object, string } from 'yup';

const labelSchema = string()
  .max(50, 'Length must be 50 characters or less.')
  .matches(
    /^[a-zA-Z0-9,.?\-_\s']+$/,
    'Image labels cannot contain special characters.'
  );

export const baseImageSchema = object().shape({
  label: labelSchema.notRequired(),
  description: string().notRequired().min(1).max(65000),
});

export const createImageSchema = baseImageSchema.shape({
  disk_id: number()
    .typeError('Disk is required.')
    .required('Disk is required.'),
});

export const uploadImageSchema = baseImageSchema.shape({
  label: labelSchema.required('Label is required.'),
  region: string().required('Region is required.'),
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
    .max(65000, 'Length must be 65000 characters or less.'),
});
