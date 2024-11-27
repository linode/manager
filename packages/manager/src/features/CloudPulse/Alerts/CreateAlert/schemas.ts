import { createAlertDefinitionSchema } from '@linode/validation';
import { object, string } from 'yup';

const engineOptionValidation = string().when('service_type', {
  is: 'dbaas',
  otherwise: string().notRequired().nullable(),
  then: string().required('Engine type is required.').nullable(),
});
export const CreateAlertDefinitionFormSchema = createAlertDefinitionSchema.concat(
  object({
    engineType: engineOptionValidation,
    region: string().required('Region is required.'),
    serviceType: string().required('Service is required.').nullable(),
  })
);
