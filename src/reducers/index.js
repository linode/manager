import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import authentication from './authentication';
import linodes from './linodes';

const rootReducer = combineReducers({
  routing: routeReducer,
  linodes,
  authentication
});

export default rootReducer;
