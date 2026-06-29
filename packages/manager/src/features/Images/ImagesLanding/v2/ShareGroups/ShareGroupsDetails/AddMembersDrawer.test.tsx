import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddMembersDrawer } from './AddMembersDrawer';

const mockAddMembersToSharegroup = vi.fn().mockResolvedValue({});

const mockShareGroup = {
  id: 1,
  label: 'Test Share Group',
  description: 'Test description',
  members: [],
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
  is_suspended: false,
  uuid: 'test-uuid',
};

const queryMocks = vi.hoisted(() => ({
  useShareGroupQuery: vi.fn(() => ({
    data: mockShareGroup,
    isLoading: false,
    error: null,
  })),
  useShareGroupsAddMembersMutation: vi.fn(() => ({
    mutateAsync: mockAddMembersToSharegroup,
  })),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useShareGroupQuery: queryMocks.useShareGroupQuery,
    useShareGroupsAddMembersMutation:
      queryMocks.useShareGroupsAddMembersMutation,
  };
});

describe('Add Members Drawer', () => {
  const SAVE_TEXT = 'Save';

  const props = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    open: true,
    shareGroupId: '1',
  };

  beforeEach(() => {
    mockAddMembersToSharegroup.mockClear();
    queryMocks.useShareGroupQuery.mockClear();
    queryMocks.useShareGroupsAddMembersMutation.mockClear();
    vi.clearAllMocks();

    queryMocks.useShareGroupQuery.mockReturnValue({
      data: mockShareGroup,
      isLoading: false,
      error: null,
    });
    queryMocks.useShareGroupsAddMembersMutation.mockReturnValue({
      mutateAsync: mockAddMembersToSharegroup,
    });
    mockAddMembersToSharegroup.mockResolvedValue({});
  });

  it('should render a title, share group name, member name input, token input, and action buttons', () => {
    renderWithTheme(<AddMembersDrawer {...props} />);

    expect(screen.getByText('Add Members')).toBeVisible();
    expect(screen.getByText(mockShareGroup.label)).toBeVisible();

    const memberNameInput = screen.getByRole('textbox', {
      name: /Member name/i,
    });
    expect(memberNameInput).toBeVisible();
    expect(memberNameInput).toBeEnabled();

    const tokenInput = screen.getByRole('textbox', { name: /Token/i });
    expect(tokenInput).toBeVisible();
    expect(tokenInput).toBeEnabled();

    expect(screen.getByRole('button', { name: SAVE_TEXT })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('should submit the form with member name and token values', async () => {
    renderWithTheme(<AddMembersDrawer {...props} />);

    const memberNameInput = screen.getByRole('textbox', {
      name: /Member name/i,
    });
    fireEvent.change(memberNameInput, { target: { value: 'My Member' } });

    const tokenInput = screen.getByRole('textbox', { name: /Token/i });
    fireEvent.change(tokenInput, { target: { value: 'abc123token' } });

    const saveButton = screen.getByRole('button', { name: SAVE_TEXT });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddMembersToSharegroup).toHaveBeenCalledWith({
        sharegroupId: 1,
        data: {
          label: 'My Member',
          token: 'abc123token',
        },
      });
    });
  });

  it('should reset the form and call onClose when Cancel is clicked', () => {
    const onClose = vi.fn();

    renderWithTheme(<AddMembersDrawer {...props} onClose={onClose} />);

    fireEvent.change(screen.getByRole('textbox', { name: /Member name/i }), {
      target: { value: 'Temp Value' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should display a field error when the API returns a label error', async () => {
    mockAddMembersToSharegroup.mockRejectedValueOnce([
      { field: 'label', reason: 'Label is invalid' },
    ]);

    renderWithTheme(<AddMembersDrawer {...props} />);

    fireEvent.change(screen.getByRole('textbox', { name: /Member name/i }), {
      target: { value: 'Bad Label' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Token/i }), {
      target: { value: 'sometoken' },
    });

    fireEvent.click(screen.getByRole('button', { name: SAVE_TEXT }));

    expect(await screen.findByText('Label is invalid')).toBeVisible();
  });

  it('should display a field error when the API returns a token error', async () => {
    mockAddMembersToSharegroup.mockRejectedValueOnce([
      { field: 'token', reason: 'Token is invalid' },
    ]);

    renderWithTheme(<AddMembersDrawer {...props} />);

    fireEvent.change(screen.getByRole('textbox', { name: /Member name/i }), {
      target: { value: 'Some Member' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Token/i }), {
      target: { value: 'badtoken' },
    });

    fireEvent.click(screen.getByRole('button', { name: SAVE_TEXT }));

    expect(await screen.findByText('Token is invalid')).toBeVisible();
  });

  it('should display a root error banner when the API returns a non-field error', async () => {
    const mockErrorMessage = 'An unexpected error occurred';
    mockAddMembersToSharegroup.mockRejectedValueOnce([
      { reason: mockErrorMessage },
    ]);

    renderWithTheme(<AddMembersDrawer {...props} />);

    fireEvent.change(screen.getByRole('textbox', { name: /Member name/i }), {
      target: { value: 'Some Member' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Token/i }), {
      target: { value: 'sometoken' },
    });

    fireEvent.click(screen.getByRole('button', { name: SAVE_TEXT }));

    // CDS NotificationBanner renders copy inside shadow DOM (not visible to findByText)
    await waitFor(() => {
      const banner = document.querySelector('cds-notification-banner');
      expect(banner?.shadowRoot?.textContent ?? '').toContain(mockErrorMessage);
    });
  });

  it('should show the share group label fetched from the query', () => {
    queryMocks.useShareGroupQuery.mockReturnValue({
      data: { ...mockShareGroup, label: 'My Custom Group' },
      isLoading: false,
      error: null,
    });

    renderWithTheme(<AddMembersDrawer {...props} />);

    expect(screen.getByText('My Custom Group')).toBeVisible();
  });
});
