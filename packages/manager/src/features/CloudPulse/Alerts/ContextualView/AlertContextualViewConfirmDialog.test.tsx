import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertContextualViewConfirmDialog } from './AlertContextualViewConfirmDialog';

const entityName = 'entity-1';
const alertIds = {
  system: [123, 456],
  user: [789, 101],
};
const confirmFunction = vi.fn();

describe('Alert confirmation dialog', () => {
  it('should show confirmation dialog', () => {
    renderWithTheme(
      <AlertContextualViewConfirmDialog
        alertIds={alertIds}
        entityName={entityName}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('confirmation-dialog')).toBeVisible();
    expect(screen.getByText('Save Alerts?')).toBeVisible();
    expect(
      screen.getByText(
        /Are you sure you want to save these settings for entity-1\?/
      )
    ).toBeVisible();
  });

  it('should click confirm button', async () => {
    renderWithTheme(
      <AlertContextualViewConfirmDialog
        alertIds={alertIds}
        entityName={entityName}
        handleCancel={vi.fn()}
        handleConfirm={confirmFunction}
        isOpen={true}
      />
    );
    await userEvent.click(screen.getByText('Save'));
    expect(confirmFunction).toBeCalledWith(alertIds);
  });
});
