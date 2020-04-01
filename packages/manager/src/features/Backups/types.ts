import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import { BackupError } from 'src/store/backupDrawer';

export interface ExtendedLinode extends LinodeWithTypeInfo {
  linodeError?: BackupError;
}

export interface LinodeWithTypeInfo extends Linode {
  typeInfo?: LinodeType;
}
