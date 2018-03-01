import { combineReducers } from 'redux';

import authentication from './authentication';
import api from './api';
import things from './things';

export default combineReducers<Linode.AppState>({
  authentication,
  api,
  things,
});
