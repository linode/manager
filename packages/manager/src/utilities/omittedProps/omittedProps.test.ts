import { omittedProps } from './';

describe('omittedProps function', () => {
  it('should return true if the prop is not in the list of omitted props', () => {
    const omitted = ['compactX', 'compactY'];
    const prop = 'validProp';
    const result = omittedProps(omitted, prop);

    expect(result).toBe(true);
  });

  it('should return false if the prop is in the list of omitted props', () => {
    const omitted = ['compactX', 'compactY'];
    const prop = 'compactX';
    const result = omittedProps(omitted, prop);

    expect(result).toBe(false);
  });

  it('should return true for an empty omitted props list', () => {
    const omitted = [''];
    const prop = 'someProp';
    const result = omittedProps(omitted, prop);

    expect(result).toBe(true);
  });
});
