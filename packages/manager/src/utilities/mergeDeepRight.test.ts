import { mergeDeepRight } from './mergeDeepRight';

describe('mergeDeepRight function', () => {
  it('should be able to merge simple objects', () => {
    const obj1 = {
      errors: { id: 25 },
    };

    const obj2 = {
      errors: { reason: 'error 2' },
    };

    expect(mergeDeepRight(obj1, obj2)).toStrictEqual({
      errors: { id: 25, reason: 'error 2' },
    });
  });
  it('should be able to pick the second object value for a non object values', () => {
    const obj1 = {
      data: { id: 25 },
      errors: [{ reason: 'error 1' }, { reason: 'error 2' }],
    };

    const obj2 = {
      data: { region: 'us-east' },
      errors: [{ reason: 'error 3' }, { reason: 'error 4' }],
    };

    expect(mergeDeepRight(obj1, obj2)).toStrictEqual({
      data: { id: 25, region: 'us-east' },
      errors: [{ reason: 'error 3' }, { reason: 'error 4' }],
    });
  });
  it('should be able to merge deeply nested objects', () => {
    const obj1 = {
      data: { address: { ipv4: '10.0.0.24', ipv6: '' }, id: 25 },
      errors: [{ reason: 'error 1' }],
    };

    const obj2 = {
      data: { address: { ipv4: '192.168.0.2' }, id: 28 },
      errors: [{ reason: 'error 2' }, { reason: 'error 3' }],
    };

    expect(mergeDeepRight(obj1, obj2)).toStrictEqual({
      data: { address: { ipv4: '192.168.0.2', ipv6: '' }, id: 28 },
      errors: [{ reason: 'error 2' }, { reason: 'error 3' }],
    });
  });
});
