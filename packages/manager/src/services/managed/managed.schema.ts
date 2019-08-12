import { array, number, object, string } from 'yup';

export const createServiceMonitorSchema = object().shape({
  label: string()
          .required('Label is required.')
          .min(3, 'Label must be between 3 and 64 characters.')
          .max(64, 'Label must be between 3 and 64 characters.'),
  service_type: string().required('Service type is required.').oneOf(['url', 'tcp']),
  address: string().required('Address is required.'),
  timeout: number().required('Timeout is required.'),
  credentials: array().of(string()).notRequired(),
  notes: string().notRequired(),
  consultation_group: string().notRequired(),
  body: string().notRequired().max(100, 'Body must be 100 characters or less.')
});
