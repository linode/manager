import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertConfirmationDialog } from './AlertConfirmationDialog';

const entityName = 'entity-1';
const alert = alertFactory.build({ service_type: 'dbaas' });
const confirmFunction = vi.fn();

describe('Alert confirmation dialog', () => {
  it('should show confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        entityName={entityName}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isActive={true}
        isOpen={true}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Disable ${alert.label} Alert?`)).toBeVisible();
    expect(
      getByText(`Are you sure you want to disable the alert for ${entityName}?`)
    ).toBeInTheDocument();
  });
  it('should click confirm button', async () => {
    const { getByText } = renderWithTheme(
      <AlertConfirmationDialog
        alert={alert}
        entityName={entityName}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isActive={true}
        isOpen={true}
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
        entityName={entityName}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isActive={false}
        isOpen={true}
      />
    );

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Enable ${alert.label} Alert?`)).toBeVisible();
    expect(
      getByText(`Are you sure you want to enable the alert for ${entityName}?`)
    ).toBeInTheDocument();
  });
});
