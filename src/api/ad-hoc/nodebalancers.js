import { actions } from '../generic/nodebalancers';
import { fetch } from '../fetch';

export function nodebalancerStats(nodebalancerId) {
  return async (dispatch) => {
    const { data: _stats } = await dispatch(
      fetch.get(`/nodebalancers/${nodebalancerId}/stats`)
    );
    dispatch(actions.one({ _stats }, nodebalancerId));
  };
}
