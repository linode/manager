import { number, object, string } from 'yup';

export const createImageSchema = object().shape({
  disk_id: number()
    .typeError('Disk is required')
    .required('Disk is required'),
  label: string()
    .notRequired()
    .min(1, 'Length must be 1-50 characters')
    .max(50, 'Length must be 1-50 characters')
    .matches(/^[a-zA-Z0-9,.?\-_']+$/, 'Image labels can not contain special characters.'),
  description: string()
    .notRequired()
    .min(1)
    .max(65000)
});

export const updateImageSchema = object().shape({
  label: string()
    .notRequired()
    .min(1, 'Length must be 1-50 characters')
    .max(50, 'Length must be 1-50 characters')
    .matches(/^[a-zA-Z0-9,.?\-_']+$/, 'Image labels can not contain special characters.'),
  description: string()
    .notRequired()
    .min(1, 'Length must be 1-50 characters')
    .max(65000, 'Length must be 1-65000 characters')
});