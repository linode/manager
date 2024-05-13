import { CreateLinodeSchema } from '@linode/validation';
import { number, object } from 'yup';

/**
 * Extends the Linode Create schema to make `linode` required for the Clone Linode tab
 */
export const CreateLinodeByCloningSchema = CreateLinodeSchema.concat(
  object({
    linode: object().required('You must select a Linode to clone from.'),
  })
);

/**
 * Extends the Linode Create schema to make backup_id required for the backups tab
 */
export const CreateLinodeFromBackupSchema = CreateLinodeSchema.concat(
  object({
    backup_id: number().required('You must select a Backup.'),
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
