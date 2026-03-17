import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShareGroupsView } from './ShareGroupsView';

import type { Filter } from '@linode/api-v4';
import type { ShareGroupsType } from 'src/features/Images/utils';

type SearchMock = { query?: string } & Record<string, unknown>;

type ShareGroupsConfigMock = {
  buttonProps?: null | {
    buttonText: string;
    disabledToolTipText: string;
    navigateTo: string;
  };
  columns: Array<{ name: string; sortableProps: { label: string } }>;
  description: string;
  docsLink: { href: string; label: string };
  emptyMessage: { instruction: string; main: string };
  eventCategory: string;
  orderByDefault: string;
  orderDefault: 'asc' | 'desc';
  preferenceKey: string;
  title: string;
};

const queryMocks = vi.hoisted(() => {
  const defaultOwnedConfig = {
    title: 'Owned groups',
    description: 'Owned groups description',
    docsLink: {
      href: 'https://example.com/docs',
      label: 'Image sharing',
    },
    columns: [{ name: 'Group', sortableProps: { label: 'label' } }],
    emptyMessage: {
      main: 'No Share groups to display',
      instruction: 'Create your first share group',
    },
    eventCategory: 'shareGroups',
    orderByDefault: 'label',
    orderDefault: 'asc' as const,
    preferenceKey: 'shareGroupsOwned',
    buttonProps: {
      buttonText: 'Create Share Group',
      navigateTo: '/images/share-groups/create',
      disabledToolTipText:
        "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.",
    },
  };

  return {
    defaultOwnedConfig,
    filter: {} as Filter,
    getAPIFilterFromQuery: vi.fn(),
    navigate: vi.fn(),
    onSearchWithText: 'new-search',
    pagination: {
      page: 1,
      pageSize: 25,
      handlePageChange: vi.fn(),
      handlePageSizeChange: vi.fn(),
    },
    search: {} as SearchMock,
    searchParseError: undefined as undefined | { message: string },
    shareGroupsConfig: {
      'owned-groups': defaultOwnedConfig,
      'joined-groups': {
        ...defaultOwnedConfig,
        title: 'Joined groups',
        buttonProps: null,
      },
      'membership-requests': {
        ...defaultOwnedConfig,
        title: 'Membership requests',
        buttonProps: null,
      },
    } as Record<ShareGroupsType, ShareGroupsConfigMock>,
    shareGroupsQueryResult: {
      data: { data: [], results: 0 } as
        | undefined
        | { data: unknown[]; results: number },
      error: null as unknown,
      isFetching: false,
      isLoading: false,
    },
    tableProps: null as unknown,
    useNavigate: vi.fn(),
    useOrderV2: vi.fn(),
    usePaginationV2: vi.fn(),
    usePermissions: vi.fn(),
    useSearch: vi.fn(),
    useShareGroupsQuery: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useShareGroupsQuery: queryMocks.useShareGroupsQuery,
  };
});

vi.mock('@linode/search', () => ({
  getAPIFilterFromQuery: queryMocks.getAPIFilterFromQuery,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

vi.mock('src/hooks/useOrderV2', () => ({
  useOrderV2: queryMocks.useOrderV2,
}));

vi.mock('src/hooks/usePaginationV2', () => ({
  usePaginationV2: queryMocks.usePaginationV2,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@linode/ui', async () => {
  const actual = await vi.importActual('@linode/ui');
  return {
    ...actual,
    CircleProgress: () => <div data-testid="circle-progress" />,
    ErrorState: ({ errorText }: { errorText: string }) => (
      <div>{errorText}</div>
    ),
  };
});

vi.mock('src/components/DocumentTitle', () => ({
  DocumentTitleSegment: ({ segment }: { segment: string }) => (
    <div data-testid="document-title">{segment}</div>
  ),
}));

vi.mock(
  'src/components/DebouncedSearchTextField/DebouncedSearchTextField',
  () => ({
    DebouncedSearchTextField: (props: unknown) => {
      const searchProps = props as {
        errorText?: string;
        onSearch: (query: string) => void;
        value?: string;
      };

      return (
        <div>
          <div data-testid="search-error">{searchProps.errorText ?? ''}</div>
          <div data-testid="search-value">{searchProps.value ?? ''}</div>
          <button
            onClick={() => searchProps.onSearch(queryMocks.onSearchWithText)}
          >
            trigger-search
          </button>
          <button onClick={() => searchProps.onSearch('')}>
            trigger-clear-search
          </button>
        </div>
      );
    },
  })
);

vi.mock('./ShareGroupsTable', () => ({
  ShareGroupsTable: (props: unknown) => {
    const tableProps = props as {
      headerProps?: { buttonProps?: { onButtonClick: () => void } };
    };

    queryMocks.tableProps = props;
    return (
      <div>
        <div data-testid="table-rendered">table-rendered</div>
        <button
          onClick={() => tableProps.headerProps?.buttonProps?.onButtonClick()}
        >
          trigger-header-button
        </button>
      </div>
    );
  },
}));

vi.mock('./shareGroupsTabsConfig', () => ({
  SHAREGROUPS_CONFIG: queryMocks.shareGroupsConfig,
}));

describe('For Owned groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.navigate = vi.fn();
    queryMocks.tableProps = null;
    queryMocks.onSearchWithText = 'new-search';
    queryMocks.filter = {};
    queryMocks.searchParseError = undefined;
    queryMocks.search = {};

    queryMocks.shareGroupsConfig['owned-groups'] = {
      ...queryMocks.defaultOwnedConfig,
    };

    queryMocks.useNavigate.mockReturnValue(queryMocks.navigate);
    queryMocks.useSearch.mockImplementation(() => queryMocks.search);
    queryMocks.usePermissions.mockReturnValue({
      data: { create_image: true },
    });
    queryMocks.usePaginationV2.mockReturnValue(queryMocks.pagination);
    queryMocks.useOrderV2.mockReturnValue({
      handleOrderChange: vi.fn(),
      order: 'asc',
      orderBy: 'label',
    });
    queryMocks.getAPIFilterFromQuery.mockImplementation(() => ({
      error: queryMocks.searchParseError,
      filter: queryMocks.filter,
    }));
    queryMocks.useShareGroupsQuery.mockImplementation(
      () => queryMocks.shareGroupsQueryResult
    );

    queryMocks.shareGroupsQueryResult = {
      data: { data: [], results: 0 },
      error: null,
      isFetching: false,
      isLoading: false,
    };
  });

  it('renders loading state', () => {
    queryMocks.shareGroupsQueryResult = {
      data: undefined,
      error: null,
      isFetching: true,
      isLoading: true,
    };

    const { getByTestId, queryByTestId } = renderWithTheme(
      <ShareGroupsView type="owned-groups" />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
    expect(queryByTestId('table-rendered')).not.toBeInTheDocument();
  });

  it('renders error state when initial load fails and no search query exists', () => {
    queryMocks.shareGroupsQueryResult = {
      data: undefined,
      error: [{ reason: 'Request failed' }],
      isFetching: false,
      isLoading: false,
    };
    queryMocks.search = { query: undefined };

    const { getByText, getByTestId, queryByTestId } = renderWithTheme(
      <ShareGroupsView type="owned-groups" />
    );

    expect(getByTestId('document-title')).toHaveTextContent('Share groups');
    expect(
      getByText(
        'There was an error loading your share groups. Please try again.'
      )
    ).toBeVisible();
    expect(queryByTestId('table-rendered')).not.toBeInTheDocument();
  });

  it('renders search and table with derived props on success', () => {
    const handleOrderChange = vi.fn();
    queryMocks.search = { query: 'owned' };
    queryMocks.filter = { label: { '+contains': 'owned' } };
    queryMocks.searchParseError = { message: 'Invalid query syntax' };
    queryMocks.useOrderV2.mockReturnValue({
      handleOrderChange,
      order: 'desc',
      orderBy: 'created',
    });
    queryMocks.shareGroupsQueryResult = {
      data: {
        data: [{ id: 1, label: 'Group A' }],
        results: 1,
      },
      error: null,
      isFetching: false,
      isLoading: false,
    };

    const { getByTestId } = renderWithTheme(
      <ShareGroupsView type="owned-groups" />
    );

    expect(getByTestId('table-rendered')).toBeVisible();
    expect(getByTestId('search-error')).toHaveTextContent(
      'Invalid query syntax'
    );
    expect(getByTestId('search-value')).toHaveTextContent('owned');

    expect(queryMocks.useShareGroupsQuery).toHaveBeenCalledWith(
      { page: 1, page_size: 25 },
      {
        '+order': 'desc',
        '+order_by': 'created',
        label: { '+contains': 'owned' },
      }
    );

    expect(queryMocks.tableProps).toMatchObject({
      columns: queryMocks.shareGroupsConfig['owned-groups'].columns,
      emptyMessage: queryMocks.shareGroupsConfig['owned-groups'].emptyMessage,
      eventCategory: queryMocks.shareGroupsConfig['owned-groups'].eventCategory,
      handleOrderChange,
      order: 'desc',
      orderBy: 'created',
      pagination: {
        page: 1,
        pageSize: 25,
        count: 1,
      },
      query: 'owned',
      shareGroups: [{ id: 1, label: 'Group A' }],
    });
  });

  it('navigates on search and resets page while preserving existing search state', async () => {
    const user = userEvent.setup();
    queryMocks.search = { query: 'old', region: 'us-east' };
    queryMocks.onSearchWithText = 'new-search';

    const { getByText } = renderWithTheme(
      <ShareGroupsView type="joined-groups" />
    );

    await user.click(getByText('trigger-search'));

    expect(queryMocks.navigate).toHaveBeenCalledTimes(1);
    const navigatePayload = queryMocks.navigate.mock.calls[0][0];
    expect(navigatePayload.to).toBe('/images/share-groups/$shareGroupsType');
    expect(navigatePayload.params).toEqual({
      shareGroupsType: 'joined-groups',
    });

    expect(
      navigatePayload.search({ query: 'old', page: 3, region: 'us-east' })
    ).toEqual({
      query: 'new-search',
      page: undefined,
      region: 'us-east',
    });
  });

  it('omits header button props when config has no button config', () => {
    queryMocks.shareGroupsConfig['owned-groups'] = {
      ...queryMocks.defaultOwnedConfig,
      buttonProps: null,
    };

    renderWithTheme(<ShareGroupsView type="owned-groups" />);

    const tableProps = queryMocks.tableProps as {
      headerProps: { buttonProps?: unknown };
    };

    expect(tableProps.headerProps.buttonProps).toBeUndefined();
  });
});
