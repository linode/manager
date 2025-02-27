import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

export const EditAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    status: string().oneOf(['enabled', 'disabled']).optional(),
  })
);
