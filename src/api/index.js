import * as distributionsModule from './configs/distributions';
import * as regionsModule from './configs/regions';
import * as typesModule from './configs/types';
import * as linodesModule from './configs/linodes';
import * as kernelsModule from './configs/kernels';
import * as domainsModule from './configs/domains';
import * as nodebalancersModule from './configs/nodebalancers';
import * as profileModule from './configs/profile';
import * as eventsModule from './configs/events';
import * as tokensModule from './configs/tokens';
import * as clientsModule from './configs/clients';
import * as settingsModule from './configs/settings';
import * as usersModule from './configs/users';
import * as ticketsModule from './configs/tickets';

import apiActionReducerGenerator from './apiActionReducerGenerator';

export const distributions = apiActionReducerGenerator(distributionsModule.config,
                                                       distributionsModule.actions);
export const regions = apiActionReducerGenerator(regionsModule.config,
                                                 regionsModule.actions);
export const types = apiActionReducerGenerator(typesModule.config, typesModule.actions);
export const linodes = apiActionReducerGenerator(linodesModule.config, linodesModule.actions);
export const kernels = apiActionReducerGenerator(kernelsModule.config, kernelsModule.actions);
export const domains = apiActionReducerGenerator(domainsModule.config, domainsModule.actions);
export const nodebalancers = apiActionReducerGenerator(nodebalancersModule.config,
                                                       nodebalancersModule.actions);
export const profile = apiActionReducerGenerator(profileModule.config, profileModule.actions);
export const events = apiActionReducerGenerator(eventsModule.config, eventsModule.actions);
export const tokens = apiActionReducerGenerator(tokensModule.config, tokensModule.actions);
export const clients = apiActionReducerGenerator(clientsModule.config, clientsModule.actions);
export const settings = apiActionReducerGenerator(settingsModule.config, settingsModule.actions);
export const users = apiActionReducerGenerator(usersModule.config, usersModule.actions);
export const tickets = apiActionReducerGenerator(ticketsModule.config, ticketsModule.actions);
