import { array, number, object, string } from 'yup';

export const nodePoolSchema = object().shape({
  type: string(),
  count: number()
});

export const createKubeClusterSchema = object().shape({
  label: string()
    .notRequired()
    .min(3)
    .max(32, 'Length must be between 3 and 32 characters.')
    .matches(
      /[a-zA-Z0-9-]/,
      'Image labels cannot contain special characters or underscores.'
    ),
  region: string().notRequired(),
  version: string(),
  tags: array().of(string()),
  node_pools: array().of(nodePoolSchema)
});
