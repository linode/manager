import { number, object, string } from 'yup';

export const resizeLinodeDiskSchema = object({
  size: number().required().min(1),
});

export const CreateLinodeSchema = object().shape({
  type: string()
    .ensure()
    .required('Plan is required.'),
  region: string()
    .ensure()
    .required('Region is required.'),
});