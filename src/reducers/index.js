import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { LOGOUT } from '~/actions/authentication';
import authentication from './authentication';
import modal from './modal';
import notifications from './notifications';
import feedback from './feedback';
import source from './source';
import api from '../api/reducer';
import errors from './errors';
import linodes from '../linodes/reducers';
import preload_indicator from './preload_indicator';

const appReducer = combineReducers({
  routing: routerReducer,
  authentication,
  modal,
  notifications,
  feedback,
  source,
  api,
  linodes,
  errors,
  preload_indicator,
});

export default function rootReducer(state, action) {
  if (action.type === LOGOUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
}
