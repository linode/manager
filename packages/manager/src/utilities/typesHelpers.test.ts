import { getTypeInfo } from './typesHelpers';

import { LinodeType } from '@linode/api-v4';
import types from 'src/utilities/types.json';

const _types = types.data as LinodeType[];

describe('getTypeInfo helper function', () => {
  it('should return a matching type', () => {
    const type = types.data[0];
    expect(getTypeInfo(type.id, _types)).toBe(type);
  });
  it('should return undefined if there is no matching type', () => {
    expect(getTypeInfo('linode-standard-100T', _types)).toBeUndefined();
  });
  it('should return undefined if the type is null or undefined', () => {
    expect(getTypeInfo(null, _types)).toBeUndefined();
  });
});
