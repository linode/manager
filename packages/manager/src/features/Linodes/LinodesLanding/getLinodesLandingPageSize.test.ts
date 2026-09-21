import { getLinodesLandingPageSize } from './getLinodesLandingPageSize';

describe('getLinodesLandingPageSize', () => {
  it('keeps the current page size when maintenance fits on the page', () => {
    expect(getLinodesLandingPageSize(0, 25)).toBe(25);
    expect(getLinodesLandingPageSize(25, 25)).toBe(25);
    expect(getLinodesLandingPageSize(50, 75)).toBe(75);
  });

  it('bumps to the smallest page size that fits maintenance Linodes', () => {
    expect(getLinodesLandingPageSize(26, 25)).toBe(50);
    expect(getLinodesLandingPageSize(51, 25)).toBe(75);
    expect(getLinodesLandingPageSize(76, 25)).toBe(100);
    expect(getLinodesLandingPageSize(100, 25)).toBe(100);
  });

  it('keeps the user page size when maintenance cannot fit on one page', () => {
    expect(getLinodesLandingPageSize(101, 25)).toBe(25);
    expect(getLinodesLandingPageSize(200, 25)).toBe(25);
    expect(getLinodesLandingPageSize(200, 50)).toBe(50);
    expect(getLinodesLandingPageSize(200, 100)).toBe(100);
  });
});
