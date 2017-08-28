import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'linodes',
  endpoint: id => `/linode/instances/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  properties: {
    type: (linode) => function (_, getState) {
      const types = getState().api.types;
      if (!types) {
        return null;
      }

      return {
        label: 'Unknown',
        ...types.types[linode.type] || {},
        storage: linode.storage,
        ram: linode.memory,
        vcpus: linode.vcpus,
      };
    },
  },
  subresources: {
    _configs: {
      plural: 'configs',
      endpoint: (linode, conf) => `/linode/instances/${linode}/configs/${conf}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _disks: {
      plural: 'disks',
      endpoint: (linode, disk) => `/linode/instances/${linode}/disks/${disk}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
    _volumes: {
      plural: 'volumes',
      endpoint: (linode, volume) => `/linode/instances/${linode}/volumes/${volume}`,
      supports: [ONE, MANY, PUT, DELETE, POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
