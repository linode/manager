import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import authentication from './authentication';
import api from './api';
import linodes from '../linodes/reducers';

const rootReducer = combineReducers({
  routing: routeReducer,
  authentication,
  api,
  linodes,
});

export default rootReducer;
