import * as DatabasesAPIModule from '@linode/api-v4/lib/databases';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseSettingsSuspendClusterDialog } from './DatabaseSettingsSuspendClusterDialog';

import type { SuspendDialogProps } from './DatabaseSettingsSuspendClusterDialog';
import type { Engine } from '@linode/api-v4';

const mockEngine: Engine = 'mysql';
const props: SuspendDialogProps = {
  databaseEngine: mockEngine,
  databaseId: 1234,
  databaseLabel: 'database-1',
  onClose: vi.fn(),
  open: true,
};

const getCdsCheckboxInput = (host: HTMLElement) =>
  (host as unknown as { input?: HTMLInputElement }).input ??
  host.shadowRoot?.querySelector<HTMLInputElement>('input') ??
  null;

describe('DatabaseSettingsSuspendClusterDialog', () => {
  it('renders the dialog with text', async () => {
    const { getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    expect(getByText(`Suspend database cluster database-1?`)).toBeVisible();
    expect(getByText('Suspend Cluster')).toBeVisible();
  });

  it('should initialize with unchecked checkbox and disabled submit button', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationHost = getByTestId(
      'database-suspend-confirmation-checkbox'
    );
    const suspendButton = getByText(/Suspend Cluster/i).closest('cds-button');
    await customElements.whenDefined('cds-checkbox');
    await waitFor(() => {
      expect(confirmationHost).toHaveProperty('checked', false);
    });
    expect(suspendButton).toHaveAttribute('disabled', '');
  });

  it('should enable submit button when checkbox is checked', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationHost = getByTestId(
      'database-suspend-confirmation-checkbox'
    );
    const suspendButton = getByText(/Suspend Cluster/i).closest('cds-button');
    await customElements.whenDefined('cds-checkbox');
    await waitFor(() => {
      expect(getCdsCheckboxInput(confirmationHost)).toBeTruthy();
    });
    const confirmationInput = getCdsCheckboxInput(confirmationHost);
    expect(confirmationInput).toBeTruthy();
    await userEvent.click(confirmationInput!);
    expect(confirmationInput!.checked).toBeTruthy();
    expect(suspendButton).not.toHaveAttribute('disabled');
  });

  it('should call onClose after suspend call is successful', async () => {
    const suspendSpy = vi
      .spyOn(DatabasesAPIModule, 'suspendDatabase')
      .mockResolvedValue({});

    const { getByText, getByTestId } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationHost = getByTestId(
      'database-suspend-confirmation-checkbox'
    );
    const suspendButton = getByText(/Suspend Cluster/i).closest(
      'cds-button'
    ) as HTMLElement;

    await customElements.whenDefined('cds-checkbox');
    await waitFor(() => {
      expect(getCdsCheckboxInput(confirmationHost)).toBeTruthy();
    });
    const confirmationInput = getCdsCheckboxInput(confirmationHost);
    expect(confirmationInput).toBeTruthy();
    await userEvent.click(confirmationInput!);
    await userEvent.click(suspendButton);
    await waitFor(() => {
      expect(props.onClose).toBeCalled();
    });
    expect(suspendSpy).toHaveBeenCalledWith(mockEngine, props.databaseId);
    suspendSpy.mockRestore();
  });

  it('closes the confirmaton dialog if the Cancel button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );

    const cancelButton = getByText('Cancel').closest('cds-button');
    expect(cancelButton).toBeVisible();

    await userEvent.click(cancelButton!);
    expect(props.onClose).toHaveBeenCalled();
  });
});
