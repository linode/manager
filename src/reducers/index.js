import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import analytics from './analytics';
import authentication from './authentication';
import errors from './errors';
import events from './events';
import modal from './modal';
import notifications from './notifications';
import preloadIndicator from './preloadIndicator';
import select from './select';
import session from './session';
import source from './source';
import title from './title';
import api from '../api/reducer';

const appReducer = combineReducers({
  routing: routerReducer,
  analytics,
  authentication,
  events,
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
