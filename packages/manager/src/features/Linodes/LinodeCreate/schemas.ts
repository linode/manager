import {
  CreateLinodeSchema as BaseCreateLinodeSchema,
  ConfigProfileInterfaceSchema,
  CreateLinodeInterfaceSchema,
} from '@linode/validation';
import { array, number, object } from 'yup';

export const CreateLinodeSchema = BaseCreateLinodeSchema.concat(
  object({
    interfaces: array(ConfigProfileInterfaceSchema),
    linodeInterfaces: array(CreateLinodeInterfaceSchema),
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
