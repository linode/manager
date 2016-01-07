import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import counter from './counter';

const rootReducer = combineReducers({
  routing: routeReducer,
  counter
});

export default rootReducer;
