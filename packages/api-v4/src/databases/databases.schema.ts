import { array, mixed, object, string } from 'yup';

export const maintenanceScheduleSchema = object({
  day: mixed()
    .required('Day is required')
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
    .required('Maintenance window is required')
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
});

export const createDatabaseSchema = object({
  label: string()
    .notRequired()
    .min(3, 'Label must be between 3 and 32 characters')
    .max(32, 'Label must be between 3 and 32 characters'),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  root_password: string().required('Root password is required'),
  tags: array().of(string()),
  maintenance_schedule: maintenanceScheduleSchema.notRequired()
});

export const updateDatabaseSchema = object({
  label: string()
    .notRequired()
    .min(3, 'Label must be between 3 and 32 characters')
    .max(32, 'Label must be between 3 and 32 characters'),
  tags: array().of(string()),
  maintenance_schedule: maintenanceScheduleSchema.notRequired()
});

export const resetPasswordSchema = object({
  root_password: string().required('Root password is required')
});
