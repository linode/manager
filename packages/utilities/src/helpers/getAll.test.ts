import { describe, expect, it, vi } from 'vitest';

import { linodeFactory } from '../factories';
import { getAll } from './getAll';

describe('getAll', () => {
  it('should fetch the first page, then all other pages', async () => {
    const getLinodes = vi.fn();
    const getAllLinodes = getAll(getLinodes, 25);

    const firstPage = {
      data: linodeFactory.buildList(25),
      page: 1,
      pages: 3,
      results: 75,
    };

    const secondPage = {
      data: linodeFactory.buildList(25),
      page: 2,
      pages: 3,
      results: 75,
    };

    const thirdPage = {
      data: linodeFactory.buildList(25),
      page: 3,
      pages: 3,
      results: 75,
    };

    getLinodes.mockImplementationOnce(async () => firstPage);

    getLinodes.mockImplementationOnce(async () => secondPage);

    getLinodes.mockImplementationOnce(async () => thirdPage);

    const result = await getAllLinodes();

    // Verify the getter function was called the correct number of times total
    expect(getLinodes).toHaveBeenCalledTimes(3);

    // Verify each call to our "getter" function has the correct params

    // The first call should not include a page number, but should include the given page size
    expect(getLinodes).toHaveBeenNthCalledWith(1, { page_size: 25 }, undefined);

    // The second call should include the page number and page size
    expect(getLinodes).toHaveBeenNthCalledWith(
      2,
      { page: 2, page_size: 25 },
      undefined,
    );

    // The third call should include the page number and page size
    expect(getLinodes).toHaveBeenNthCalledWith(
      3,
      { page: 3, page_size: 25 },
      undefined,
    );

    // Verify the data is present and in the correct order
    expect(result.data).toStrictEqual([
      ...firstPage.data,
      ...secondPage.data,
      ...thirdPage.data,
    ]);

    // Verify the result count is correct
    expect(result.results).toBe(75);
  });
});
