import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import authentication from './authentication';
import api from './api';
import ui from './ui';

const rootReducer = combineReducers({
  routing: routeReducer,
  authentication,
  api,
  ui
});

export default rootReducer;
