import {
  Filter,
  Params,
  Volume,
  getVolumeTypes,
  getVolumes,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { PriceType } from '@linode/api-v4';

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
