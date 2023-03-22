import { Linode } from '@linode/api-v4/lib/linodes';
import { BackupError } from 'src/store/backupDrawer';
import { ExtendedType } from 'src/utilities/extendType';

export interface ExtendedLinode extends LinodeWithTypeInfo {
  linodeError?: BackupError;
}

export interface LinodeWithTypeInfo extends Linode {
  typeInfo?: ExtendedType;
}
