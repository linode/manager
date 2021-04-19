import { array, object, string, number } from 'yup';

export const createVlanSchema = object({
  description: string()
    .notRequired()
    .max(64, 'Description must be 64 characters or less'),
  region: string().required('Region is required'),
  linodes: array().of(number()),
});
