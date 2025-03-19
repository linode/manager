import { getVolumeTypes, getVolumes } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, Params, PriceType, Volume } from '@linode/api-v4';

export const getAllVolumeTypes = () =>
  getAll<PriceType>((params) => getVolumeTypes(params))().then(
    (data) => data.data
  );

export const getAllVolumes = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);
