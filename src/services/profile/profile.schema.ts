import { array, boolean, object, string } from 'yup';

export const createPersonalAccessTokenSchema = object({
  scopes: string(),
  expiry: string(),
  label: string()
    .min(1, 'Label must be between 1 and 100 characters.')
    .max(100, 'Label must be between 1 and 100 characters.')
});

export const createSSHKeySchema = object({
  label: string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 64 characters.')
    .max(64, 'Label must be between 1 and 64 characters.')
    .trim(),
  ssh_key: string()
});

export const updateProfileSchema = object({
  email: string().email(),
  timezone: string(),
  email_notifications: boolean(),
  authorized_keys: array().of(string()),
  restricted: boolean(),
  two_factor_auth: boolean(),
  lish_auth_method: string().oneOf(['password_keys', 'keys_only', 'disabled'])
});
