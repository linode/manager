import { object, string } from 'yup';

export const createCloudViewNamespaceSchema = object({
  label: string()
    .required('Label is required.')
    .matches(
      /^[a-zA-Z0-9-]+$/,
      'Namespace labels cannot contain special characters'
    )
    .min(8, 'Length must be between 8 and 20 characters.')
    .max(20, 'Length must be between 8 and 20 characters.'),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
});
