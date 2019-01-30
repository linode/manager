import { object, string } from 'yup';

export const enableTwoFactorSchema = object({
  tfa_code: string().required('Please enter a token.')
});
