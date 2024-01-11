import { array, number, object, string } from 'yup';

export const CreatePlacementGroupSchema = object({
  label: string().required(),
  affinity_type: string().required(),
  region: string().required(),
});

export const AssignVmsToPlacementGroupSchema = object({
  linodeIds: array().of(number()),
});

export const UnassignVmsFromPlacementGroupSchema = object({
  linodeIds: array().of(number()),
});
