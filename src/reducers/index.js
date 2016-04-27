import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import authentication from './authentication';
import linodes from './linodes';
import distros from './distros';
import ui from './ui';

const rootReducer = combineReducers({
  routing: routeReducer,
  linodes,
  authentication,
  distros,
  ui
});

export default rootReducer;
