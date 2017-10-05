import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/internal';

export const config = genConfig({
  plural: 'nodebalancers',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  subresources: {
    _generic: {
      plural: 'generic',
      endpoint: (id, nbConfigId) => `/nodebalancers/${id}/generic/${nbConfigId}`,
      supports: [ONE, MANY, PUT, POST, DELETE],
      subresources: {
        _nodes: {
          plural: 'nodes',
          endpoint: (id, nbConfigId, nodeId) => {
            return `/nodebalancers/${id}/generic/${nbConfigId}/nodes/${nodeId}`;
          },
          supports: [ONE, MANY, PUT, POST, DELETE],
        },
      },
    },
  },


});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
