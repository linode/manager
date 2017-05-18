import { thunkFetch } from './apiActionReducerGenerator';
import { actions } from './configs/nodebalancers';

export function updateConfigSSL(data, nodebalancerId, configId) {
  return thunkFetch.post(`/nodebalancers/${nodebalancerId}/configs/${configId}/ssl`, data);
}

export function nodebalancerStats(nodebalancerId) {
  return async (dispatch) => {
    const { data: _stats } = await dispatch(thunkFetch.get(`/nodebalancers/${nodebalancerId}/stats`));
    dispatch(actions.one({ _stats }, nodebalancerId));
  };
}
