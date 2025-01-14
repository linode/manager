import React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsersLandingTableBody } from './UsersLandingTableBody';

import type { APIError } from '@linode/api-v4';

const mockOnDelete = vi.fn();
const numCols = 3;

describe('UsersLandingTableBody', () => {
  it('renders loading state', () => {
    const { getByTestId } = renderWithTheme(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={true}
            numCols={numCols}
            onDelete={mockOnDelete}
            users={undefined}
          />
        </tbody>
      </table>
    );

    const loadingRow = getByTestId('table-row-loading');
    expect(loadingRow).toBeInTheDocument();
    expect(loadingRow).toHaveAttribute(
      'aria-label',
      'Table content is loading'
    );
  });

  it('renders error state', () => {
    const error: APIError[] = [{ reason: 'Something went wrong' }];

    const { getByTestId } = renderWithTheme(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={error}
            isLoading={false}
            numCols={numCols}
            onDelete={mockOnDelete}
            users={undefined}
          />
        </tbody>
      </table>
    );

    const errorRow = getByTestId('table-row-error');
    expect(errorRow).toBeInTheDocument();
  });

  it('renders empty state', () => {
    const { getByTestId } = renderWithTheme(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={false}
            numCols={numCols}
            onDelete={mockOnDelete}
            users={[]}
          />
        </tbody>
      </table>
    );

    const emptyRow = getByTestId('table-row-empty');
    expect(emptyRow).toBeInTheDocument();
  });

  it('renders user rows', () => {
    const users = accountUserFactory.buildList(3);

    const { getByText } = renderWithTheme(
      <table>
        <tbody>
          <UsersLandingTableBody
            error={null}
            isLoading={false}
            numCols={numCols}
            onDelete={mockOnDelete}
            users={users}
          />
        </tbody>
      </table>
    );

    expect(getByText('user-7')).toBeInTheDocument();
    expect(getByText('user-6')).toBeInTheDocument();
  });
});
