import { omittedProps } from './omittedProps';

describe('omittedProps', () => {
  it('should filter out valid props', () => {
    const filterFn = omittedProps(['propA', 'propB', 'propC']);

    expect(filterFn('propA')).toBe(false);
    expect(filterFn('propB')).toBe(false);
    expect(filterFn('propC')).toBe(false);
    expect(filterFn('propD')).toBe(true);
  });
});
