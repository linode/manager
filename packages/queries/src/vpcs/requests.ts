import { getVPCs } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, VPC } from '@linode/api-v4';

export const getAllVPCsRequest = (filter: Filter) =>
  getAll<VPC>((params) => getVPCs(params, filter))().then((data) => data.data);
