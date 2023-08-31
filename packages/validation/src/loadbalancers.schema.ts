import { object, string } from 'yup';

export const CreateCertificateSchema = object({
  certificate: string().required('Certificate is required.'),
  key: string().when('type', {
    is: 'downstream',
    then: string().required('Private Key is required.'),
  }),
  label: string().required('Label is required.'),
  type: string().oneOf(['downstream', 'ca']).required('Type is required.'),
});
