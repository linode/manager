import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/gen';

export const config = genConfig({
  plural: 'linodes',
  singular: 'linode',
  endpoint: id => `/linode/instances/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  subresources: {
    _configs: {
      plural: 'configs',
      singular: 'config',
      endpoint: (linode, conf) => `/linode/instances/${linode}/configs/${conf}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _disks: {
      plural: 'disks',
      singular: 'disk',
      endpoint: (linode, disk) => `/linode/instances/${linode}/disks/${disk}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _backups: {
      plural: 'backups',
      singular: 'backup',
      endpoint: (linode, backup) => `/linode/instances/${linode}/backups/${backup}`,
      supports: [ONE, MANY],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
