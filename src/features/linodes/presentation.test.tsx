import { formatRegion } from './presentation';
describe('formatRegion', () => {

  it('should handle hyphenated strings', () => {
    const result = formatRegion('us-east');
    expect(result).toEqual('US East');
  });

  it('should should return titlecase value if input is not hyphenated', () => {
    const result = formatRegion('something');
    expect(result).toEqual('Something');
  });
});
