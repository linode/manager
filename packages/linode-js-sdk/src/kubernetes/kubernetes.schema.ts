import { array, number, object, string } from 'yup';

export const nodePoolSchema = object().shape({
  type: string(),
  count: number()
});

export const clusterLabelSchema = string()
  .notRequired()
  /**
   * This regex is adapted from the API docs. Kubernetes does
   * not allow underscores.
   */
  .matches(
    /^[a-zA-Z0-9-]+$/,
    'Cluster labels cannot contain special characters, spaces, or underscores.'
  )
  .min(3, 'Length must be between 3 and 32 characters.')
  .max(32, 'Length must be between 3 and 32 characters.');

export const createKubeClusterSchema = object().shape({
  label: clusterLabelSchema,
  region: string().required('Region is required.'),
  version: string().required('Kubernetes version is required.'),
  node_pools: array()
    .of(nodePoolSchema)
    .min(1, 'Please add at least one node pool.')
});
