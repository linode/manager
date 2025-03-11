import { PAGE_SIZES } from './PaginationFooter.constants';
import { getMinimumPageSizeForNumberOfItems } from './PaginationFooter.utils';

describe('getMinimumPageSizeForNumberOfItems', () => {
  it('should return the minimum page size needed to display a given number of items', () => {
    expect(getMinimumPageSizeForNumberOfItems(24, PAGE_SIZES)).toBe(25);
  });

  it('should return Infinity if the number of items is higher than the highest page size', () => {
    expect(getMinimumPageSizeForNumberOfItems(101, PAGE_SIZES)).toBe(Infinity);
  });
});
