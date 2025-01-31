import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

const engineOptionValidation = string().when('service_type', {
  is: 'dbaas',
  otherwise: (schema) => schema.notRequired().nullable(),
  then: (schema) => schema.required(fieldErrorMessage).nullable(),
});

export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    engineType: engineOptionValidation,
    region: string().required(fieldErrorMessage),
    serviceType: string().required(fieldErrorMessage),
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
