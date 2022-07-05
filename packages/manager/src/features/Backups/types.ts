import { Linode, LinodeType } from '@linode/api-v4';
import { BackupError } from 'src/store/backupDrawer';

export interface ExtendedLinode extends LinodeWithTypeInfo {
  linodeError?: BackupError;
}

export interface LinodeWithTypeInfo extends Linode {
  typeInfo?: LinodeType;
}
