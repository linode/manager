import { combineReducers } from 'redux';

import { reducer as linodes } from './generic/linodes';
import { reducer as volumes } from './generic/volumes';
import { reducer as distributions } from './generic/distributions';
import { reducer as regions } from './generic/regions';
import { reducer as types } from './generic/types';
import { reducer as kernels } from './generic/kernels';
import { reducer as domains } from './generic/domains';
import { reducer as nodebalancers } from './generic/nodebalancers';
import { reducer as profile } from './generic/profile';
import { reducer as account } from './generic/account';
import { reducer as events } from './generic/events';
import { reducer as tokens } from './generic/tokens';
import { reducer as apps } from './generic/apps';
import { reducer as clients } from './generic/clients';
import { reducer as users } from './generic/users';
import { reducer as tickets } from './generic/tickets';
import { reducer as stackscripts } from './generic/stackscripts';

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
  apps,
});
