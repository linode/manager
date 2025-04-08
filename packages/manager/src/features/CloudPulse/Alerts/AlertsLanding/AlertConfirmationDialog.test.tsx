import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertConfirmationDialog } from './AlertConfirmationDialog';

const entityName = 'entity-1';
const alert = alertFactory.build({ service_type: 'dbaas' });
const confirmFunction = vi.fn();
const messages = {
  disableMessage: `Are you sure you want to disable the alert for ${entityName}?`,
  disableTitle: `Disable ${alert.label} Alert?`,
  enableMessage: `Are you sure you want to enable the alert for ${entityName}?`,
  enableTitle: `Enable ${alert.label} Alert?`,
};

describe('Alert confirmation dialog', () => {
  it('should show confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={true}
        isOpen={true}
        message={messages.disableMessage}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(messages.disableTitle)).toBeVisible();
    expect(getByText(messages.disableMessage)).toBeInTheDocument();
  });
  it('should click confirm button', async () => {
    const { getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={true}
        isOpen={true}
        message={messages.disableMessage}
      />
    );

    const button = getByText('Disable');

    await userEvent.click(button);

    expect(confirmFunction).toBeCalledWith(alert, true);
  });
  it('should show enable text', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={false}
        isOpen={true}
        message={messages.enableMessage}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(messages.enableTitle)).toBeVisible();
    expect(getByText(messages.enableMessage)).toBeInTheDocument();
  });
});
