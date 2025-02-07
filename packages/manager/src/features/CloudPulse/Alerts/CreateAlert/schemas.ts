import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

const fieldErrorMessage = 'This field is required.';

export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    serviceType: string().required(fieldErrorMessage), // HERE, i have removed region and engine type filter, upon confirmation and updated design from UX , will add and implement
  })
);

export const notificationChannelSchema = object({
  channel_type: string().required(fieldErrorMessage),
  label: string().required(fieldErrorMessage),
});
