import { array, boolean, number, object, string } from 'yup';

const labelSchema = string()
  .min(1, 'Label must be between 1 and 50 characters.')
  .max(50, 'Label must be between 1 and 50 characters.')
  .matches(
    /^[a-zA-Z0-9,.?\-_\s']+$/,
    'Image labels cannot contain special characters.'
  );

export const baseImageSchema = object({
  label: labelSchema.optional(),
  description: string().optional().min(1).max(65000),
  cloud_init: boolean().optional(),
  tags: array(string().min(3).max(50).required()).max(500).optional(),
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

export const updateImageSchema = object({
  label: labelSchema.optional(),
  description: string()
    .optional()
    .max(65000, 'Length must be 65000 characters or less.'),
  tags: array(string().required()).optional(),
});

export const updateImageRegionsSchema = object({
  regions: array(string())
    .required('Regions are required.')
    .min(1, 'Must specify at least one region.'),
});
