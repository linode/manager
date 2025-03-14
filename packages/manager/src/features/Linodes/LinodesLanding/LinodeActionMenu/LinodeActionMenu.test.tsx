import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { linodeBackupsFactory } from '@linode/utilities';
import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeActionMenu, LinodeActionMenuProps } from './LinodeActionMenu';
import { buildQueryStringForLinodeClone } from './LinodeActionMenuUtils';

const props: LinodeActionMenuProps = {
  inListView: true,
  linodeBackups: linodeBackupsFactory.build(),
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodeRegion: 'us-east',
  linodeStatus: 'running',
  linodeType: extendedTypes[0],
  onOpenDeleteDialog: vi.fn(),
  onOpenMigrateDialog: vi.fn(),
  onOpenPowerDialog: vi.fn(),
  onOpenRebuildDialog: vi.fn(),
  onOpenRescueDialog: vi.fn(),
  onOpenResizeDialog: vi.fn(),
};

describe('LinodeActionMenu', () => {
  describe('Action menu', () => {
    it('should contain all basic actions when the Linode is running', async () => {
      const { getByLabelText, getByText } = renderWithTheme(
        <LinodeActionMenu {...props} />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      const actions = [
        'Power Off',
        'Reboot',
        'Launch LISH Console',
        'Clone',
        'Resize',
        'Rebuild',
        'Rescue',
        'Migrate',
        'Delete',
      ];

      for (const action of actions) {
        expect(getByText(action)).toBeVisible();
      }
    });

    it('should contain Power On when the Linode is offline', async () => {
      const { getByLabelText, queryByText } = renderWithTheme(
        <LinodeActionMenu {...props} linodeStatus="offline" />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      expect(queryByText('Power On')).toBeVisible();
      expect(queryByText('Power Off')).toBeNull();
    });

    it('should contain all actions except Power Off, Reboot, and Launch Console when not in table context', async () => {
      const { getByLabelText, getByText, queryByText } = renderWithTheme(
        <LinodeActionMenu
          {...props}
          inListView={false}
          linodeStatus="offline"
        />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      const actionsThatShouldBeVisible = [
        'Clone',
        'Resize',
        'Rebuild',
        'Rescue',
        'Migrate',
        'Delete',
      ];

      for (const action of actionsThatShouldBeVisible) {
        expect(getByText(action)).toBeVisible();
      }

      const actionsThatShouldNotBeShown = [
        'Launch LISH Console',
        'Power On',
        'Reboot',
      ];

      for (const action of actionsThatShouldNotBeShown) {
        expect(queryByText(action)).toBeNull();
      }
    });

    it('should allow a reboot if the Linode is running', async () => {
      renderWithTheme(<LinodeActionMenu {...props} />);
      await userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByText('Reboot')).not.toHaveAttribute('aria-disabled');
    });

    it('should disable the reboot action if the Linode is not running', async () => {
      // TODO: Should check for "read_only" permissions too
      renderWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />);
      await userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByText('Reboot')?.closest('li')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('should disable the clone action if the Linode is in a distributed region', async () => {
      const propsWithDistributedRegion = {
        ...props,
        linodeRegion: 'us-den-10',
      };

      const { getByLabelText, getByTestId } = renderWithTheme(
        <LinodeActionMenu {...propsWithDistributedRegion} />
      );

      await userEvent.click(getByLabelText(/^Action menu for/));
      expect(getByTestId('Clone')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('buildQueryStringForLinodeClone', () => {
    it('returns `type` and `linodeID` params', () => {
      const result = buildQueryStringForLinodeClone(
        1,
        'us-east',
        'g6-standard-1',
        [],
        []
      );
      expect(result).toMatch('type=');
      expect(result).toMatch('linodeID=');
    });

    it('includes `regionID` param if valid region', () => {
      const regionsData = regionFactory.buildList(1, { id: 'us-east' });
      expect(
        buildQueryStringForLinodeClone(1, 'us-east', '', [], regionsData)
      ).toMatch('regionID=us-east');
      expect(
        buildQueryStringForLinodeClone(1, 'invalid-region', '', [], regionsData)
      ).not.toMatch('regionID=us-east');
    });

    it('includes `typeID` param if valid type', () =>
      expect(
        buildQueryStringForLinodeClone(
          1,
          '',
          'g6-standard-2',
          extendedTypes,
          []
        )
      ).toMatch('typeID=g6-standard-2'));
    expect(
      buildQueryStringForLinodeClone(1, '', 'invalid-type', extendedTypes, [])
    ).not.toMatch('typeID=');
  });
});
