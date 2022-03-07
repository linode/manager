import { getTypeInfo } from './typesHelpers';

import { types } from 'src/__data__/types';

describe('getTypeInfo helper function', () => {
  it('should return a matching type', () => {
    const type = types[0];
    expect(getTypeInfo(type.id, types)).toBe(type);
  });
  it('should return undefined if there is no matching type', () => {
    expect(getTypeInfo('linode-standard-100T', types)).toBeUndefined();
  });
  it('should return undefined if the type is null or undefined', () => {
    expect(getTypeInfo(null, types)).toBeUndefined();
  });
});
