import { object, string } from 'yup';

import {
  createCredentialSchema,
  credentialLabel,
  credentialPassword,
  credentialUsername
} from 'linode-js-sdk/lib/managed';

export const creationSchema = createCredentialSchema.shape({
  password: string().required('Password is required.')
} as any);

export const updateLabelSchema = object().shape({
  label: credentialLabel.required('Label is required.')
});

export const updatePasswordSchema = object().shape({
  password: credentialPassword.required('Password is required.'),
  username: credentialUsername
});
