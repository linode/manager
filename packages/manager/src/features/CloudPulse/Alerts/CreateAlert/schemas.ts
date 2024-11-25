import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

const engineOptionValidation = string().when('service_type', {
  is: 'dbaas',
  otherwise: (schema) => schema.notRequired().nullable(),
  then: (schema) => schema.required('Engine type is required.').nullable(),
});
export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    engine_type: engineOptionValidation,
    region: string().required('Region is required.'),
    service_type: string().required('Service is required.'),
  })
);
