import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { databaseConnectionPoolFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseEditConnectionPoolDrawer } from './DatabaseEditConnectionPoolDrawer';

const mockProps = {
  databaseId: 123,
  onClose: vi.fn(),
  open: true,
  pool: databaseConnectionPoolFactory.build({
    label: 'test-pool',
    mode: 'session',
    size: 22,
    username: 'akmadmin',
  }),
};

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useUpdateDatabaseConnectionPoolMutation: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useUpdateDatabaseConnectionPoolMutation:
      queryMocks.useUpdateDatabaseConnectionPoolMutation,
  };
});

describe('DatabaseEditConnectionPoolDrawer Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useUpdateDatabaseConnectionPoolMutation.mockReturnValue({});
    queryMocks.useUpdateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: false,
      reset: vi.fn(),
    });
  });

  it('Should render the drawer title, prefilled inputs, and actions', () => {
    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    const drawerTitle = screen.getByText('Edit Connection Pool');
    expect(drawerTitle).toBeInTheDocument();

    const poolLabelInput = screen.getByLabelText('Pool Label');
    expect(poolLabelInput).toBeVisible();
    expect(poolLabelInput).toHaveValue('test-pool');
    // Label should not be editable
    expect(poolLabelInput).not.toBeEnabled();

    const databaseNameInput = screen.getByLabelText('Database Name');
    const poolModeInput = screen.getByLabelText('Pool Mode');
    const poolSizeInput = screen.getByLabelText('Pool Size');
    const usernameInput = screen.getByLabelText('Username');

    expect(databaseNameInput).toBeVisible();
    expect(databaseNameInput).toHaveValue('defaultdb');

    expect(poolModeInput).toBeVisible();
    expect(poolModeInput).toHaveValue('Session');

    expect(poolSizeInput).toBeVisible();
    expect(poolSizeInput).toHaveValue(22);

    expect(usernameInput).toBeVisible();
    expect(usernameInput).toHaveValue('akmadmin');

    const saveBtn = screen.getByText('Save');
    const cancelBtn = screen.getByText('Cancel');
    expect(saveBtn).toBeVisible();
    expect(cancelBtn).toBeVisible();
  });

  it('Should show error notice on root error', async () => {
    const mockErrorMessage = 'This is a root level error';
    queryMocks.useUpdateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue([{ field: 'root', reason: mockErrorMessage }]),
      isLoading: false,
      reset: vi.fn(),
    });

    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    // Submit the filled form
    const saveBtn = screen.getByText('Save');
    await userEvent.click(saveBtn);

    // Check that the error notice is displayed
    const errorNotice = screen.getByText(mockErrorMessage);
    expect(errorNotice).toBeInTheDocument();
  });

  it('Should display inline errors', async () => {
    queryMocks.useUpdateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue([
        { field: 'size', reason: 'Size error message' },
        { field: 'mode', reason: 'Mode error message' },
        { field: 'database', reason: 'Database error message' },
        { field: 'username', reason: 'Username error message' },
      ]),
      isLoading: false,
      reset: vi.fn(),
    });

    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    // Submit the filled form
    const saveBtn = screen.getByText('Save');
    await userEvent.click(saveBtn);

    // Check that inline errors are displayed
    const sizeError = screen.getByText('Size error message');
    const modeError = screen.getByText('Mode error message');
    const databaseError = screen.getByText('Database error message');
    const usernameError = screen.getByText('Username error message');
    expect(sizeError).toBeVisible();
    expect(modeError).toBeVisible();
    expect(databaseError).toBeVisible();
    expect(usernameError).toBeVisible();
  });
});
