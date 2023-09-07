import { number, object, string, array } from 'yup';

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
