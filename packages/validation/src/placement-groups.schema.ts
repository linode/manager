import { array, number, object, string } from 'yup';

export const createPlacementGroupSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.'),
  affinity_type: string().required('Affinity type is required.'),
  region: string().required('Region is required.'),
});

export const updatePlacementGroupSchema = object({
  label: string().required('Label is required.'),
});

/**
 * @note While this accepts an array of Linode ids (future proofing), only one Linode id is supported at this time.
 */
export const assignVMsToPlacementGroupSchema = object({
  linodeIds: array().of(number().max(1, 'Only one Linode id is supported.')),
});

export const unassignVMsFromPlacementGroupSchema = object({
  linodeIds: array().of(number().max(1, 'Only one Linode id is supported.')),
});
