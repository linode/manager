import { getVolumes, getVolumeTypes } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { PriceType } from '@akamai/compute-ui-core/api';
import type { Filter, Params, Volume } from '@linode/api-v4';

export const getAllVolumeTypes = () =>
  getAll<PriceType>((params) => getVolumeTypes(params))().then(
    (data) => data.data,
  );

export const getAllVolumes = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);
