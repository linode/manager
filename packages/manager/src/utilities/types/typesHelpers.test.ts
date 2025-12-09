import types from 'src/utilities/types.json';

import { extendType } from '../extendType';
import { getTypeInfo } from './typesHelpers';

import type { LinodeType } from '@linode/api-v4';

const _types = (types.data as LinodeType[]).map(extendType);

describe('getTypeInfo helper function', () => {
  it('should return a matching type', () => {
    const type = extendType(types.data[0] as LinodeType);
    expect(getTypeInfo(type.id, _types)).toEqual(type);
  });
  it('should return undefined if there is no matching type', () => {
    expect(getTypeInfo('linode-standard-100T', _types)).toBeUndefined();
  });
  it('should return undefined if the type is null or undefined', () => {
    expect(getTypeInfo(null, _types)).toBeUndefined();
  });
});
