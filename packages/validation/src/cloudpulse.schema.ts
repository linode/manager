import { object, string } from 'yup';

export const createAlertDefinitionSchema = object({
  name: string().required('Name is required'),
  description: string(),
  severity: string().required('Severity is required'),
});
