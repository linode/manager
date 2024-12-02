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
    .oneOf([1, 2, 3], 'Nodes are required')
    .required('Nodes are required'),
  replication_type: string().notRequired().nullable(), // TODO (UIE-8214) remove POST GA
  replication_commit_type: string().notRequired().nullable(), // TODO (UIE-8214) remove POST GA
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
      week_of_month: number().nullable(),
    })
    .nullable(),
  type: string().notRequired(),
});
