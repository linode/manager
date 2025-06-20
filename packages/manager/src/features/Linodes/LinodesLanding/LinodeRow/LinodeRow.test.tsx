import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  renderWithThemeAndRouter,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { LinodeRow, RenderFlag } from './LinodeRow';

describe('LinodeRow', () => {
  describe('when Linode has mutation', () => {
    it('should render a Flag', async () => {
      const { getByLabelText } = await renderWithThemeAndRouter(
        <RenderFlag mutationAvailable={true} />
      );

      expect(
        getByLabelText('There is a free upgrade available for this Linode')
      ).toBeVisible();
    });
  });

  it('should render a linode row', async () => {
    const linode = linodeFactory.build();
    const renderedLinode = (
      <LinodeRow
        handlers={{
          onOpenDeleteDialog: () => {},
          onOpenMigrateDialog: () => {},
          onOpenPowerDialog: () => {},
          onOpenRebuildDialog: () => {},
          onOpenRescueDialog: () => {},
          onOpenResizeDialog: () => {},
        }}
        {...linode}
      />
    );

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      wrapWithTableBody(renderedLinode)
    );

    getByText(linode.label);

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Linode ${linode.label}`);
    await userEvent.click(actionMenu);

    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });
});
