import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertConfirmationDialog } from './AlertConfirmationDialog';

const alertId = 1;
const alertName = 'alert-1';
const entityName = 'entity-1';
const serviceType = 'linode';
const confirmFunction = vi.fn();
const component = (
  <AlertConfirmationDialog
    alertId={alertId}
    alertName={alertName}
    entityName={entityName}
    handleCancel={vi.fn()}
    handleConfirm={confirmFunction}
    isActive={true}
    isOpen={true}
    serviceType={serviceType}
  />
);

describe('Alert confirmation dialog', () => {
  it('should show confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(component);

    expect(getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(getByText(`Disable ${alertName} Alert?`)).toBeVisible();
  });
  it('should click confirm button', async () => {
    const { getByText } = renderWithTheme(component);

    const cancelButton = getByText('Disable');

    await userEvent.click(cancelButton);

    expect(confirmFunction).toBeCalledWith(alertId, serviceType, true);
  });
});
