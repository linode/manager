import { number } from 'yup';
import { array, object, string } from 'yup';
import { validateIP } from './firewalls.schema';

const LABEL_MESSAGE = 'Label must be between 3 and 32 characters';

const ipAddress = object().shape({
  address: string().test({
    name: 'validateIP',
    message: 'Must be a valid IPv4 address.',
    test: validateIP,
  }),
});

export const createDatabaseSchema = object({
  label: string()
    .required('Label is required')
    .min(3, LABEL_MESSAGE)
    .max(32, LABEL_MESSAGE),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  failover_count: number().required('Nodes are required'),
  replication_type: string()
    .oneOf(['none', 'semi-synch', 'asynch'])
    .required('Replication Type is required'),
  allow_list: array().of(ipAddress),
});

export const updateDatabaseSchema = object({
  label: string().notRequired().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  allow_list: array().of(string()).notRequired(),
});
