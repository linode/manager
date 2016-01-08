import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import counter from './counter';
import authentication from './authentication';

const rootReducer = combineReducers({
  routing: routeReducer,
  counter,
  authentication
});

export default rootReducer;
