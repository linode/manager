import { mixed, object, string } from 'yup';

import type { ChannelType } from '@linode/api-v4';

const fieldErrorMessage = 'This field is required.';

export const createNotificationChannelSchema = object({
  name: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  type: mixed<ChannelType>()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
});
