import { deriveDefaultLabel, LabelOptions } from './deriveDefaultLabel';

describe('create label name', () => {
  it('creates label name with image, region, type', () => {
    const options: LabelOptions = { image: 'ubuntu', region: 'newark', type: '1gb' };
    expect(deriveDefaultLabel(options)).toBe('ubuntu-newark-1gb');
  });

  it('works without all params', () => {
    let options: LabelOptions = { image: 'ubuntu', region: 'newark' };
    expect(deriveDefaultLabel(options)).toBe('ubuntu-newark');
    options = { type: '1gb' };
    expect(deriveDefaultLabel(options)).toBe('1gb');
    options = { image: 'ubuntu', region: 'newark' };
    expect(deriveDefaultLabel(options)).toBe('ubuntu-newark');
  });
});