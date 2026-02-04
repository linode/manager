import { queryClientFactory } from '@linode/queries';
import { act, renderHook, waitFor } from '@testing-library/react';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { usePaginationV2 } from './usePaginationV2';

import type { UsePaginationV2Props } from './usePaginationV2';
import type { TableSearchParams } from 'src/routes/types';

const mockNavigate = vi.fn();
const mockUseSearch = vi.fn();
let currentQueryClient: ReturnType<typeof queryClientFactory> =
  queryClientFactory();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearch: (options: TableSearchParams) => mockUseSearch(options),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useMutatePreferences: () => ({
      mutateAsync: mockMutateAsync,
    }),
  };
});

const mockMutateAsync = vi.fn();

describe('usePaginationV2', () => {
  let queryClient: ReturnType<typeof queryClientFactory>;

  const mockPreferences = {
    pageSizes: {
      'test-key': 50,
    },
  };

  beforeEach(() => {
    queryClient = queryClientFactory();
    currentQueryClient = queryClient;

    mockMutateAsync.mockImplementation((data) => {
      const existingPreferences = currentQueryClient.getQueryData([
        'profile',
        'preferences',
      ]);
      currentQueryClient.setQueryData(['profile', 'preferences'], {
        ...(existingPreferences ?? {}),
        ...data,
      });
      return Promise.resolve(data);
    });

    queryClient.setQueryData(['profile', 'preferences'], mockPreferences);

    queryClient.setQueryDefaults(['profile', 'preferences'], {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

    // Default mock for useSearch
    mockUseSearch.mockReturnValue({
      order: null,
      orderBy: null,
      page: null,
      pageSize: null,
    });

    mockNavigate.mockClear();
    mockMutateAsync.mockClear();
  });

  const defaultProps: UsePaginationV2Props<TableSearchParams> = {
    currentRoute: '/linodes',
    initialPage: 1,
    preferenceKey: 'test-key',
  };

  describe('Initialization', () => {
    it('should initialize with default values from preferences', async () => {
      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          handlePageChange: expect.any(Function),
          handlePageSizeChange: expect.any(Function),
          page: 1,
          pageSize: 50,
          paginatedData: [],
        });
      });
    });

    it('should use MIN_PAGE_SIZE when no preference exists', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            preferenceKey: 'non-existent-key',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.pageSize).toBe(MIN_PAGE_SIZE);
      });
    });

    it('should use custom defaultPageSize when provided', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            preferenceKey: 'non-existent-key',
            defaultPageSize: 100,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.pageSize).toBe(100);
      });
    });

    it('should use custom initialPage when provided', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            initialPage: 3,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(3);
      });
    });

    it('should use defaultPageSize over MIN_PAGE_SIZE when no preferenceKey', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            currentRoute: '/linodes',
            preferenceKey: '',
            defaultPageSize: 75,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.pageSize).toBe(75);
      });
    });
  });

  describe('URL Search Params', () => {
    it('should read page from URL search params', async () => {
      mockUseSearch.mockReturnValue({
        page: 3,
        pageSize: null,
      });

      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      await waitFor(() => {
        expect(result.current.page).toBe(3);
      });
    });

    it('should read pageSize from URL search params', async () => {
      mockUseSearch.mockReturnValue({
        page: null,
        pageSize: 100,
      });

      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(100);
      });
    });

    it('should read both page and pageSize from URL search params', async () => {
      mockUseSearch.mockReturnValue({
        page: 2,
        pageSize: 75,
      });

      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(75);
      });
    });

    it('should read prefixed params from URL', async () => {
      mockUseSearch.mockReturnValue({
        'my-prefix-page': 4,
        'my-prefix-pageSize': 200,
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            queryParamsPrefix: 'my-prefix',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(4);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(200);
      });
    });

    it('should prefer prefixed params over non-prefixed', async () => {
      mockUseSearch.mockReturnValue({
        page: 1,
        pageSize: 25,
        'my-prefix-page': 5,
        'my-prefix-pageSize': 150,
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            queryParamsPrefix: 'my-prefix',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(5);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(150);
      });
    });
  });

  describe('Page Changes', () => {
    it('should handle page changes', async () => {
      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        search: expect.any(Function),
        to: '/linodes',
      });

      const searchFn = mockNavigate.mock.calls[0][0].search;
      const prevParams = {
        order: 'asc',
        orderBy: 'name',
        page: 1,
        pageSize: 25,
      };

      await waitFor(() => {
        expect(searchFn(prevParams)).toEqual({
          ...prevParams,
          page: 2,
        });
      });
    });

    it('should handle page changes with queryParamsPrefix', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            queryParamsPrefix: 'test-prefix',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      act(() => {
        result.current.handlePageChange(3);
      });

      const searchFn = mockNavigate.mock.calls[0][0].search;
      const prevParams = {
        order: 'asc',
        orderBy: 'name',
      };

      await waitFor(() => {
        expect(searchFn(prevParams)).toEqual({
          ...prevParams,
          'test-prefix-page': 3,
        });
      });
    });
  });

  describe('Page Size Changes', () => {
    it('should handle page size changes and update preferences', async () => {
      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      act(() => {
        result.current.handlePageSizeChange(100);
      });

      await waitFor(() => {
        const preferences = queryClient.getQueryData([
          'profile',
          'preferences',
        ]);
        expect(preferences).toEqual({
          pageSizes: {
            'test-key': 100,
          },
          // 'test-key' should be undefined,
        });
      });

      // Should navigate twice - once for page size and once for resetting page to 1
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('should not update preferences if no preferenceKey is provided', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            preferenceKey: '',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      const initialPreferences = queryClient.getQueryData([
        'profile',
        'preferences',
      ]);

      act(() => {
        result.current.handlePageSizeChange(25);
      });

      await waitFor(() => {
        const preferences = queryClient.getQueryData([
          'profile',
          'preferences',
        ]);
        expect(preferences).toEqual(initialPreferences);
      });
    });

    it('should reset page to 1 when page size changes', async () => {
      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      act(() => {
        result.current.handlePageSizeChange(50);
      });

      // Second call should be for page reset
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        const pageResetCall = mockNavigate.mock.calls[1][0];
        const searchFn = pageResetCall.search;
        expect(searchFn({})).toMatchObject({ page: 1 });
      });
    });

    it('should handle page size changes with queryParamsPrefix', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            queryParamsPrefix: 'test-prefix',
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      act(() => {
        result.current.handlePageSizeChange(50);
      });

      const navigateCalls = mockNavigate.mock.calls;
      const searchFnForPageSize = navigateCalls[0][0].search;
      const prevParams = {
        order: 'asc',
        orderBy: 'name',
      };

      await waitFor(() => {
        expect(searchFnForPageSize(prevParams)).toEqual({
          ...prevParams,
          'test-prefix-pageSize': 50,
        });
      });
    });
  });

  describe('Custom Search Params', () => {
    it('should handle custom search params', async () => {
      const customSearchParams = (prev: TableSearchParams) => ({
        ...prev,
        customParam: 'test',
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            searchParams: customSearchParams,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      act(() => {
        result.current.handlePageChange(2);
      });

      const searchFn = mockNavigate.mock.calls[0][0].search;
      const prevParams = {
        order: 'asc',
        orderBy: 'name',
        page: 1,
        pageSize: 25,
      };

      await waitFor(() => {
        expect(searchFn(prevParams)).toEqual({
          ...prevParams,
          customParam: 'test',
          page: 2,
        });
      });
    });

    it('should apply custom search params to page size changes', async () => {
      const customSearchParams = (prev: TableSearchParams) => ({
        ...prev,
        filter: 'active',
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            searchParams: customSearchParams,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      act(() => {
        result.current.handlePageSizeChange(100);
      });

      const searchFn = mockNavigate.mock.calls[0][0].search;
      const prevParams = {
        order: 'asc',
        orderBy: 'name',
      };

      await waitFor(() => {
        expect(searchFn(prevParams)).toEqual({
          ...prevParams,
          filter: 'active',
          pageSize: 100,
        });
      });
    });
  });

  describe('Client-side Pagination', () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));

    it('should slice data correctly for the first page', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(25);
      });

      await waitFor(() => {
        expect(result.current.paginatedData[0]).toEqual({
          id: 1,
          name: 'Item 1',
        });
      });

      await waitFor(() => {
        expect(result.current.paginatedData[24]).toEqual({
          id: 25,
          name: 'Item 25',
        });
      });
    });

    it('should slice data correctly for the second page', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({
        page: 2,
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(25);
      });

      await waitFor(() => {
        expect(result.current.paginatedData[0]).toEqual({
          id: 26,
          name: 'Item 26',
        });
      });

      await waitFor(() => {
        expect(result.current.paginatedData[24]).toEqual({
          id: 50,
          name: 'Item 50',
        });
      });
    });

    it('should slice data correctly for the last partial page', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({
        page: 4,
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(25);
      });

      await waitFor(() => {
        expect(result.current.paginatedData[0]).toEqual({
          id: 76,
          name: 'Item 76',
        });
      });

      await waitFor(() => {
        expect(result.current.paginatedData[24]).toEqual({
          id: 100,
          name: 'Item 100',
        });
      });
    });

    it('should handle empty data array', async () => {
      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: [],
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toEqual([]);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });

    it('should handle single page of data', async () => {
      const smallData = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: smallData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(10);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });

    it('should recalculate pagination when pageSize changes', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      const { result, rerender } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(25);
      });

      // Change page size
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 50 },
      });

      mockUseSearch.mockReturnValue({
        pageSize: 50,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(50);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(50);
      });
    });

    it('should return empty array when clientSidePaginationData is undefined', async () => {
      const { result } = renderHook(() => usePaginationV2(defaultProps), {
        wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
      });

      await waitFor(() => {
        expect(result.current.paginatedData).toEqual([]);
      });
    });
  });

  describe('Page Clamping', () => {
    const mockData = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

    it('should clamp page to maxPage when page exceeds total pages', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({ page: 5 });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should not clamp page when within valid range', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({ page: 2 });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      // Should not trigger navigation since page is valid
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle page clamping to 1 for empty data', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({ page: 5 });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: [],
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should auto-reset page when data changes and current page becomes invalid', async () => {
      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({ page: 3 });

      const initialData = Array.from({ length: 75 }, (_, i) => ({ id: i + 1 }));

      const { result, rerender } = renderHook(
        ({ data }: { data: typeof initialData }) =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: data,
          }),
        {
          initialProps: { data: initialData },
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(3);
      });

      mockNavigate.mockClear();

      // Reduce data so page 3 no longer exists
      const reducedData = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
      rerender({ data: reducedData });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle full pagination flow with client-side data', async () => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));

      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      // Initial state
      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(25);
      });

      await waitFor(() => {
        expect(result.current.paginatedData).toHaveLength(25);
      });

      // Change page
      act(() => {
        result.current.handlePageChange(2);
      });

      mockUseSearch.mockReturnValue({ page: 2 });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Change page size
      act(() => {
        result.current.handlePageSizeChange(50);
      });

      await waitFor(() => {
        const preferences = queryClient.getQueryData([
          'profile',
          'preferences',
        ]);
        expect(preferences).toMatchObject({
          pageSizes: {
            'test-key': 50,
          },
        });
      });
    });

    it('should work with queryParamsPrefix throughout full flow', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));

      queryClient.setQueryData(['profile', 'preferences'], {
        pageSizes: { 'test-key': 25 },
      });

      mockUseSearch.mockReturnValue({
        'prefix-page': 1,
        'prefix-pageSize': 25,
      });

      const { result } = renderHook(
        () =>
          usePaginationV2({
            ...defaultProps,
            queryParamsPrefix: 'prefix',
            clientSidePaginationData: mockData,
          }),
        {
          wrapper: ({ children }) => wrapWithTheme(children, { queryClient }),
        }
      );

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(25);
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      const searchFn = mockNavigate.mock.calls[0][0].search;
      expect(searchFn({})).toMatchObject({
        'prefix-page': 2,
      });
    });
  });
});
