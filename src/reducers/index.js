import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import authentication from './authentication';
import modal from './modal';
import api from './api';
import linodes from '../linodes/reducers';

const rootReducer = combineReducers({
  routing: routerReducer,
  authentication,
  modal,
  api,
  linodes,
});

export default rootReducer;
