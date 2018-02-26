import { combineReducers } from 'redux';

import authentication from './authentication';
import api from './api';

import { AppState } from '../types';

export default combineReducers<AppState>({
  authentication,
  api,
});
