import { PAGE_SIZES } from './PaginationFooter.constants';

/**
 * Return the minimum page size needed to display a given number of items (`value`).
 * Example: getMinimumPageSizeForNumberOfItems(30, [25, 50, 75]) === 50
 */
export const getMinimumPageSizeForNumberOfItems = (
  numberOfItems: number,
  pageSizes: number[] = PAGE_SIZES
) => {
  // Ensure the page sizes are sorted numerically.
  const sortedPageSizes = [...pageSizes].sort((a, b) => a - b);

  for (const sortedPageSize of sortedPageSizes) {
    if (numberOfItems <= sortedPageSize) {
      return sortedPageSize;
    }
  }
  return Infinity;
};
