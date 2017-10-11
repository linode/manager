import { actions } from '../generic/nodebalancers';
import { fetch } from '../fetch';


export function updateConfigSSL(data, nodebalancerId, configId) {
  return (dispatch) =>
    dispatch(fetch.post(`/nodebalancers/${nodebalancerId}/configs/${configId}/ssl`, data));
}

export function nodebalancerStats(nodebalancerId) {
  return async (dispatch) => {
    const { data: _stats } = await dispatch(
      fetch.get(`/nodebalancers/${nodebalancerId}/stats`)
    );
    dispatch(actions.one({ _stats }, nodebalancerId));
  };
}
