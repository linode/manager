import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { LOGOUT } from '~/actions/authentication';
import authentication from './authentication';
import modal from './modal';
import notifications from './notifications';
import session from './session';
import source from './source';
import title from './title';
import api from '../api/reducer';
import errors from './errors';
import linodes from '../linodes/reducers';
import dnsmanager from '../dnsmanager/reducers';
import preloadIndicator from './preloadIndicator';

const appReducer = combineReducers({
  routing: routerReducer,
  authentication,
  modal,
  notifications,
  session,
  source,
  title,
  api,
  linodes,
  dnsmanager,
  errors,
  preloadIndicator,
});

export default function rootReducer(state, action) {
  if (action.type === LOGOUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
}
