import { object, string } from 'yup';

export const CreateBucketSchema = object({
  label: string()
    .required('Label is required.')
    .matches(/^\S*$/, 'Label must not contain spaces.')
    .ensure()
    // @todo: What are the actual limits?
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be 32 characters or less.'),
  cluster: string().required('Cluster is required.')
});
