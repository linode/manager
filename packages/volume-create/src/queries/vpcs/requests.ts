import { getVPCs } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { VPC } from '@linode/api-v4';

export const getAllVPCsRequest = () =>
  getAll<VPC>((params) => getVPCs(params))().then((data) => data.data);
