import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'linodes',
  endpoint: id => `/linode/instances/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
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
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
