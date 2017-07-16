import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { LOGOUT } from '~/actions/authentication';
import authentication from './authentication';
import modal from './modal';
import notifications from './notifications';
import select from './select';
import session from './session';
import source from './source';
import title from './title';
import api from '../api/reducer';
import errors from './errors';
import preloadIndicator from './preloadIndicator';

const appReducer = combineReducers({
  routing: routerReducer,
  authentication,
  modal,
  notifications,
  select,
  session,
  source,
  title,
  api,
  errors,
  preloadIndicator,
});

export default function rootReducer(state, action) {
  return appReducer(state, action);
}
