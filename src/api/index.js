import * as distributionsModule from './configs/distributions';
import * as datacentersModule from './configs/datacenters';
import * as typesModule from './configs/types';
import * as linodesModule from './configs/linodes';
import * as kernelsModule from './configs/kernels';
import * as dnszonesModule from './configs/dnszones';
import * as eventsModule from './configs/events';

import apiActionReducerGenerator from './apiActionReducerGenerator';

export const distributions = apiActionReducerGenerator(distributionsModule.config,
                                                       distributionsModule.actions);
export const datacenters = apiActionReducerGenerator(datacentersModule.config,
                                                     datacentersModule.actions);
export const types = apiActionReducerGenerator(typesModule.config, typesModule.actions);
export const linodes = apiActionReducerGenerator(linodesModule.config, linodesModule.actions);
export const kernels = apiActionReducerGenerator(kernelsModule.config, kernelsModule.actions);
export const dnszones = apiActionReducerGenerator(dnszonesModule.config, dnszonesModule.actions);
export const events = apiActionReducerGenerator(eventsModule.config, eventsModule.actions);
