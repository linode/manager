import { getVPCIPs, getVPCs, getVPCsIPs } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, VPC, VPCIP } from '@linode/api-v4';

export const getAllVPCsRequest = (filter: Filter) =>
  getAll<VPC>((params) => getVPCs(params, filter))().then((data) => data.data);

export const getAllVPCsIPsRequest = (filter: Filter) =>
  getAll<VPCIP>((params) => getVPCsIPs(params, filter))().then(
    (data) => data.data,
  );

export const getAllVPCIPsRequest = (id: number, filter: Filter) =>
  getAll<VPCIP>((params) => getVPCIPs(id, params, filter))().then(
    (data) => data.data,
  );
