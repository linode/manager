import { combineReducers } from 'redux';

import linodes from './linodes';
import datacenters from './datacenters';
import { reducer as distributions } from '~/api/configs/distributions';
import services from './services';
import kernels from './kernels';

export default combineReducers({
  linodes,
  datacenters,
  distributions,
  services,
  kernels,
});
