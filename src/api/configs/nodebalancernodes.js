import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'nodes',
  singular: 'node',
  endpoint: (id, nbConfigId, nodeId) => {
    return `/nodebalancers/${id}/configs/${nbConfigId}/nodes/${nodeId}`;
  },
  supports: [ONE, MANY, PUT, POST, DELETE],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
