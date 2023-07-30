import { deriveDefaultLabel } from './deriveDefaultLabel';

describe('create label name', () => {
  it('creates label name with image, region, type', () => {
    expect(deriveDefaultLabel(['ubuntu', 'newark', '1gb'], [])).toBe(
      'ubuntu-newark-1gb'
    );
  });

  it('works without all params', () => {
    expect(deriveDefaultLabel(['ubuntu', 'newark'], [])).toBe('ubuntu-newark');
    expect(deriveDefaultLabel(['1gb'], [])).toBe('1gb');
    expect(deriveDefaultLabel(['ubuntu', 'newark'], [])).toBe('ubuntu-newark');
  });

  it('clamps length when necessary', () => {
    expect(deriveDefaultLabel(['really-long-linode-label', 'newark'], [])).toBe(
      'really-long-l-newark'
    );
    expect(
      deriveDefaultLabel(
        ['really-long-linode-label', 'us-east-another-region'],
        []
      )
    ).toBe('really-long-l-us-east-anoth');
    expect(deriveDefaultLabel(['123456789', '10', '11', '12131415'], [])).toBe(
      '123456789-10-11-12131415'
    );
    expect(
      deriveDefaultLabel(['123456789', '10', '11', '12131415161718192021'], [])
    ).toBe('123456-10-11-121314');
  });

  it('ensures no double dashes or underscores are present', () => {
    expect(
      deriveDefaultLabel(
        ['really-long-l-inode-label', 'us-east-another-region'],
        []
      )
    ).toBe('really-long-l-us-east-anoth');
    expect(deriveDefaultLabel(['this-is__impossible', 'us-west'], [])).toBe(
      'this-is_impossible-us-west'
    );
  });

  it('adds an incrementor', () => {
    expect(deriveDefaultLabel(['my', 'label'], ['my-label'])).toBe(
      'my-label-001'
    );
    expect(deriveDefaultLabel(['my', 'label'], ['my-label-001'])).toBe(
      'my-label'
    );
    expect(
      deriveDefaultLabel(['my', 'label'], ['my-label', 'my-label-002'])
    ).toBe('my-label-001');
    expect(
      deriveDefaultLabel(
        ['my', 'label'],
        ['my-label', 'my-label-001', 'my-label003']
      )
    ).toBe('my-label-002');
  });
});
