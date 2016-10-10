import * as distributionsModule from './configs/distributions';
import * as datacentersModule from './configs/datacenters';
import * as typesModule from './configs/types';
import * as linodesModule from './configs/linodes';
import * as kernelsModule from './configs/kernels';
import * as dnszonesModule from './configs/dnszones';

import genThunks from './genThunks';

export const distributions = genThunks(distributionsModule.config, distributionsModule.actions);
export const datacenters = genThunks(datacentersModule.config, datacentersModule.actions);
export const types = genThunks(typesModule.config, typesModule.actions);
export const linodes = genThunks(linodesModule.config, linodesModule.actions);
export const kernels = genThunks(kernelsModule.config, kernelsModule.actions);
export const dnszones = genThunks(dnszonesModule.config, dnszonesModule.actions);
