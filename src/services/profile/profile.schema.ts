import * as Yup from 'yup';

export const createPersonalAccessTokenSchema = Yup.object({
  scopes: Yup.string(),
  expiry: Yup.string(),
  label: Yup.string(),
});

export const createSSHKeySchema = Yup.object({
  label: Yup.string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 64 characters.')
    .max(64, 'Label must be between 1 and 64 characters.')
    .trim(),
  ssh_key: Yup.string(),
});