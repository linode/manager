import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';

import linodes from './linodes';
import datacenters from './datacenters';
import distros from './distros';
import services from './services';

export default combineReducers({
  linodes,
  datacenters,
  distros,
  services,
});
