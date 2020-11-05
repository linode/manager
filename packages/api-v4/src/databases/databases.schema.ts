import { array, mixed, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 3 and 32 characters';

export const maintenanceScheduleSchema = object({
  day: mixed()
    // .required('Day is required')
    .oneOf([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]),
  window: mixed()
    // .required('Maintenance window is required')
    .oneOf([
      'W0',
      'W2',
      'W4',
      'W6',
      'W8',
      'W10',
      'W12',
      'W14',
      'W16',
      'W18',
      'W20',
      'W22'
    ])
})
  .notRequired()
  .default(undefined);

export const createDatabaseSchema = object({
  label: string()
    .notRequired()
    .min(3, LABEL_MESSAGE)
    .max(32, LABEL_MESSAGE),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  root_password: string().required('Root password is required'),
  tags: array().of(string()),
  maintenance_schedule: maintenanceScheduleSchema
});

export const updateDatabaseSchema = object({
  label: string()
    .notRequired()
    .min(3, LABEL_MESSAGE)
    .max(32, LABEL_MESSAGE),
  tags: array()
    .of(string())
    .notRequired(),
  maintenance_schedule: maintenanceScheduleSchema.notRequired()
});

export const resetPasswordSchema = object({
  root_password: string().required('Root password is required')
});
