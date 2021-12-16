import { array, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 3 and 32 characters';

export const createDatabaseSchema = object({
  label: string().required().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  replication_type: string()
    .oneOf(['none', 'semi-synch', 'asynch'])
    .required('Replication Type is required'),
});

export const updateDatabaseSchema = object({
  label: string().notRequired().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  allow_list: array().of(string()).notRequired(),
});
