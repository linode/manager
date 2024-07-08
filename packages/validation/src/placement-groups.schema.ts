import { object, string } from 'yup';

const labelValidation = string()
  .required('Label is required.')
  .min(3, 'Label must be between 3 and 32 characters.')
  .max(32, 'Label must be between 3 and 32 characters.');

export const createPlacementGroupSchema = object({
  label: labelValidation,
  placement_group_type: string().required('Affinity type is required.'),
  region: string().required('Region is required.'),
  placement_group_policy: string().required('Is strict is required.'),
});

export const updatePlacementGroupSchema = object({
  label: labelValidation,
});
