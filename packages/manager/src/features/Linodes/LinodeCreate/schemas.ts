import {
  CreateLinodeSchema as BaseCreateLinodeSchema,
  ConfigProfileInterfaceSchema,
} from '@linode/validation';
import { array, boolean, number, object, string } from 'yup';

import { CreateLinodeInterfaceFormSchema } from '../LinodesDetail/LinodeNetworking/LinodeInterfaces/AddInterfaceDrawer/utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { ObjectSchema } from 'yup';

/**
 * Extends pure `CreateLinodeSchema` because the Linode Create form
 * has extra fields that we want to validate.
 * In theory, this schema should align with the `LinodeCreateFormValues` type.
 */
export const CreateLinodeSchema: ObjectSchema<LinodeCreateFormValues> =
  BaseCreateLinodeSchema.concat(
    object({
      firewallOverride: boolean(),
      hasSignedEUAgreement: boolean(),
      interfaces: array(ConfigProfileInterfaceSchema).required(),
      linode: object({
        id: number().defined(),
        label: string().defined(),
        region: string().defined(),
        type: string().defined().nullable(),
      }).notRequired(),
      linodeInterfaces: array(CreateLinodeInterfaceFormSchema).required(),
      vpc_id: number(),
    })
  );

/**
 * Extends the Linode Create schema to make backup_id required for the backups tab
 */
export const CreateLinodeFromBackupSchema = CreateLinodeSchema.concat(
  object({
    backup_id: number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required('You must select a Backup.'),
  })
);

/**
 * Extends the Linode Create schema to make stackscript_id required for the StackScripts tab
 */
export const CreateLinodeFromStackScriptSchema = CreateLinodeSchema.concat(
  object({
    stackscript_id: number().required('You must select a StackScript.'),
  })
);

/**
 * Extends the Linode Create schema to make stackscript_id required for the Marketplace tab
 */
export const CreateLinodeFromMarketplaceAppSchema = CreateLinodeSchema.concat(
  object({
    stackscript_id: number().required('You must select a Marketplace App.'),
  })
);
