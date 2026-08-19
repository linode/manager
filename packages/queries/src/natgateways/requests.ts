import { getAll } from '@linode/utilities';

import type { Filter, NATGateway, Params } from '@linode/api-v4';

/**
 * Get all NAT Gateways using getAll utility to handle pagination
 */
export const getAllNATGatewaysRequest = (filter: Filter = {}) =>
  getAll<NATGateway>((params: Params) =>
    import('@linode/api-v4').then((api) => api.getNATGateways(params, filter)),
  )().then((data) => data.data);
