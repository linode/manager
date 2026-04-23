import { convertResourceMetric, pluralizeMetric } from './utils';

const queryMocks = vi.hoisted(() => ({
  useObjectStorageEndpoints: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/object-storage/queries', () => {
  const actual = vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageEndpoints: queryMocks.useObjectStorageEndpoints,
  };
});

describe('convertResourceMetric', () => {
  it('should convert the resource metric to a human readable format', () => {
    const resourceMetric = 'byte';
    const usage = 1e6;
    const limit = 1e8;

    const result = convertResourceMetric({
      initialResourceMetric: resourceMetric,
      initialUsage: usage,
      initialLimit: limit,
    });

    expect(result).toEqual({
      convertedLimit: 95.4,
      convertedResourceMetric: 'MB',
      convertedUsage: 0.95,
    });
  });
});

describe('pluralizeMetric', () => {
  it('should not pluralize if the value is 1', () => {
    const value = 1;
    const unit = 'CPU';

    const result = pluralizeMetric(value, unit);

    expect(result).toEqual('CPU');
  });

  it('should pluralize the resource metric if the value is greater than 1', () => {
    const value = 100;
    const unit = 'CPU';

    const result = pluralizeMetric(value, unit);

    expect(result).toEqual('CPUs');
  });
});
