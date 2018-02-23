import { combineReducers } from 'redux';

import authentication from './authentication';

import { AppState } from '../types';

export default combineReducers<AppState>({
  authentication,
});
