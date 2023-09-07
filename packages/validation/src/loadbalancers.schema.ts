import { number, object, string, array } from 'yup';

export const CreateCertificateSchema = object({
  certificate: string().required('Certificate is required.'),
  key: string().when('type', {
    is: 'downstream',
    then: string().required('Private Key is required.'),
  }),
  label: string().required('Label is required.'),
  type: string().oneOf(['downstream', 'ca']).required('Type is required.'),
});

export const certificateConfigSchema = object({
  certificates: array(
    object({
      id: number()
        .typeError('Certificate ID is required.')
        .required('Certificate ID is required.')
        .min(0, 'Certificate ID is required.'),
      hostname: string().required('A Host Header is required.'),
    })
  ),
});
