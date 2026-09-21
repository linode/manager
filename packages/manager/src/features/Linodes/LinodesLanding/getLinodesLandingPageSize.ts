import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter.utils';

/**
 * Page size for Linodes landing.
 *
 * If every Linode in maintenance fits on a standard page, bump so they stay
 * visible. If they do not (would be Infinity / Show All), keep the user's
 * page size instead of forcing 100.
 */
export const getLinodesLandingPageSize = (
  numberOfLinodesWithMaintenance: number,
  infinitePageSize: number
) => {
  if (numberOfLinodesWithMaintenance <= infinitePageSize) {
    return infinitePageSize;
  }

  const pageSize = getMinimumPageSizeForNumberOfItems(
    numberOfLinodesWithMaintenance
  );

  return pageSize === Infinity ? infinitePageSize : pageSize;
};
