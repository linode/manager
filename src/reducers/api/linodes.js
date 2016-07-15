import {
    UPDATE_LINODES, UPDATE_LINODE, DELETE_LINODE,
    UPDATE_LINODE_CONFIG, UPDATE_LINODE_CONFIGS, DELETE_LINODE_CONFIG,
    UPDATE_LINODE_DISK, UPDATE_LINODE_DISKS, DELETE_LINODE_DISK,
} from '~/actions/api/linodes';
import { UPDATE_BACKUP, UPDATE_BACKUPS } from '~/actions/api/backups';
import makeApiList from '~/api-store';

export default makeApiList({
  plural: 'linodes',
  singular: 'linode',
  actions: {
    update_singular: UPDATE_LINODE,
    update_many: UPDATE_LINODES,
    delete_one: DELETE_LINODE,
  },
  subresources: {
    _configs: {
      plural: 'configs',
      singular: 'config',
      actions: {
        update_singular: UPDATE_LINODE_CONFIG,
        update_many: UPDATE_LINODE_CONFIGS,
        delete_one: DELETE_LINODE_CONFIG,
      },
    },
    _disks: {
      plural: 'disks',
      singular: 'disk',
      actions: {
        update_singular: UPDATE_LINODE_DISK,
        update_many: UPDATE_LINODE_DISKS,
        delete_one: DELETE_LINODE_DISK,
      },
    },
    _backups: {
      plural: 'backups',
      singular: 'backup',
      actions: {
        update_singular: UPDATE_BACKUP,
        update_many: UPDATE_BACKUPS,
      },
    },
  },
});
