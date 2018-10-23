import { number, object, string } from 'yup';

export const createImageSchema = object().shape({
  disk_id: number()
    .typeError('Disk is required')
    .required('Disk is required'),
  label: string()
    .notRequired()
    .min(1)
    .max(50)
    .matches(/^[a-zA-Z0-9,.?\-_']+$/),
  description: string()
    .notRequired()
    .min(1)
    .max(65000)
});

export const updateImageSchema = object().shape({
  label: string()
    .notRequired()
    .min(1)
    .max(50)
    .matches(/^[a-zA-Z0-9,.?\-_']+$/),
  description: string()
    .notRequired()
    .min(1)
    .max(65000)
});