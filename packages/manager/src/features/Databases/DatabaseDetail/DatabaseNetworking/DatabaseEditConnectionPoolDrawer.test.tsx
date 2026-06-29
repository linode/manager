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

type CdsTextFieldElement = HTMLElement & { value?: string };

const getTextFieldHostById = (id: string) =>
  document.querySelector(`cds-text-field#${id}`) as CdsTextFieldElement | null;

const getTextFieldInputById = async (id: string) => {
  const host = getTextFieldHostById(id);
  if (!host) {
    return null;
  }

  return getShadowRootElement(host, 'input');
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

    const poolLabelInput = getTextFieldHostById('poolLabel');
    expect(poolLabelInput).toBeTruthy();
    expect(poolLabelInput!).toBeVisible();
    expect(poolLabelInput?.value).toBe('test-pool');
    // Label should not be editable
    const poolLabelInnerInput = await getTextFieldInputById('poolLabel');
    expect(poolLabelInnerInput).toBeTruthy();
    expect(poolLabelInnerInput!).toBeDisabled();

    const databaseNameInput = getTextFieldHostById('databaseName');
    const poolModeInput = screen.getByLabelText('Pool Mode');
    const poolSizeInput = getTextFieldHostById('poolSize');
    const usernameInput = getTextFieldHostById('username');
    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost,
      'input'
    );

    expect(databaseNameInput).toBeTruthy();
    expect(databaseNameInput!).toBeVisible();
    expect(databaseNameInput?.value).toBe('defaultdb');

    expect(poolModeInput).toBeVisible();
    expect(poolModeInput).toHaveValue('Session');

    expect(poolSizeInput).toBeTruthy();
    expect(poolSizeInput!).toBeVisible();
    expect(poolSizeInput?.value).toBe('22');

    expect(usernameInput).toBeTruthy();
    expect(usernameInput!).toBeVisible();
    expect(usernameInput?.value).toBe('akmadmin');

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
    const actualSaveButton = await getShadowRootElement(saveBtn, 'button');
    expect(actualSaveButton).toBeDefined();
    expect(actualSaveButton).not.toBeNull();
    await userEvent.click(actualSaveButton!);

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
    await userEvent.click(poolModeSelect);
    await userEvent.click(screen.getByText('Statement'));
    const saveBtn = screen.getByText('Save');
    const actualSaveButton = await getShadowRootElement(saveBtn, 'button');
    await userEvent.click(actualSaveButton!);

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

    const usernameInput = getTextFieldHostById('username');

    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost,
      'input'
    );

    expect(usernameInput).toBeTruthy();
    expect(usernameInput!).toBeEnabled();
    expect(reuseInboundUserCheckbox).not.toBeChecked();
  });

  it('Should disable the Username input if the Reuse Inbound User checkbox is checked', async () => {
    renderWithTheme(<DatabaseEditConnectionPoolDrawer {...mockProps} />);

    const usernameInput = getTextFieldHostById('username');
    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost,
      'input'
    );

    await userEvent.click(reuseInboundUserCheckbox!);

    expect(usernameInput).toBeTruthy();
    expect(usernameInput!).toBeDisabled();
    expect(reuseInboundUserCheckbox).toBeChecked();
  });
});
