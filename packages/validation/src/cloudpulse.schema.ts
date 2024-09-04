import { array, object, string } from 'yup';

export const createAlertDefinitionSchema = object({
  name: string().required('Name is required'),
  description: string(),
  region: string().required('Region is required'),
  service_type: string().required('Service type is required'),
  resource_ids: array().of(string()).min(1, 'At least one resource is needed'),
  severity: string().required('Severity is required'),
});
