import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { JoinedGroupDetails } from './JoinedGroupDetails';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  usePreferences: vi.fn(),
  useProfile: vi.fn(),
  useShareGroupFromTokenQuery: vi.fn(),
  useShareGroupTokenQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
    useProfile: queryMocks.useProfile,
    useShareGroupFromTokenQuery: queryMocks.useShareGroupFromTokenQuery,
    useShareGroupTokenQuery: queryMocks.useShareGroupTokenQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('./SharedImagesTable', () => ({
  SharedImagesTable: ({ tokenUuid }: { tokenUuid: string }) => (
    <div data-testid="shared-images-table" data-token-uuid={tokenUuid} />
  ),
}));

vi.mock('@linode/ui', async () => {
  const actual = await vi.importActual('@linode/ui');
  return {
    ...actual,
    CircleProgress: () => <div data-testid="circle-progress" />,
    ErrorState: ({ errorText }: { errorText: string }) => (
      <div data-testid="error-state">{errorText}</div>
    ),
  };
});

const mockTokenUuid = 'test-token-uuid-123';

const mockJoinedGroup = {
  created: '2026-01-01T00:00:00',
  expiry: '2026-02-01T00:00:00',
  label: 'token-label',
  sharegroup_label: 'My Share Group',
  sharegroup_uuid: 'sg-uuid-abc',
  status: 'active' as const,
  token: 'tok-abc',
  token_uuid: mockTokenUuid,
  updated: '2026-03-01T00:00:00',
  valid_for_sharegroup_uuid: 'sg-uuid-abc',
};

const mockShareGroup = {
  created: '2026-01-01T00:00:00',
  description: 'A description for the share group',
  id: 1,
  images_count: 2,
  is_suspended: false,
  label: 'My Share Group',
  members_count: 3,
  updated: '2026-03-01T00:00:00',
  uuid: 'sg-uuid-abc',
};

describe('JoinedGroupDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.useParams.mockReturnValue({ tokenUuid: mockTokenUuid });
    queryMocks.useProfile.mockReturnValue({
      data: { timezone: 'UTC' },
    });
    queryMocks.usePreferences.mockReturnValue({ data: false });

    queryMocks.useShareGroupTokenQuery.mockReturnValue({
      data: mockJoinedGroup,
      error: null,
      isLoading: false,
    });

    queryMocks.useShareGroupFromTokenQuery.mockReturnValue({
      data: mockShareGroup,
      error: null,
      isLoading: false,
    });
  });

  it('renders a loading spinner when the token query is loading', () => {
    queryMocks.useShareGroupTokenQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    const { getByTestId, queryByTestId } = renderWithTheme(
      <JoinedGroupDetails />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
    expect(queryByTestId('shared-images-table')).not.toBeInTheDocument();
  });

  it('renders a loading spinner when the share group query is loading', () => {
    queryMocks.useShareGroupFromTokenQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    const { getByTestId, queryByTestId } = renderWithTheme(
      <JoinedGroupDetails />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
    expect(queryByTestId('shared-images-table')).not.toBeInTheDocument();
  });

  it('renders share group details when data is loaded', async () => {
    const { findByTestId, findByText } = renderWithTheme(
      <JoinedGroupDetails />
    );

    expect(await findByText('sg-uuid-abc')).toBeVisible();
    expect(await findByText('A description for the share group')).toBeVisible();
    expect(await findByTestId('shared-images-table')).toBeVisible();
  });

  it('does not render the details panel when the share group query fails', () => {
    queryMocks.useShareGroupFromTokenQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'Forbidden' }],
      isLoading: false,
    });

    const { queryByTestId, queryByText } = renderWithTheme(
      <JoinedGroupDetails />
    );

    expect(queryByText('Leave Group')).not.toBeInTheDocument();
    expect(queryByTestId('shared-images-table')).not.toBeInTheDocument();
  });

  it('does not render description section when description is absent', () => {
    queryMocks.useShareGroupFromTokenQuery.mockReturnValue({
      data: { ...mockShareGroup, description: undefined },
      error: null,
      isLoading: false,
    });

    const { queryByText } = renderWithTheme(<JoinedGroupDetails />);

    expect(queryByText('Description')).not.toBeInTheDocument();
  });

  it('calls useShareGroupTokenQuery with the tokenUuid from route params', () => {
    renderWithTheme(<JoinedGroupDetails />);

    expect(queryMocks.useShareGroupTokenQuery).toHaveBeenCalledWith(
      mockTokenUuid
    );
  });

  it('calls useShareGroupFromTokenQuery with the tokenUuid from route params', () => {
    renderWithTheme(<JoinedGroupDetails />);

    expect(queryMocks.useShareGroupFromTokenQuery).toHaveBeenCalledWith(
      mockTokenUuid
    );
  });
});
