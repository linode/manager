import _ from 'lodash';

import {
    UPDATE_LINODES, UPDATE_LINODE, DELETE_LINODE,
    UPDATE_LINODE_CONFIG, UPDATE_LINODE_CONFIGS, DELETE_LINODE_CONFIG,
    UPDATE_LINODE_DISK, UPDATE_LINODE_DISKS, DELETE_LINODE_DISK,
} from '~/actions/api/linodes';
import { UPDATE_BACKUP, UPDATE_BACKUPS, TAKE_BACKUP } from '~/actions/api/backups';
import makeApiList from '~/api-store';

const linodes = makeApiList({
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

export default function (state = undefined, action) {
  switch (action.type) {
    case TAKE_BACKUP:
      return {
        ...state,
        linodes: {
          ...state.linodes,
          [action.linodes]: {
            ...state.linodes[action.linodes],
            _backups: {
              ...state.linodes[action.linodes]._backups,
              backups: {
                ..._.filter(state.linodes[action.linodes]._backups.backups, (backup) =>
                  backup.type !== 'snapshot'),
                [action.backup.id]: action.backup,
              },
            },
          },
        },
      };
    default:
      return linodes(state, action);
  }
}
