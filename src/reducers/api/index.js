import { combineReducers } from 'redux';

import linodes from './linodes';
import { reducer as distributions } from '~/api/configs/distributions';
import { reducer as datacenters } from '~/api/configs/datacenters';
import { reducer as services } from '~/api/configs/services';
import { reducer as kernels } from '~/api/configs/kernels';

export default combineReducers({
  linodes,
  datacenters,
  distributions,
  services,
  kernels,
});
