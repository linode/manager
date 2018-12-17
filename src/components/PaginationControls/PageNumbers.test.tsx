import { pageNumbersToRender } from './PageNumbers';

describe('pageNumbersToRender', () => {
  it('should return pages 1 through 5', () => {
    const page3 = pageNumbersToRender(3, 100)
    const page4 = pageNumbersToRender(4, 105);
    const page0 = pageNumbersToRender(0, 10045);

    const arrOf5 = [1, 2, 3, 4, 5];

    expect(page3).toEqual(arrOf5);
    expect(page4).toEqual(arrOf5);
    expect(page0).toEqual(arrOf5);
  });

  it('should return last 5 pages', () => {
    const page34 = pageNumbersToRender(34, 35);
    const page73 = pageNumbersToRender(73, 76);

    expect(page34).toEqual([31, 32, 33, 34, 35]);
    expect(page73).toEqual([72, 73, 74, 75, 76]);
  });

  it('should return 2 pages above and 2 pages below current page', () => {
    const page82 = pageNumbersToRender(82, 800);
    const page93 = pageNumbersToRender(93, 10000);

    expect(page82).toEqual([80, 81, 82, 83, 84]);
    expect(page93).toEqual([91, 92, 93, 94, 95])
  });
});