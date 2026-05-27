import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { databaseConnectionPoolFactory } from 'src/factories';
import {
  getShadowRootElement,
  renderWithTheme,
} from 'src/utilities/testHelpers';

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

  it('Should render the drawer title, prefilled inputs, and actions', async () => {
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
    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost as HTMLElement,
      'input'
    );

    expect(databaseNameInput).toBeVisible();
    expect(databaseNameInput).toHaveValue('defaultdb');

    expect(poolModeInput).toBeVisible();
    expect(poolModeInput).toHaveValue('Session');

    expect(poolSizeInput).toBeVisible();
    expect(poolSizeInput).toHaveValue(22);

    expect(usernameInput).toBeVisible();
    expect(usernameInput).toHaveValue('akmadmin');

    expect(reuseInboundUserCheckbox).not.toBeChecked();

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

    // Edit and submit the filled form
    const poolModeSelect = screen.getByLabelText('Pool Mode');
    await userEvent.click(poolModeSelect);
    await userEvent.click(screen.getByText('Statement'));
    const saveBtn = screen.getByText('Save');
    await userEvent.click(saveBtn);

    // CDS NotificationBanner renders copy inside shadow DOM (not visible to getByText)
    await waitFor(() => {
      const banner = document.querySelector('cds-notification-banner');
      expect(banner?.shadowRoot?.textContent ?? '').toContain(mockErrorMessage);
    });
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

    // Edit and submit the filled form
    const poolModeSelect = screen.getByLabelText('Pool Mode');
    await userEvent.click(poolModeSelect);
    await userEvent.click(screen.getByText('Statement'));
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

  it('Should enable the Username input if the Reuse Inbound User checkbox is not checked', async () => {
    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    const usernameInput = screen.getByLabelText('Username');

    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost as HTMLElement,
      'input'
    );

    expect(usernameInput).toBeEnabled();
    expect(reuseInboundUserCheckbox).not.toBeChecked();
  });

  it('Should disable the Username input if the Reuse Inbound User checkbox is checked', async () => {
    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    const usernameInput = screen.getByLabelText('Username');
    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost as HTMLElement,
      'input'
    );

    await userEvent.click(reuseInboundUserCheckbox!);

    expect(usernameInput).toBeDisabled();
    expect(reuseInboundUserCheckbox).toBeChecked();
  });
});
