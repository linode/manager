import { combineReducers } from 'redux';
import linodeDetail, { defaultState as linodeDetailDefaultState } from './linodeDetail';
import linodes, { defaultState as linodesDefaultState } from './linodes';

export const defaultState = {
  linodeDetail: linodeDetailDefaultState,
  linodes: linodesDefaultState,
}

export default combineReducers({ linodeDetail, linodes });
