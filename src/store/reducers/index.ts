import { combineReducers } from 'redux';

import authentication from './authentication';
import api from './api';

export default combineReducers<Linode.AppState>({
  authentication,
  api,
});
