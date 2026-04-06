import {
  CreateLinodeInterfaceSchema,
  CreateVPCInterfaceSchema,
} from '@linode/validation';
import { number, object, string } from 'yup';

import type { InferType } from 'yup';

export const CreateLinodeInterfaceFormSchema =
  CreateLinodeInterfaceSchema.concat(
    object({
      firewall_id: number().required(
        'Select an option or create a new Firewall.'
      ),
      purpose: string()
        .oneOf(['vpc', 'vlan', 'public'])
        .required('You must selected an Interface type.'),
      vpc: CreateVPCInterfaceSchema.concat(
        object({ vpc_id: number().required('VPC is required.') })
      )
        .optional()
        .nullable()
        .default(null),
    })
  );

export type CreateInterfaceFormValues = InferType<
  typeof CreateLinodeInterfaceFormSchema
>;
