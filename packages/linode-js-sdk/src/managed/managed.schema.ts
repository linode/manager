import { array, boolean, mixed, number, object, string } from 'yup';

export const createServiceMonitorSchema = object().shape({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 64 characters.')
    .max(64, 'Label must be between 3 and 64 characters.'),
  service_type: mixed()
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

export const sshSettingSchema = object().shape({
  access: boolean(),
  user: string().max(32, 'User must be 32 characters or less.'),
  ip: string(),
  port: number()
    .min(1, 'Port must be between 1 and 65535.')
    .max(65535, 'Port must be between 1 and 65535.')
});

export const updateManagedLinodeSchema = object({
  ssh: sshSettingSchema
});

export const credentialLabel = string()
  .min(2, 'Label must be between 2 and 75 characters.')
  .max(75, 'Label must be between 2 and 75 characters.');

export const credentialPassword = string()
  .notRequired()
  .max(5000, 'Password must be 5000 characters or less.');

export const credentialUsername = string()
  .notRequired()
  .max(5000, 'Username must be 5000 characters or less.');

export const createCredentialSchema = object().shape({
  label: credentialLabel.required('Label is required.'),
  username: credentialUsername,
  password: credentialPassword
});

export const updateCredentialSchema = object().shape({
  label: credentialLabel.required('Label is required.')
});

export const updatePasswordSchema = object().shape({
  username: credentialUsername,
  password: credentialPassword.required('Password is required.')
});

export const createContactSchema = object().shape({
  name: string()
    .required('Name is required.')
    .min(2, 'Name must be between 2 and 64 characters.')
    .max(64, 'Name must be between 2 and 64 characters.'),
  email: string()
    .required('E-mail is required.')
    .min(6, 'E-mail must be between 6 and 100 characters')
    .max(100, 'E-mail must be between 6 and 100 characters')
    .email('Invalid e-mail address'),
  phone: object().shape({
    primary: string()
      .nullable(true)
      .notRequired(),
    secondary: string()
      .nullable(true)
      .notRequired()
  }),
  group: string()
    .notRequired()
    .nullable(true)
    .min(2, 'Group must be between 2 and 50 characters.')
    .max(50, 'Group must be between 2 and 50 characters.')
});
