import { array, object, string } from 'yup';

export const maintenanceScheduleSchema = object({
  day: string()
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
  window: string()
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
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  root_password: string().required('Root password is required'),
  tags: array().of(string())
});

export const resetPasswordSchema = object({
  root_password: string().required('Root password is required')
});
