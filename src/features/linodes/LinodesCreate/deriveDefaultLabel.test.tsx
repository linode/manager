import { deriveDefaultLabel, ensureSingleDashesAndUnderscores } from './deriveDefaultLabel';

describe('create label name', () => {
  it('creates label name with image, region, type', () => {
    expect(deriveDefaultLabel('ubuntu', 'newark', '1gb')).toBe('ubuntu-newark-1gb');
  });

  it('works without all params', () => {
    expect(deriveDefaultLabel('ubuntu', 'newark')).toBe('ubuntu-newark');
    expect(deriveDefaultLabel('1gb')).toBe('1gb');
    expect(deriveDefaultLabel('ubuntu', 'newark')).toBe('ubuntu-newark');
  });

  it('clamps length when necessary', () => {
    expect(deriveDefaultLabel('really-long-linode-label', 'newark')).toBe('really-long-li-newark')
    expect(deriveDefaultLabel('really-long-linode-label', 'us-east-another-region')).toBe('really-long-li-us-east-anothe')
  });

  it('ensures no double dashes or underscores are present', () => {
    expect(deriveDefaultLabel('really-long-l-inode-label', 'us-east-another-region')).toBe('really-long-l-us-east-anothe')
    expect(deriveDefaultLabel('this-is__impossible', 'us-west')).toBe('this-is_impos-us-west')
  });
});

describe('ensure single dashes and underscores', () => {
  it('doesn\'t allow double dashes', () => {
    expect(ensureSingleDashesAndUnderscores('hello--world')).toBe('hello-world');
    expect(ensureSingleDashesAndUnderscores('--hello-world')).toBe('-hello-world');
    expect(ensureSingleDashesAndUnderscores('hello-world--')).toBe('hello-world-');
  });

  it('doesn\'t allow double dashes', () => {
    expect(ensureSingleDashesAndUnderscores('hello__world')).toBe('hello_world');
    expect(ensureSingleDashesAndUnderscores('_hello__world')).toBe('_hello_world');
    expect(ensureSingleDashesAndUnderscores('hello__world_')).toBe('hello_world_');
  });
});