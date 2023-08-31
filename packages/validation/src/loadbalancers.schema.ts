import { object, string } from 'yup';

export const CreateCertificateSchema = object({
  certificate: string().required(),
  key: string(),
  label: string().required(),
  type: string().oneOf(['downstream', 'ca']).required(),
});
