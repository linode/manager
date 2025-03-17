import { editAlertDefinitionSchema } from '@linode/validation';
import { mixed, object, string } from 'yup';

import type { AlertSeverityType } from '@linode/api-v4';

export const editAlertDefinitionFormSchema = editAlertDefinitionSchema.concat(
  object({
    serviceType: string().oneOf(['linode', 'dbaas']).optional(),
    severity: mixed<AlertSeverityType>().optional(),
    status: string().oneOf(['enabled', 'disabled']).optional(),
  })
);
