import { Reducer } from "redux";
import { getAllNodeBalancers } from "src/store/nodeBalancers/nodeBalancers.request";
import { isType } from 'typescript-fsa';
import { createDefaultState, onGetAllSuccess, onStart } from '../request/request.helpers';

/**
 * State
 */
type State = ApplicationState['__resources']['nodeBalancers'];

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if(isType(action, getAllNodeBalancers.started)){
    return onStart(state);
  }

  if(isType(action, getAllNodeBalancers.done)){
    const {result} = action.payload;
    return onGetAllSuccess(result, state);
  }

  if(isType(action, getAllNodeBalancers.failed)){}

  return state;
};

export default reducer;
