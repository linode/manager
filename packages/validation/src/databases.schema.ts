import { number } from 'yup';
import { array, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 3 and 32 characters';

export const createDatabaseSchema = object({
  label: string()
    .required('Label is required')
    .min(3, LABEL_MESSAGE)
    .max(32, LABEL_MESSAGE),
  engine: string().required('Database Engine is required'),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  failover_count: number()
    .oneOf([0, 2], 'Nodes are required')
    .required('Nodes are required'),
  replication_type: string()
    .oneOf(['none', 'semi_synch', 'asynch'])
    .required('Replication Type is required'),
});

export const updateDatabaseSchema = object({
  label: string().notRequired().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  allow_list: array().of(string()).required('An IPv4 address is required'),
});
