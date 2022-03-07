import getLinodeInfo from './getLinodeInfo';

import { linode1, linode2 } from 'src/__data__/linodes';

const linodes = [linode1, linode2];

describe('getLinodeInfo', () => {
  it('should return a full Linode if a match is found', () => {
    expect(getLinodeInfo(linode1.id, linodes)).toBe(linode1);
  });
  it('should return undefined if no match is found', () => {
    expect(getLinodeInfo(123456, linodes)).toBeUndefined();
  });
  it('should return undefined with an empty list', () => {
    expect(getLinodeInfo(linode1.id, [])).toBeUndefined();
  });
});
