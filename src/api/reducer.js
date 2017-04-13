import { combineReducers } from 'redux';

import { reducer as linodes } from './configs/linodes';
import { reducer as distributions } from './configs/distributions';
import { reducer as regions } from './configs/regions';
import { reducer as types } from './configs/types';
import { reducer as kernels } from './configs/kernels';
import { reducer as domains } from './configs/domains';
import { reducer as nodebalancers } from './configs/nodebalancers';
import { reducer as profile } from './configs/profile';
import { reducer as events } from './configs/events';
import { reducer as tokens } from './configs/tokens';
import { reducer as clients } from './configs/clients';
import { reducer as settings } from './configs/settings';
import { reducer as users } from './configs/users';
import { reducer as tickets } from './configs/tickets';

export default combineReducers({
  linodes,
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
  settings,
  users,
  tickets,
});
