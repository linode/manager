import { object, string } from 'yup';

export const CreateBucketSchema = object({
  label: string()
    .required('Label is required.')
    .matches(/^\S*$/, 'Label must not contain spaces.')
    .ensure()
    .min(3, 'Label must be between 3 and 63 characters.')
    .max(63, 'Label must be between 3 and 63 characters.'),
  cluster: string().required('Cluster is required.')
});
