import { buildXFilters } from './buildXFilters';

describe('buildXFilters', () => {
  it('returns basic order filters when no additional filters provided', () => {
    const result = buildXFilters({
      pagination: {
        order: 'asc',
        orderBy: 'label',
      },
    });

    expect(result).toEqual({
      '+order': 'asc',
      '+order_by': 'label',
    });
  });

  it('handles single additional filter with contains operator', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        label: { '+contains': 'test' },
      },
      pagination: {
        order: 'desc',
        orderBy: 'created',
      },
    });

    expect(result).toEqual({
      '+order': 'desc',
      '+order_by': 'created',
      label: { '+contains': 'test' },
    });
  });

  it('handles additional filters with no pagination', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        label: { '+contains': 'test' },
      },
    });

    expect(result).toEqual({
      label: { '+contains': 'test' },
    });
  });

  it('handles multiple fields with different operators', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        created: { '+gt': 123456789 },
        status: { '+neq': 'deleted' },
      },
      pagination: {
        order: 'asc',
        orderBy: 'status',
      },
    });

    expect(result).toEqual({
      '+order': 'asc',
      '+order_by': 'status',
      created: { '+gt': 123456789 },
      status: { '+neq': 'deleted' },
    });
  });

  it('handles complex filters with AND operator', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        tags: {
          '+and': [{ '+contains': 'production' }, { '+contains': 'database' }],
        },
      },
      pagination: {
        order: 'desc',
        orderBy: 'label',
      },
    });

    expect(result).toEqual({
      '+order': 'desc',
      '+order_by': 'label',
      tags: {
        '+and': [{ '+contains': 'production' }, { '+contains': 'database' }],
      },
    });
  });

  it('handles OR operator with array of strings', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        region: { '+or': ['us-east', 'us-west'] },
      },
      pagination: {
        order: 'asc',
        orderBy: 'region',
      },
    });

    expect(result).toEqual({
      '+order': 'asc',
      '+order_by': 'region',
      region: { '+or': ['us-east', 'us-west'] },
    });
  });

  it('handles numeric comparison operators', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        memory: { '+lt': 1024 },
        size: { '+gte': 50 },
      },
      pagination: {
        order: 'desc',
        orderBy: 'size',
      },
    });

    expect(result).toEqual({
      '+order': 'desc',
      '+order_by': 'size',
      memory: { '+lt': 1024 },
      size: { '+gte': 50 },
    });
  });

  it('handles multiple operators on the same field', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        created: {
          '+gte': 1609459200, // 2021-01-01
          '+lt': 1640995200, // 2022-01-01
        },
      },
      pagination: {
        order: 'asc',
        orderBy: 'created',
      },
    });

    expect(result).toEqual({
      '+order': 'asc',
      '+order_by': 'created',
      created: {
        '+gte': 1609459200,
        '+lt': 1640995200,
      },
    });
  });

  it('can feature an operator as the first key', () => {
    const result = buildXFilters({
      nonPaginationFilters: {
        '+or': [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      },
      pagination: {
        order: 'asc',
        orderBy: 'region',
      },
    });

    expect(result).toEqual({
      '+or': [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
      '+order': 'asc',
      '+order_by': 'region',
    });
  });
});
