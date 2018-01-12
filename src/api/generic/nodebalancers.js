import {
  addParentRefs, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/internal';

export const config = addParentRefs({
  name: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
  subresources: {
    _configs: {
      name: 'configs',
      primaryKey: 'id',
      endpoint: (id, nbConfigId) => `/nodebalancers/${id}/configs/${nbConfigId}`,
      supports: [ONE, MANY, PUT, POST, DELETE],
      subresources: {
        _nodes: {
          name: 'nodes',
          primaryKey: 'id',
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
