import { combineReducers } from "redux";

import profile, { DEFAULT_STATE as defaultProfileState } from './profile';

export const defaultState = {
  profile: defaultProfileState,
}

export default combineReducers({ profile });
