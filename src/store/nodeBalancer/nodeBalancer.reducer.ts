
import { Reducer } from "redux";
import { isType } from "typescript-fsa";
import { onError, onStart } from "../store.helpers";
import { getAllNodeBalancersActions } from './nodeBalancer.actions';



type State = ApplicationState['__resources']['nodeBalancers'];

export const defaultState: State = {
  nodeBalancers: {},
  nodeBalancerConfigs: {},
  loading: true,
  error: undefined,
  items: [],
  lastUpdated: 0,
};

const reducer: Reducer<State> = (state = defaultState, action) => {

  if (isType(action, getAllNodeBalancersActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllNodeBalancersActions.done)) {
    const { entities, result } = action.payload.result;
    if (result.length === 0) {
      return {
        ...state,
        loading: false,
      }
    }

    const { nodeBalancers, nodeBalancerConfigs } = entities;
    return {
      ...state,
      loading: false,
      nodeBalancers: nodeBalancers || {},
      nodeBalancerConfigs: nodeBalancerConfigs || {},
      items: result,
    };
  }

  if (isType(action, getAllNodeBalancersActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  return state;
};

export default reducer;
