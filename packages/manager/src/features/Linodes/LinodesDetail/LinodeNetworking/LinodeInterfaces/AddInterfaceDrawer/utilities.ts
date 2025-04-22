import {
  CreateLinodeInterfaceSchema,
  CreateVPCInterfaceSchema,
} from '@linode/validation';
import { number, object, string } from 'yup';

import type { InterfacePurpose } from '@linode/api-v4';
import type { FirewallDefaultEntity } from 'src/features/Firewalls/components/FirewallSelectOption.utils';
import type { InferType } from 'yup';

export const CreateLinodeInterfaceFormSchema =
  CreateLinodeInterfaceSchema.concat(
    object({
      purpose: string().oneOf(['vpc', 'vlan', 'public'] as InterfacePurpose[]),
      vpc: CreateVPCInterfaceSchema.concat(
        object({ vpc_id: number().nullable() })
      )
        .optional()
        .nullable()
        .default(null),
    })
  );

export type CreateInterfaceFormValues = InferType<
  typeof CreateLinodeInterfaceFormSchema
>;

export const INTERFACE_PURPOSE_TO_DEFAULT_FIREWALL_KEY: Record<
  InterfacePurpose,
  FirewallDefaultEntity | null
> = {
  public: 'public_interface',
  vlan: null,
  vpc: 'vpc_interface',
};
