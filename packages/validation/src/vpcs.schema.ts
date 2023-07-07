import { array, object, string } from 'yup';

const LABEL_MESSAGE = 'VPC label must be between 1 and 64 characters.';

export const createVPCSchema = object({
  label: string()
    .test(
      'no two dashes in a row',
      'Must not contain two dashes in a row',
      (value) => !value?.includes('--')
    )
    .required('Label is required')
    .min(1, LABEL_MESSAGE)
    .max(64, LABEL_MESSAGE)
    .matches(
      /[a-zA-Z0-9-]+/,
      'Must include only ASCII letters, numbers, and dashes'
    ),
  description: string(),
  region: string().required('Region is required'),
  subnets: array().of(object()),
});

export const updateVPCSchema = object({
  label: string()
    .notRequired()
    .test(
      'no two dashes in a row',
      'Must not contain two dashes in a row',
      (value) => !value?.includes('--')
    )
    .min(1, LABEL_MESSAGE)
    .max(64, LABEL_MESSAGE)
    .matches(
      /[a-zA-Z0-9-]+/,
      'Must include only ASCII letters, numbers, and dashes'
    ),
  description: string().notRequired(),
});
