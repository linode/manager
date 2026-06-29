import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShareGroupDetails } from './ShareGroupDetails';

const queryMocks = vi.hoisted(() => ({
  deleteSharegroupMember: vi.fn(),
  deleteShareGroupImageMutation: {
    error: undefined,
    isPending: false,
    mutateAsync: vi.fn(),
  },
  getAPIFilterFromQuery: vi.fn(),
  navigate: vi.fn(),
  enqueueSnackbar: vi.fn(),
  pagination: {
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    page: 1,
    pageSize: 25,
  },
  search: {
    imagesQuery: undefined as string | undefined,
    membersQuery: undefined as string | undefined,
    query: undefined as string | undefined,
  },
  useNavigate: vi.fn(),
  useOrderV2: vi.fn(),
  usePaginationV2: vi.fn(),
  useParams: vi.fn(),
  usePreferences: vi.fn(),
  useProfile: vi.fn(),
  useDeleteShareGroupImageMutation: vi.fn(),
  useSearch: vi.fn(),
  useDeleteShareGroupMemberMutation: vi.fn(),
  useShareGroupQuery: vi.fn(),
  useShareGroupsImagesQuery: vi.fn(),
  useShareGroupsMembersQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDeleteShareGroupImageMutation:
      queryMocks.useDeleteShareGroupImageMutation,
    usePreferences: queryMocks.usePreferences,
    useProfile: queryMocks.useProfile,
    useDeleteShareGroupMemberMutation:
      queryMocks.useDeleteShareGroupMemberMutation,
    useShareGroupQuery: queryMocks.useShareGroupQuery,
    useShareGroupsImagesQuery: queryMocks.useShareGroupsImagesQuery,
    useShareGroupsMembersQuery: queryMocks.useShareGroupsMembersQuery,
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    enqueueSnackbar: queryMocks.enqueueSnackbar,
  };
});

vi.mock('@linode/search', () => ({
  getAPIFilterFromQuery: queryMocks.getAPIFilterFromQuery,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@akamai/cds-components/react', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} type="button">
      {children}
    </button>
  ),
  Checkbox: ({
    checked,
    children,
    onChange,
  }: {
    checked: boolean;
    children: React.ReactNode;
    onChange: () => void;
  }) => (
    <label>
      <input checked={checked} onChange={onChange} type="checkbox" />
      {children}
    </label>
  ),
  Pagination: () => <div>pagination</div>,
}));

vi.mock('src/hooks/useOrderV2', () => ({
  useOrderV2: queryMocks.useOrderV2,
}));

vi.mock('src/hooks/usePaginationV2', () => ({
  usePaginationV2: queryMocks.usePaginationV2,
}));

vi.mock('src/components/CopyTooltip/CopyTooltip', () => ({
  CopyTooltip: ({ text }: { text: string }) => (
    <span>{text ? 'Copy' : ''}</span>
  ),
}));

vi.mock('src/components/DocumentTitle', () => ({
  DocumentTitleSegment: ({ segment }: { segment: string }) => (
    <div data-testid="document-title">{segment}</div>
  ),
}));

vi.mock('src/components/LandingHeader', () => ({
  LandingHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock(
  'src/components/DebouncedSearchTextField/DebouncedSearchTextField',
  () => ({
    DebouncedSearchTextField: (props: {
      onSearch: (query: string) => void;
      placeholder: string;
    }) => {
      const queryText = `query-${props.placeholder}`;
      return (
        <button onClick={() => props.onSearch(queryText)} type="button">
          {`trigger-${props.placeholder}`}
        </button>
      );
    },
  })
);

describe('ShareGroupDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.deleteShareGroupImageMutation = {
      error: undefined,
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    };

    queryMocks.search = {
      imagesQuery: undefined,
      membersQuery: undefined,
      query: undefined,
    };

    queryMocks.useNavigate.mockReturnValue(queryMocks.navigate);
    queryMocks.useParams.mockReturnValue({ shareGroupId: 'share-group-123' });
    queryMocks.useSearch.mockImplementation(() => queryMocks.search);
    queryMocks.usePreferences.mockReturnValue({ data: true });
    queryMocks.useProfile.mockReturnValue({ data: { timezone: 'UTC' } });
    queryMocks.useDeleteShareGroupMemberMutation.mockReturnValue({
      mutateAsync: queryMocks.deleteSharegroupMember,
      isPending: false,
    });
    queryMocks.deleteSharegroupMember.mockResolvedValue({});
    queryMocks.useDeleteShareGroupImageMutation.mockImplementation(
      () => queryMocks.deleteShareGroupImageMutation
    );

    queryMocks.getAPIFilterFromQuery.mockReturnValue({
      error: undefined,
      filter: {},
    });

    queryMocks.usePaginationV2.mockReturnValue(queryMocks.pagination);

    queryMocks.useOrderV2.mockImplementation(
      (params?: { data?: unknown[] }) => ({
        handleOrderChange: vi.fn(),
        order: 'asc',
        orderBy: 'label',
        sortedData: params?.data ?? [],
      })
    );

    queryMocks.useShareGroupQuery.mockReturnValue({
      data: {
        description: 'Ubuntu images for dev team',
        label: 'Dev Team Share Group',
        uuid: 'uuid-123',
      },
      error: undefined,
      isLoading: false,
    });

    queryMocks.useShareGroupsImagesQuery.mockReturnValue({
      data: {
        data: [
          {
            created: '2026-01-01T00:00:00',
            id: 'private/1001',
            label: 'Ubuntu-22.04',
          },
        ],
      },
      error: undefined,
      isFetching: false,
    });

    queryMocks.useShareGroupsMembersQuery.mockReturnValue({
      data: {
        data: [
          {
            label: 'active-member',
            status: 'active',
            token_uuid: 'token-active',
            updated: '2026-01-02T00:00:00',
          },
          {
            label: 'inactive-member',
            status: 'inactive',
            token_uuid: 'token-inactive',
            updated: '2026-01-03T00:00:00',
          },
        ],
      },
      error: undefined,
      isFetching: false,
    });
  });

  it('renders share group details for the current route params', () => {
    const { getAllByText, getByText } = renderWithTheme(<ShareGroupDetails />);

    expect(queryMocks.useShareGroupQuery).toHaveBeenCalledWith(
      'share-group-123'
    );
    expect(getAllByText('Dev Team Share Group')).toHaveLength(2);
    expect(getByText('Ubuntu images for dev team')).toBeVisible();
  });

  it('navigates with imagesQuery when searching shared images', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderWithTheme(<ShareGroupDetails />);

    await user.click(getByRole('button', { name: 'trigger-Search images' }));

    expect(queryMocks.navigate).toHaveBeenCalledTimes(1);
    const payload = queryMocks.navigate.mock.calls[0][0];

    expect(payload.to).toBe('/images/share-groups/owned-groups/$shareGroupId');
    expect(payload.params).toEqual({ shareGroupId: 'share-group-123' });
    expect(payload.search({ foo: 'bar' })).toEqual({
      foo: 'bar',
      imagesQuery: 'query-Search images',
      page: undefined,
    });
  });

  it('navigates with membersQuery when searching group members', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderWithTheme(<ShareGroupDetails />);

    await user.click(
      getByRole('button', { name: 'trigger-Search group members' })
    );

    expect(queryMocks.navigate).toHaveBeenCalledTimes(1);
    const payload = queryMocks.navigate.mock.calls[0][0];

    expect(payload.to).toBe('/images/share-groups/owned-groups/$shareGroupId');
    expect(payload.params).toEqual({ shareGroupId: 'share-group-123' });
    expect(payload.search({ foo: 'bar' })).toEqual({
      foo: 'bar',
      membersQuery: 'query-Search group members',
      page: undefined,
    });
  });

  it('hides inactive members when inactive-members checkbox is unchecked', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <ShareGroupDetails />
    );

    expect(getByText('active-member')).toBeVisible();
    expect(getByText('inactive-member')).toBeVisible();

    await user.click(getByLabelText('Show inactive members'));

    expect(getByText('active-member')).toBeVisible();
    expect(queryByText('inactive-member')).not.toBeInTheDocument();
  });

  it('shows image action menu options', async () => {
    const user = userEvent.setup();
    const { findByLabelText, findByText } = renderWithTheme(
      <ShareGroupDetails />
    );

    const actionMenu = await findByLabelText('Action menu for shared images');
    await user.click(actionMenu);

    expect(await findByText('Edit Details')).toBeVisible();
    expect(await findByText('Remove from the Group')).toBeVisible();
  });

  it('opens the remove image confirmation dialog from image action menu', async () => {
    const user = userEvent.setup();
    const { findByLabelText, findByText } = renderWithTheme(
      <ShareGroupDetails />
    );

    const actionMenu = await findByLabelText('Action menu for shared images');
    await user.click(actionMenu);
    await user.click(await findByText('Remove from the Group'));

    expect(
      await findByText('Remove Ubuntu-22.04 from Dev Team Share Group')
    ).toBeVisible();
    expect(
      await findByText(
        'Are you sure you want to remove this image from this share group?'
      )
    ).toBeVisible();
  });

  it('removes image from group when confirmed in dialog', async () => {
    const user = userEvent.setup();
    const { findByLabelText, findByRole, findByText } = renderWithTheme(
      <ShareGroupDetails />
    );

    const actionMenu = await findByLabelText('Action menu for shared images');
    await user.click(actionMenu);
    await user.click(await findByText('Remove from the Group'));
    await user.click(await findByRole('button', { name: 'Remove Image' }));

    expect(
      queryMocks.deleteShareGroupImageMutation.mutateAsync
    ).toHaveBeenCalledWith({
      imageId: 'private/1001',
      shareGroupId: 'share-group-123',
    });
  });

  it('shows zero state in members table when there are no members', () => {
    queryMocks.useShareGroupsMembersQuery.mockReturnValue({
      data: {
        data: [],
      },
      error: undefined,
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<ShareGroupDetails />);

    expect(getByText('No group members')).toBeVisible();
    expect(
      getByText("Click 'Add Members' to share images with other users.")
    ).toBeVisible();
  });

  it('shows zero state in images table when there are no shared images', () => {
    queryMocks.useShareGroupsImagesQuery.mockReturnValue({
      data: {
        data: [],
      },
      error: undefined,
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<ShareGroupDetails />);

    expect(getByText('No shared images')).toBeVisible();
    expect(
      getByText(
        "Click 'Add Images' to share your custom images with members of this group."
      )
    ).toBeVisible();
  });

  it('opens revoke confirmation dialog and closes it when canceled', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <ShareGroupDetails />
    );

    await user.click(getAllByRole('button', { name: 'Revoke Access' })[0]);

    expect(
      getByText('Revoke access to Dev Team Share Group for active-member?')
    ).toBeVisible();
    expect(
      getByText(
        'Are you sure you want to revoke access to this share group for this user?'
      )
    ).toBeVisible();

    const dialog = getByTestId('drawer');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(
        getByText('Revoke access to Dev Team Share Group for active-member?')
      ).not.toBeVisible();
    });
  });

  it('revokes member access from confirmation dialog', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByTestId } = renderWithTheme(
      <ShareGroupDetails />
    );

    await user.click(getAllByRole('button', { name: 'Revoke Access' })[0]);
    const dialog = getByTestId('drawer');
    await user.click(
      within(dialog).getByRole('button', { name: 'Revoke Access' })
    );

    await waitFor(() => {
      expect(queryMocks.deleteSharegroupMember).toHaveBeenCalledWith({
        shareGroupId: 'share-group-123',
        token_uuid: 'token-active',
      });
    });
    expect(queryMocks.enqueueSnackbar).toHaveBeenCalledWith(
      "User's access to the share group was revoked",
      {
        variant: 'success',
      }
    );
  });
});
