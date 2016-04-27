import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import authentication from './authentication';
import linodes from './linodes';
import distros from './distros';

const rootReducer = combineReducers({
  routing: routeReducer,
  linodes,
  authentication,
  distros
});

export default rootReducer;
