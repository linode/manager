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
  cluster_size: number()
    .oneOf([1, 3], 'Nodes are required')
    .required('Nodes are required'),
  replication_type: string().when('engine', {
    is: (engine: string) => Boolean(engine.match(/mysql|postgres/g)),
    then: string()
      .when('engine', {
        is: (engine: string) => Boolean(engine.match(/mysql/)),
        then: string().oneOf(['none', 'semi_synch', 'asynch']),
      })
      .when('engine', {
        is: (engine: string) => Boolean(engine.match(/postgres/)),
        then: string().oneOf(['none', 'synch', 'asynch']),
      })
      .required('Replication Type is required'),
    otherwise: string().notRequired().nullable(true),
  }),
  replication_commit_type: string().when('engine', {
    is: (engine: string) => Boolean(engine.match(/postgres/)),
    then: string()
      .oneOf(['off', 'on', 'local', 'remote_write', 'remote_apply'])
      .required(),
    otherwise: string().notRequired().nullable(true),
  }),
  storage_engine: string().when('engine', {
    is: (engine: string) => Boolean(engine.match(/mongodb/)),
    then: string().oneOf(['wiredtiger', 'mmapv1']).notRequired(),
    otherwise: string().notRequired().nullable(true),
  }),
  compression_type: string().when('engine', {
    is: (engine: string) => Boolean(engine.match(/mongodb/)),
    then: string().oneOf(['none', 'snappy', 'zlib']).notRequired(),
    otherwise: string().notRequired().nullable(true),
  }),
});

export const updateDatabaseSchema = object({
  label: string().notRequired().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  allow_list: array().of(string()).notRequired(),
  updates: object()
    .notRequired()
    .shape({
      frequency: string().oneOf(['weekly', 'monthly']),
      duration: number(),
      hour_of_day: number(),
      day_of_week: number(),
      week_of_month: number().nullable(true),
    })
    .nullable(true),
  type: string().notRequired(),
});
