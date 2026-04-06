import { object, string } from 'yup';

const labelValidation = string()
  .required('Label is required.')
  .min(3, 'Label must be between 3 and 32 characters.')
  .max(32, 'Label must be between 3 and 32 characters.');

export const createPlacementGroupSchema = object({
  label: labelValidation,
  placement_group_type: string().required('Placement Group Type is required.'),
  region: string().required('Region is required.'),
  placement_group_policy: string().required(
    'Placement Group Policy is required.',
  ),
});

export const updatePlacementGroupSchema = object({
  label: labelValidation,
});
