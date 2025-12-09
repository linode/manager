import { mixed, number, object, string } from 'yup';

const recordBaseSchema = object().shape({
  name: string().max(100, 'Record name must be 100 characters or less.'),
  target: string(),
  priority: number()
    .min(0, 'Priority must be between 0 and 255.')
    .max(255, 'Priority must be between 0 and 255.'),
  weight: number(),
  port: number(),
  service: string().nullable(),
  protocol: string().nullable(),
  ttl_sec: number(),
  tag: string(),
});

const validRecordTypes: string[] = [
  'A',
  'AAAA',
  'NS',
  'MX',
  'CNAME',
  'TXT',
  'SRV',
  'PTR',
  'CAA',
];

export const createRecordSchema = recordBaseSchema.shape({
  type: mixed().required('Type is required.').oneOf(validRecordTypes),
});

export const updateRecordSchema = recordBaseSchema.shape({});
