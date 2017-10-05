import * as distributionsModule from './generic/distributions';
import * as regionsModule from './generic/regions';
import * as typesModule from './generic/types';
import * as linodesModule from './generic/linodes';
import * as volumesModule from './generic/volumes';
import * as stackscriptsModule from './generic/stackscripts';
import * as kernelsModule from './generic/kernels';
import * as domainsModule from './generic/domains';
import * as nodebalancersModule from './generic/nodebalancers';
import * as profileModule from './generic/profile';
import * as accountModule from './generic/account';
import * as eventsModule from './generic/events';
import * as tokensModule from './generic/tokens';
import * as clientsModule from './generic/clients';
import * as usersModule from './generic/users';
import * as ticketsModule from './generic/tickets';
import * as appsModule from './generic/apps';

import apiActionReducerGenerator from './external';

export const distributions = apiActionReducerGenerator(distributionsModule.config,
                                                       distributionsModule.actions);
export const regions = apiActionReducerGenerator(regionsModule.config,
                                                 regionsModule.actions);
export const types = apiActionReducerGenerator(typesModule.config, typesModule.actions);
export const linodes = apiActionReducerGenerator(linodesModule.config, linodesModule.actions);
export const volumes = apiActionReducerGenerator(volumesModule.config, volumesModule.actions);
export const stackscripts = apiActionReducerGenerator(stackscriptsModule.config,
                                                       stackscriptsModule.actions);
export const kernels = apiActionReducerGenerator(kernelsModule.config, kernelsModule.actions);
export const domains = apiActionReducerGenerator(domainsModule.config, domainsModule.actions);
export const nodebalancers = apiActionReducerGenerator(nodebalancersModule.config,
                                                       nodebalancersModule.actions);
export const profile = apiActionReducerGenerator(profileModule.config, profileModule.actions);
export const events = apiActionReducerGenerator(eventsModule.config, eventsModule.actions);
export const tokens = apiActionReducerGenerator(tokensModule.config, tokensModule.actions);
export const clients = apiActionReducerGenerator(clientsModule.config, clientsModule.actions);
export const users = apiActionReducerGenerator(usersModule.config, usersModule.actions);
export const tickets = apiActionReducerGenerator(ticketsModule.config, ticketsModule.actions);
export const account = apiActionReducerGenerator(accountModule.config, accountModule.actions);
export const apps = apiActionReducerGenerator(appsModule.config, appsModule.actions);
