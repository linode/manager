import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertConfirmationDialog } from './AlertConfirmationDialog';

const entityName = 'entity-1';
const alert = alertFactory.build({ service_type: 'dbaas' });
const confirmFunction = vi.fn();
const component = (
  <AlertConfirmationDialog
    alert={alert}
    entityName={entityName}
    handleCancel={vi.fn()}
    handleConfirm={confirmFunction}
    isActive={true}
    isOpen={true}
  />
);

describe('Alert confirmation dialog', () => {
  it('should show confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(component);

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Disable ${alert.label} Alert?`)).toBeVisible();
  });
  it('should click confirm button', async () => {
    const { getByText } = renderWithTheme(component);

    const cancelButton = getByText('Disable');

    await userEvent.click(cancelButton);

    expect(confirmFunction).toBeCalledWith(alert, true);
  });
});
