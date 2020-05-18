import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/nodeBalancer/nodeBalancer.reducer';
import { getAllNodeBalancers as _request } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { Dispatch } from './types';

export interface NodeBalancersProps {
  nodeBalancers: State;
  requestNodeBalancers: () => Promise<NodeBalancer[]>;
}

export const useNodeBalancers = () => {
  const dispatch: Dispatch = useDispatch();
  const nodeBalancers = useSelector(
    (state: ApplicationState) => state.__resources.nodeBalancers
  );
  const requestNodeBalancers = () => dispatch(_request());

  return { nodeBalancers, requestNodeBalancers };
};

export default useNodeBalancers;
