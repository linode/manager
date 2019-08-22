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

export const updateSchema = object().shape({
  label: credentialLabel.notRequired(),
  password: credentialPassword.required('Password is required.'),
  username: credentialUsername
});
