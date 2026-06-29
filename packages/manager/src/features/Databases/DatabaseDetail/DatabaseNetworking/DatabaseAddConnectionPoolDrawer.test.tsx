import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import {
  getShadowRootElement,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseAddConnectionPoolDrawer } from './DatabaseAddConnectionPoolDrawer';

const mockProps = {
  databaseId: 123,
  onClose: vi.fn(),
  open: true,
};

const addPoolBtnText = 'Add Pool';

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
    useCreateDatabaseConnectionPoolMutation: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useCreateDatabaseConnectionPoolMutation:
      queryMocks.useCreateDatabaseConnectionPoolMutation,
  };
});

describe('DatabaseAddConnectionPoolDrawer Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({});
    queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: false,
      reset: vi.fn(),
    });
  });

  it('Should render the drawer title', () => {
    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);

    const addPoolDrawerTitle = screen.getByText('Add a New Connection Pool');
    expect(addPoolDrawerTitle).toBeInTheDocument();
  });

  it('Should submit expected payload with valid selection, then close the drawer', async () => {
    const expectedPayloadValues = {
      label: 'test-pool',
      database: 'defaultdb',
      size: 10,
      mode: 'transaction',
      username: null, // Test default 'Reuse inbound user' option which gets provided as null to the API
    };
    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);
    // Fill out and submit the form
    const poolLabelInput = await getTextFieldInputById('poolLabel');
    const addPoolBtn = screen.getByText(addPoolBtnText);
    const actualAddPoolButton = await getShadowRootElement(
      addPoolBtn,
      'button'
    );
    expect(poolLabelInput).toBeTruthy();
    await userEvent.type(poolLabelInput!, expectedPayloadValues.label);
    await userEvent.click(actualAddPoolButton!);
    // Test that the mutation was called with expected payload
    expect(
      queryMocks.useCreateDatabaseConnectionPoolMutation().mutateAsync
    ).toHaveBeenCalledExactlyOnceWith(expectedPayloadValues);
    // Test that onClose was called to close the drawer
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('Should show error notice on root error', async () => {
    const mockErrorMessage = 'This is a root level error';
    queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue([{ field: 'root', reason: mockErrorMessage }]),
      isLoading: false,
      reset: vi.fn(),
    });

    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);

    // Fill out and submit the form
    const poolLabelInput = await getTextFieldInputById('poolLabel');
    const addPoolBtn = screen.getByText(addPoolBtnText);
    const actualAddPoolButton = await getShadowRootElement(
      addPoolBtn,
      'button'
    );
    expect(poolLabelInput).toBeTruthy();
    await userEvent.type(poolLabelInput!, 'test-pool');
    await userEvent.click(actualAddPoolButton!);

    // CDS NotificationBanner renders copy inside shadow DOM (not visible to findByText)
    await waitFor(() => {
      const banner = document.querySelector('cds-notification-banner');
      expect(banner?.shadowRoot?.textContent ?? '').toContain(mockErrorMessage);
    });
  });

  it('Should display inline errors', async () => {
    const mockRejectedFieldErrorsMap = {
      label: 'Label error message',
      size: 'Size error message',
      mode: 'Mode error message',
      database: 'Database error message',
      username: 'Username error message',
    };
    queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue([
        { field: 'label', reason: mockRejectedFieldErrorsMap.label },
        { field: 'size', reason: mockRejectedFieldErrorsMap.size },
        { field: 'mode', reason: mockRejectedFieldErrorsMap.mode },
        { field: 'database', reason: mockRejectedFieldErrorsMap.database },
        { field: 'username', reason: mockRejectedFieldErrorsMap.username },
      ]),
      isLoading: false,
      reset: vi.fn(),
    });

    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);

    // Fill out and submit the form
    const poolLabelInput = await getTextFieldInputById('poolLabel');
    const addPoolBtn = screen.getByText(addPoolBtnText);
    const actualAddPoolButton = await getShadowRootElement(
      addPoolBtn,
      'button'
    );
    expect(poolLabelInput).toBeTruthy();
    await userEvent.type(poolLabelInput!, 'test-pool');
    await userEvent.click(actualAddPoolButton!);

    // Check that inline errors are displayed
    const labelError = await screen.findByText(
      mockRejectedFieldErrorsMap.label
    );
    const sizeError = await screen.findByText(mockRejectedFieldErrorsMap.size);
    const modeError = await screen.findByText(mockRejectedFieldErrorsMap.mode);
    const databaseError = await screen.findByText(
      mockRejectedFieldErrorsMap.database
    );
    const usernameError = await screen.findByText(
      mockRejectedFieldErrorsMap.username
    );
    expect(labelError).toBeInTheDocument();
    expect(sizeError).toBeInTheDocument();
    expect(modeError).toBeInTheDocument();
    expect(databaseError).toBeInTheDocument();
    expect(usernameError).toBeInTheDocument();
  });

  it('Should disable the Username input if the Reuse Inbound User checkbox is checked', async () => {
    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);

    const usernameInput = getTextFieldHostById('username');
    const reuseInboundUserCheckboxHost = screen.getByTestId(
      'database-reuse-inbound-user-checkbox'
    );
    const reuseInboundUserCheckbox = await getShadowRootElement(
      reuseInboundUserCheckboxHost,
      'input'
    );

    expect(usernameInput).toBeTruthy();
    expect(usernameInput!).toBeDisabled();
    expect(reuseInboundUserCheckbox).toBeChecked();
  });

  it('Should enable the Username input if the Reuse Inbound User checkbox is not checked', async () => {
    renderWithTheme(<DatabaseAddConnectionPoolDrawer {...mockProps} />);

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
    expect(usernameInput!).toBeEnabled();
    expect(reuseInboundUserCheckbox).not.toBeChecked();
  });
});
