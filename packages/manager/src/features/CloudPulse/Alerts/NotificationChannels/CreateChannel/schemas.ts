import { array, mixed, object, string } from 'yup';

import type { ChannelType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

const specialStartRegex = /^[^a-zA-Z0-9]/;
const specialEndRegex = /[^a-zA-Z0-9]$/;

export const createNotificationChannelSchema = object({
  label: string()
    .required(fieldErrorMessage)
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      }
    ),
  type: mixed<ChannelType>()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  recipients: array()
    .of(string().defined())
    .required(fieldErrorMessage)
    .min(1, fieldErrorMessage),
});
