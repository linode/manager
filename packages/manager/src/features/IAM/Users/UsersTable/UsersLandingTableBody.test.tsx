import React from 'react';

import { createUserList } from '../../factories';
import { renderWithProviders } from '../../utilities/testHelpers';
import { UsersLandingTableBody } from './UsersLandingTableBody';

import type { APIError } from '@linode/api-v4';

const mockOnDelete = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
}));

vi.mock('src/OAuth/oauthClient', () => ({
  getIsAdminToken: vi.fn(),
  oauthClient: {},
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('./UserRow', () => ({
  UserRow: ({ user }: { user: { username: string } }) => (
    <tr data-testid={`user-row-${user.username}`}>
      <td>{user.username}</td>
    </tr>
  ),
}));

describe('UsersLandingTableBody', () => {
  beforeEach(() => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });
  });

  it('renders loading state', async () => {
    const { getByTestId } = renderWithProviders(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={true}
            onDelete={mockOnDelete}
            users={undefined}
          />
        </tbody>
      </table>
    );

    const loadingRow = getByTestId('table-row-loading');
    expect(loadingRow).toBeVisible();
    expect(loadingRow).toHaveAttribute(
      'aria-label',
      'Table content is loading'
    );
  });

  it('renders error state', async () => {
    const error: APIError[] = [{ reason: 'Something went wrong' }];

    const { getByTestId } = renderWithProviders(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={error}
            isLoading={false}
            onDelete={mockOnDelete}
            users={undefined}
          />
        </tbody>
      </table>
    );

    const errorRow = getByTestId('table-row-error');
    expect(errorRow).toBeVisible();
  });

  it('renders empty state', async () => {
    const { getByText } = renderWithProviders(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={false}
            onDelete={mockOnDelete}
            users={[]}
          />
        </tbody>
      </table>
    );

    expect(getByText('No users found')).toBeInTheDocument();
  });

  it('renders restricted empty state', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { getByText } = renderWithProviders(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={false}
            onDelete={mockOnDelete}
            users={[]}
          />
        </tbody>
      </table>
    );

    expect(
      getByText(/You do not have permission to list users/)
    ).toBeInTheDocument();
  });

  it('renders user rows', async () => {
    const users = createUserList(3);

    const { getByTestId } = renderWithProviders(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={false}
            onDelete={mockOnDelete}
            users={users}
          />
        </tbody>
      </table>
    );

    users.forEach((user) => {
      expect(getByTestId(`user-row-${user.username}`)).toBeVisible();
    });
  });
});
