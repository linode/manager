import { array, boolean, number, object, string } from 'yup';

export const createServiceMonitorSchema = object().shape({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 64 characters.')
    .max(64, 'Label must be between 3 and 64 characters.'),
  service_type: string()
    .required('Monitor type is required.')
    .oneOf(['url', 'tcp']),
  address: string().required('URL is required.'),
  timeout: number().required('Timeout is required.'),
  credentials: array()
    .of(number())
    .notRequired(),
  notes: string().notRequired(),
  consultation_group: string().notRequired(),
  body: string()
    .notRequired()
    .max(100, 'Body must be 100 characters or less.')
});

export const updateManagedLinodeSchema = object({
  ssh: object({
    access: boolean(),
    user: string().max(32),
    ip: string(),
    port: number()
      .min(1)
      .max(65535)
  })
});

export const createCredentialSchema = object().shape({
  label: string()
    .required()
    .min(2, 'Label must be between 2 and 75 characters.')
    .max(75, 'Label must be between 2 and 75 characters.'),
  username: string()
    .notRequired()
    .max(5000, 'Username must be 5000 characters or less.'),
  password: string()
    .notRequired()
    .max(5000, 'Password must be 5000 characters or less.')
});
