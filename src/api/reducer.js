import { combineReducers } from 'redux';

import { reducer as linodes } from './configs/linodes';
import { reducer as distributions } from './configs/distributions';
import { reducer as datacenters } from './configs/datacenters';
import { reducer as services } from './configs/services';
import { reducer as kernels } from './configs/kernels';

export default combineReducers({
  linodes,
  datacenters,
  distributions,
  services,
  kernels,
});
