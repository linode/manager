import {
  addParentRefs, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/internal.ts';

export const config = addParentRefs({
  name: 'linodes',
  primaryKey: 'id',
  endpoint: id => `/linode/instances/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  subresources: {
    _configs: {
      name: 'configs',
      primaryKey: 'id',
      endpoint: (linode, conf) => `/linode/instances/${linode}/configs/${conf}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _disks: {
      name: 'disks',
      primaryKey: 'id',
      endpoint: (linode, disk) => `/linode/instances/${linode}/disks/${disk}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _volumes: {
      name: 'volumes',
      primaryKey: 'id',
      endpoint: (linode, volume) => `/linode/instances/${linode}/volumes/${volume}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
