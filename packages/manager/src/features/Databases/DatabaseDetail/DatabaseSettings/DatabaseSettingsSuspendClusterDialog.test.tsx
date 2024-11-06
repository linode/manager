import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  DatabaseSettingsSuspendClusterDialog,
  SuspendDialogProps,
} from './DatabaseSettingsSuspendClusterDialog';
import { Engine } from '@linode/api-v4';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, server } from 'src/mocks/testServer';

const mockEngine: Engine = 'mysql';
const mockLabel = 'database-1';
const props: SuspendDialogProps = {
  databaseEngine: mockEngine,
  databaseId: 1234,
  databaseLabel: mockLabel,
  onClose: vi.fn(),
  open: true,
};

describe('DatabaseSettingsSuspendClusterDialog', () => {
  it('renders the dialog with text', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    expect(getByText(`Suspend ${mockLabel} cluster?`)).toBeVisible();
    expect(getByText('Suspend Cluster')).toBeVisible();
    expect(getByTestId('CloseIcon')).toBeVisible();
  });

  it('should initialize with unchecked checkbox and disabled submit button', async () => {
    const { getByRole, getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationCheckbox = getByRole('checkbox') as HTMLInputElement;
    const suspendButton = getByText(/Suspend Cluster/i).closest('button');
    expect(confirmationCheckbox.checked).toBeFalsy();
    expect(suspendButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable submit button when checkbox is checked', async () => {
    const { getByRole, getByText } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationCheckbox = getByRole('checkbox') as HTMLInputElement;
    const suspendButton = getByText(/Suspend Cluster/i).closest('button');
    await userEvent.click(confirmationCheckbox);
    expect(confirmationCheckbox.checked).toBeTruthy();
    expect(suspendButton).toHaveAttribute('aria-disabled', 'false');
  });

  it('should call onClose after suspend call is successful', async () => {
    server.use(
      http.post(`*/databases/${encodeURIComponent(mockEngine)}/suspend`, () => {
        return HttpResponse.json({});
      })
    );
    const { getByText, getByRole } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );
    const confirmationCheckbox = getByRole('checkbox') as HTMLInputElement;
    const suspendButton = getByText(/Suspend Cluster/i).closest(
      'button'
    ) as HTMLButtonElement;

    await userEvent.click(confirmationCheckbox);
    await userEvent.click(suspendButton);
    await waitFor(() => {
      expect(props.onClose).toBeCalled();
    });
  });

  it('closes the confirmaton dialog if the X button is clicked', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseSettingsSuspendClusterDialog {...props} />
    );

    const closeButton = getByTestId('CloseIcon');
    expect(closeButton).toBeVisible();

    await userEvent.click(closeButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
