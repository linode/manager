import { combineReducers } from 'redux';

import { reducer as linodes } from './configs/linodes';
import { reducer as distributions } from './configs/distributions';
import { reducer as datacenters } from './configs/datacenters';
import { reducer as types } from './configs/types';
import { reducer as kernels } from './configs/kernels';
import { reducer as dnszones } from './configs/dnszones';

export default combineReducers({
  linodes,
  datacenters,
  distributions,
  types,
  kernels,
  dnszones,
});
