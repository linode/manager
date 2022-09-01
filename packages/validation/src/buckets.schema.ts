import { boolean, object, string } from 'yup';

export const CreateBucketSchema = object({
  label: string()
    .required('Label is required.')
    .matches(/^\S*$/, 'Label must not contain spaces.')
    .ensure()
    .min(3, 'Label must be between 3 and 63 characters.')
    .max(63, 'Label must be between 3 and 63 characters.'),
  cluster: string().required('Cluster is required.'),
});

export const UploadCertificateSchema = object({
  certificate: string().required('Certificate is required.'),
  private_key: string().required('Private key is required.'),
});

export const UpdateBucketAccessSchema = object({
  acl: string()
    .oneOf([
      'private',
      'public-read',
      'authenticated-read',
      'public-read-write',
    ])
    .notRequired(),
  cors_enabled: boolean().notRequired(),
});
