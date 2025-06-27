import { getCloudNATs } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { CloudNAT } from '@linode/api-v4';
import type { Filter } from '@linode/api-v4/lib/types';

export const getAllCloudNATsRequest = (filter: Filter) =>
  getAll<CloudNAT>((params) => getCloudNATs(params, filter))().then(
    (data) => data.data,
  );
