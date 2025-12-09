import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { LinodeRow, RenderFlag } from './LinodeRow';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {},
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
describe('LinodeRow', () => {
  describe('when Linode has mutation', () => {
    it('should render a Flag', async () => {
      const { getByLabelText } = renderWithTheme(
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

    const { getByLabelText, getByText } = renderWithTheme(
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
