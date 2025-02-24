import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    serviceType: string().required(fieldErrorMessage),
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
