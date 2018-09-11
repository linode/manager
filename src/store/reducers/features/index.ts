import { combineReducers } from 'redux';
import linodeDetail, { defaultState as linodeDetailDefaultState } from './linodeDetail';

export const defaultState = {
  linodeDetail: linodeDetailDefaultState
}

export default combineReducers({ linodeDetail });
