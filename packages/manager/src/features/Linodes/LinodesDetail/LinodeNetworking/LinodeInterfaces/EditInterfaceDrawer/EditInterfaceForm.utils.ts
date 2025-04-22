import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import { number } from 'yup';

export const EditLinodeInterfaceFormSchema = ModifyLinodeInterfaceSchema.shape({
  firewall_id: number().nullable(),
});
