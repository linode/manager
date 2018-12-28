import { deriveDefaultLabel } from './deriveDefaultLabel';

describe('create label name', () => {
  it('creates label name with image, region, type', () => {
    expect(deriveDefaultLabel('ubuntu', 'newark', '1gb')).toBe('ubuntu-newark-1gb');
  });

  it('works without all params', () => {
    expect(deriveDefaultLabel('ubuntu', 'newark')).toBe('ubuntu-newark');
    expect(deriveDefaultLabel('1gb')).toBe('1gb');
    expect(deriveDefaultLabel('ubuntu', 'newark')).toBe('ubuntu-newark');
  });
});