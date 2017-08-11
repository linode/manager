import { combineReducers } from 'redux';

import { reducer as linodes } from './configs/linodes';
import { reducer as volumes } from './configs/volumes';
import { reducer as distributions } from './configs/distributions';
import { reducer as regions } from './configs/regions';
import { reducer as types } from './configs/types';
import { reducer as kernels } from './configs/kernels';
import { reducer as domains } from './configs/domains';
import { reducer as nodebalancers } from './configs/nodebalancers';
import { reducer as profile } from './configs/profile';
import { reducer as account } from './configs/account';
import { reducer as events } from './configs/events';
import { reducer as tokens } from './configs/tokens';
import { reducer as clients } from './configs/clients';
import { reducer as users } from './configs/users';
import { reducer as tickets } from './configs/tickets';
import { reducer as stackscripts } from './configs/stackscripts';

export default combineReducers({
  linodes,
  volumes,
  regions,
  distributions,
  types,
  kernels,
  domains,
  events,
  nodebalancers,
  profile,
  tokens,
  clients,
  users,
  tickets,
  account,
  stackscripts,
});
