import { userEvent } from '@testing-library/user-event/dist/cjs/setup/index.js';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShareGroupsTabs } from './ShareGroupsTabs';

vi.mock('./ShareGroupsView', () => ({
  ShareGroupsView: ({
    handlers,
  }: {
    handlers?: { onDelete?: (shareGroupId: string) => void };
  }) => (
    <div>
      <div>Mock Share Groups View</div>
      <button onClick={() => handlers?.onDelete?.('123')} type="button">
        Trigger delete
      </button>
    </div>
  ),
}));

vi.mock('./DeleteShareGroupDialog', () => ({
  DeleteShareGroupDialog: ({
    open,
    shareGroupId,
  }: {
    open: boolean;
    shareGroupId?: string;
  }) => (
    <div data-testid="delete-share-group-dialog">
      {JSON.stringify({ open, shareGroupId })}
    </div>
  ),
}));

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

describe('ShareGroupsTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);
    queryMocks.useLocation.mockReturnValue({
      pathname: '/images/share-groups/membership-requests',
    });
  });

  it('should render all share groups tabs', async () => {
    queryMocks.useParams.mockReturnValue({ shareGroupsType: 'owned-groups' });

    const { getByText } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups',
    });

    expect(getByText('Owned groups')).toBeVisible();
    expect(getByText('Joined groups')).toBeVisible();
    expect(getByText('My membership requests')).toBeVisible();
  });

  it('should navigate to owned-groups tab when clicked', async () => {
    queryMocks.useParams.mockReturnValue({ shareGroupsType: 'owned-groups' });
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);

    const { getByText } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups',
    });

    const ownedGroupsTab = getByText('Owned groups', { selector: 'button' });
    await userEvent.click(ownedGroupsTab);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/images/share-groups/$shareGroupsType',
      params: {
        shareGroupsType: 'owned-groups',
      },
    });
  });

  it('should navigate to joined-groups tab when clicked', async () => {
    queryMocks.useParams.mockReturnValue({ shareGroupsType: 'owned-groups' });
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);

    const { getByText } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups',
    });

    const joinedGroupsTab = getByText('Joined groups', { selector: 'button' });
    await userEvent.click(joinedGroupsTab);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/images/share-groups/$shareGroupsType',
      params: {
        shareGroupsType: 'joined-groups',
      },
    });
  });

  it('should navigate to membership-requests tab when clicked', async () => {
    queryMocks.useParams.mockReturnValue({ shareGroupsType: 'owned-groups' });
    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);

    const { getByText } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups',
    });

    const membershipTab = getByText('My membership requests', {
      selector: 'button',
    });
    await userEvent.click(membershipTab);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/images/share-groups/$shareGroupsType',
      params: {
        shareGroupsType: 'membership-requests',
      },
    });
  });

  it('should navigate to the delete action route when delete is triggered', async () => {
    queryMocks.useParams.mockImplementation(({ from }: { from: string }) => {
      if (from === '/images/share-groups/owned-groups/$shareGroupId/$action') {
        return undefined;
      }

      return { shareGroupsType: 'owned-groups' };
    });

    const mockNavigate = vi.fn();
    queryMocks.useNavigate.mockReturnValue(mockNavigate);

    const { getByText } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups',
    });

    await userEvent.click(getByText('Trigger delete'));

    expect(mockNavigate).toHaveBeenCalledWith({
      params: {
        action: 'delete',
        shareGroupId: '123',
      },
      search: expect.any(Function),
      to: '/images/share-groups/owned-groups/$shareGroupId/$action',
    });
  });

  it('should open the delete dialog when the delete action route is active', async () => {
    queryMocks.useParams.mockImplementation(({ from }: { from: string }) => {
      if (from === '/images/share-groups/owned-groups/$shareGroupId/$action') {
        return { action: 'delete', shareGroupId: '123' };
      }

      return { shareGroupsType: 'owned-groups' };
    });

    const { getByTestId } = renderWithTheme(<ShareGroupsTabs />, {
      initialRoute: '/images/share-groups/owned-groups/123/delete',
    });

    expect(getByTestId('delete-share-group-dialog')).toHaveTextContent(
      JSON.stringify({ open: true, shareGroupId: '123' })
    );
  });
});
