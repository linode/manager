/**
 * Returns a slice of `allData` corresponding to a page of paginated data.
 *
 * @param allData - Data from which to get paginated slice.
 * @param page - Page to retrieve.
 * @param pageSize - Number of results in one page.
 */
export const getPaginatedSlice = <T>(
  allData: T[],
  page: number,
  pageSize: number = 500
) => {
  const dataStart = Math.min((page - 1) * pageSize, allData.length);
  const dataEnd = Math.min(page * pageSize, allData.length);

  return allData.slice(dataStart, dataEnd);
};
