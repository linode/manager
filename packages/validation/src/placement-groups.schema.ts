import { object, string } from 'yup';

const labelValidation = string()
  .required('Label is required.')
  .min(3, 'Label must be between 3 and 32 characters.')
  .max(32, 'Label must be between 3 and 32 characters.');

export const createPlacementGroupSchema = object({
  label: labelValidation,
  affinity_type: string().required('Affinity type is required.'),
  region: string().required('Region is required.'),
});

export const renamePlacementGroupSchema = object({
  label: labelValidation,
});
