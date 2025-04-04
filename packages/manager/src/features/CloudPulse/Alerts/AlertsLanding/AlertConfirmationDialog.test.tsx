import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertConfirmationDialog } from './AlertConfirmationDialog';

const entityName = 'entity-1';
const alert = alertFactory.build({ service_type: 'dbaas' });
const confirmFunction = vi.fn();

describe('Alert confirmation dialog', () => {
  const message = `Are you sure you want to disable the alert for ${entityName}?`;
  const title = `Disable ${alert.label} Alert?`;
  it('should show confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={true}
        isOpen={true}
        message={message}
        title={title}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Disable ${alert.label} Alert?`)).toBeVisible();
    expect(
      getByText(`Are you sure you want to disable the alert for ${entityName}?`)
    ).toBeInTheDocument();
  });
  it('should click confirm button', async () => {
    const message = `Are you sure you want to disable the alert for ${entityName}?`;
    const title = `Disable ${alert.label} Alert?`;
    const { getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={true}
        isOpen={true}
        message={message}
        title={title}
      />
    );

    const button = getByText('Disable');

    await userEvent.click(button);

    expect(confirmFunction).toBeCalledWith(alert, true);
  });
  it('should show enable text', async () => {
    const message = `Are you sure you want to enable the alert for ${entityName}?`;
    const title = `Enable ${alert.label} Alert?`;
    const { getByTestId, getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isEnabled={false}
        isOpen={true}
        message={message}
        title={title}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Enable ${alert.label} Alert?`)).toBeVisible();
    expect(
      getByText(`Are you sure you want to enable the alert for ${entityName}?`)
    ).toBeInTheDocument();
  });
});
