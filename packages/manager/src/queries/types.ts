import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  LinodeType,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import {
  ExtendedType,
  extendType,
} from 'src/store/linodeType/linodeType.reducer';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

const getAllTypes = () =>
  Promise.all([
    getAll<LinodeType>(getLinodeTypes)(),
    getAll<LinodeType>(getDeprecatedLinodeTypes)(),
  ]).then(([{ data: types }, { data: legacyTypes }]) =>
    [...types, ...legacyTypes].map(extendType)
  );

export const useTypes = () =>
  useQuery<ExtendedType[], APIError[]>('types', getAllTypes, {
    ...queryPresets.oneTimeFetch,
  });
