import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'nodebalancers',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  subresources: {
    _configs: {
      plural: 'configs',
      endpoint: (id, nbConfigId) => `/nodebalancers/${id}/configs/${nbConfigId}`,
      supports: [ONE, MANY, PUT, POST, DELETE],
      subresources: {
        _nodes: {
          plural: 'nodes',
          singular: 'node',
          endpoint: (id, nbConfigId, nodeId) => {
            return `/nodebalancers/${id}/configs/${nbConfigId}/nodes/${nodeId}`;
          },
          supports: [ONE, MANY, PUT, POST, DELETE],
        },
      },
    },
  },


});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
