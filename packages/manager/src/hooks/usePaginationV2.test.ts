import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithThemeAndRouter } from 'src/utilities/testHelpers';

import { usePaginationV2 } from './usePaginationV2';

import type { UsePaginationV2Props } from './usePaginationV2';
import type { TableSearchParams } from 'src/routes/types';

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearch: () => ({
      order: undefined,
      orderBy: undefined,
      page: undefined,
      pageSize: undefined,
    }),
  };
});

describe('usePaginationV2', () => {
  const mockUpdatePreferences = vi.fn();
  const mockPreferences = {
    pageSizes: {
      'test-key': 50,
    },
  };

  beforeEach(() => {
    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json(mockPreferences);
      }),
      http.put('*/profile/preferences', async ({ request }) => {
        const body = await request.json();
        mockUpdatePreferences(body);

        return HttpResponse.json(body);
      })
    );

    mockNavigate.mockClear();
    mockUpdatePreferences.mockClear();
  });

  const defaultProps: UsePaginationV2Props<TableSearchParams> = {
    currentRoute: '/linodes',
    initialPage: 1,
    preferenceKey: 'test-key',
  };

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => usePaginationV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        handlePageChange: expect.any(Function),
        handlePageSizeChange: expect.any(Function),
        page: 1,
        pageSize: 25,
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
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
      }
    );

    await waitFor(() => {
      expect(result.current.pageSize).toBe(MIN_PAGE_SIZE);
    });
  });

  it('should handle page changes', async () => {
    const { result } = renderHook(() => usePaginationV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
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

  it('should handle page size changes', async () => {
    const { result } = renderHook(() => usePaginationV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
    });

    act(() => {
      result.current.handlePageSizeChange(50);
    });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        pageSizes: {
          'test-key': 50,
        },
        'test-key': undefined,
      });
    });

    // Should navigate twice - once for page size and once for resetting page to 1
    expect(mockNavigate).toHaveBeenCalledTimes(2);

    const pageSizeSearchFn = mockNavigate.mock.calls[0][0].search;
    const prevParams = {
      order: 'asc',
      orderBy: 'name',
      page: 2,
      pageSize: 50,
    };

    await waitFor(() => {
      expect(pageSizeSearchFn(prevParams)).toEqual({
        ...prevParams,
        pageSize: 50,
      });
    });
  });

  it('should handle custom search params', async () => {
    const customSearchParams = (prev: any) => ({
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
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
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

  it('should not update preferences if no preferenceKey is provided', async () => {
    const { result } = renderHook(
      () =>
        usePaginationV2({
          ...defaultProps,
          preferenceKey: '',
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
      }
    );

    act(() => {
      result.current.handlePageSizeChange(25);
    });

    await waitFor(() => {
      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });
  });

  it('should handle the queryParamsPrefix for both the page and pageSize params', async () => {
    const { result } = renderHook(
      () =>
        usePaginationV2({
          ...defaultProps,
          queryParamsPrefix: 'test-prefix',
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children),
      }
    );

    act(() => {
      result.current.handlePageChange(2);
      result.current.handlePageSizeChange(50);
    });

    const navigateCalls = mockNavigate.mock.calls;
    const searchFnForPage = navigateCalls[0][0].search;
    const searchFnForPageSize = navigateCalls[1][0].search;
    const prevParams = {
      order: 'asc',
      orderBy: 'name',
    };

    await waitFor(() => {
      expect(searchFnForPage(prevParams)).toEqual({
        ...prevParams,
        page: undefined,
        pageSize: undefined,
        'test-prefix-page': 2,
      });

      expect(searchFnForPageSize(prevParams)).toEqual({
        ...prevParams,
        page: undefined,
        pageSize: undefined,
        'test-prefix-pageSize': 50,
      });
    });
  });
});
