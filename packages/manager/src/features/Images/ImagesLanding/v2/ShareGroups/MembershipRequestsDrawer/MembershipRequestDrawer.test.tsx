import { newlyGeneratedSharegroupTokenFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY } from '../../constants';
import { MembershipRequestDrawer } from './MembershipRequestDrawer';

const copyMock = vi.hoisted(() => vi.fn());

vi.mock('copy-to-clipboard', () => ({
  default: copyMock,
}));

const queryMocks = vi.hoisted(() => ({
  useGenerateShareGroupTokenMutation: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useGenerateShareGroupTokenMutation:
      queryMocks.useGenerateShareGroupTokenMutation,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
  };
});

const mockToken = newlyGeneratedSharegroupTokenFactory.build({
  sharegroup_uuid: 'test-sharegroup-uuid-123',
  token: 'generated-token-abc123',
});

const OPEN_PATHNAME = '/images/share-groups/membership-requests/request';

describe('MembershipRequestDrawer', () => {
  const mockGenerateToken = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateToken.mockResolvedValue(mockToken);
    queryMocks.useGenerateShareGroupTokenMutation.mockReturnValue({
      mutateAsync: mockGenerateToken,
    });
    queryMocks.useNavigate.mockReturnValue(mockNavigate);
    queryMocks.useLocation.mockReturnValue({ pathname: OPEN_PATHNAME });
  });

  it('should render the title, instructions, UUID input, and Generate Token button', () => {
    renderWithTheme(<MembershipRequestDrawer />);

    expect(screen.getByText('Request membership')).toBeVisible();
    expect(
      screen.getByText(REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY)
    ).toBeVisible();
    expect(screen.getByLabelText('Share group UUID')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Generate Token' })
    ).toBeVisible();
  });

  it('should not open the drawer when not on the request route', () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/images/share-groups/membership-requests',
    });

    renderWithTheme(<MembershipRequestDrawer />);

    expect(
      screen.queryByText(REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY)
    ).not.toBeInTheDocument();
  });

  it('should call generateToken with the entered UUID on form submission', async () => {
    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(
      screen.getByLabelText('Share group UUID'),
      'my-share-group-uuid'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );

    await waitFor(() => {
      expect(mockGenerateToken).toHaveBeenCalledWith({
        sharegroupUuid: 'my-share-group-uuid',
      });
    });
  });

  it('should display a field error when the API returns a sharegroupUuid error', async () => {
    mockGenerateToken.mockRejectedValue([
      { field: 'sharegroupUuid', reason: 'Invalid UUID format' },
    ]);

    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'bad-uuid');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );

    expect(await screen.findByText('Invalid UUID format')).toBeVisible();
  });

  it('should display a root error when the API returns a non-field error', async () => {
    mockGenerateToken.mockRejectedValue([
      { reason: 'An unexpected error occurred' },
    ]);

    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(
      screen.getByLabelText('Share group UUID'),
      'some-uuid'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );

    expect(
      await screen.findByText('An unexpected error occurred')
    ).toBeVisible();
  });

  it('should clear the root error when the user edits the UUID input', async () => {
    mockGenerateToken.mockRejectedValue([
      { reason: 'An unexpected error occurred' },
    ]);

    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(
      screen.getByLabelText('Share group UUID'),
      'some-uuid'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );
    await screen.findByText('An unexpected error occurred');

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'x');

    expect(
      screen.queryByText('An unexpected error occurred')
    ).not.toBeInTheDocument();
  });

  it('should copy the token when the Copy Token button is clicked', async () => {
    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'my-uuid');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Copy Token' })
    );

    expect(copyMock).toHaveBeenCalledWith(mockToken.token);
  });

  it('should copy the draft email with the token and UUID when the Copy Draft Email button is clicked', async () => {
    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'my-uuid');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Copy Draft Email' })
    );

    expect(copyMock).toHaveBeenCalledWith(
      expect.stringContaining(mockToken.valid_for_sharegroup_uuid)
    );
    expect(copyMock).toHaveBeenCalledWith(
      expect.stringContaining(mockToken.token)
    );
  });

  it('should navigate to the Membership Requests list and reset the form when Close is clicked', async () => {
    renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'my-uuid');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));

    expect(mockNavigate).toHaveBeenCalledWith({
      params: { shareGroupsType: 'membership-requests' },
      to: '/images/share-groups/$shareGroupsType',
    });
  });

  it('should reset the form and return to the initial step after closing and reopening', async () => {
    const { rerender } = renderWithTheme(<MembershipRequestDrawer />);

    await userEvent.type(screen.getByLabelText('Share group UUID'), 'my-uuid');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Token' })
    );
    await screen.findByRole('button', { name: 'Close' });

    // Simulate close by changing the pathname, then reopening
    queryMocks.useLocation.mockReturnValue({
      pathname: '/images/share-groups/membership-requests',
    });
    rerender(<MembershipRequestDrawer />);

    queryMocks.useLocation.mockReturnValue({ pathname: OPEN_PATHNAME });
    rerender(<MembershipRequestDrawer />);

    expect(
      screen.getByRole('button', { name: 'Generate Token' })
    ).toBeVisible();
    expect(screen.getByLabelText('Share group UUID')).toHaveValue('');
  });
});
