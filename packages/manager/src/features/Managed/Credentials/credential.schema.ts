import { object, string } from 'yup';

import {
  createCredentialSchema,
  credentialLabel,
  credentialPassword,
  credentialUsername
} from 'src/services/managed';

export const creationSchema = createCredentialSchema.shape({
  password: string().required('Password is required.')
});

export const updateLabelSchema = object().shape({
  label: credentialLabel.notRequired()
});

export const updatePasswordSchema = object().shape({
  password: credentialPassword.required('Password is required.'),
  username: credentialUsername
});
