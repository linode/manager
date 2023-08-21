import { screen } from '@testing-library/react';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { linodeBackupsFactory } from 'src/factories/linodes';
import { regionFactory } from 'src/factories/regions';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import {
  LinodeActionMenu,
  LinodeActionMenuProps,
  buildQueryStringForLinodeClone,
} from './LinodeActionMenu';
import userEvent from '@testing-library/user-event';

const props: LinodeActionMenuProps = {
  inListView: true,
  linodeBackups: linodeBackupsFactory.build(),
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodeRegion: 'us-east',
  linodeStatus: 'running',
  linodeType: extendedTypes[0],
  onOpenDeleteDialog: jest.fn(),
  onOpenMigrateDialog: jest.fn(),
  onOpenPowerDialog: jest.fn(),
  onOpenRebuildDialog: jest.fn(),
  onOpenRescueDialog: jest.fn(),
  onOpenResizeDialog: jest.fn(),
};

describe('LinodeActionMenu', () => {
  describe('Action menu', () => {
    it('should contain all basic actions when the Linode is running', () => {
      renderWithTheme(<LinodeActionMenu {...props} />);
      expect(
        includesActions(
          [
            'Power Off',
            'Reboot',
            'Launch LISH Console',
            'Clone',
            'Resize',
            'Rebuild',
            'Rescue',
            'Migrate',
            'Delete',
          ],
          screen.queryByText
        )
      );
    });

    it('should contain Power On when the Linode is offline', () => {
      renderWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />);
      expect(includesActions(['Power On'], screen.queryByText));
      expect(screen.queryByText('Power Off')).toBeNull();
    });

    it('should contain all actions except Power Off, Reboot, and Launch Console when not in table context', () => {
      renderWithTheme(
        <LinodeActionMenu
          {...props}
          inListView={false}
          linodeStatus="offline"
        />
      );
      expect(
        includesActions(
          ['Clone', 'Resize', 'Rebuild', 'Rescue', 'Migrate', 'Delete'],
          screen.queryByText
        )
      );
      expect(
        includesActions(
          ['Launch LISH Console', 'Power On', 'Reboot'],
          screen.queryByText,
          false
        )
      );
    });

    it('should allow a reboot if the Linode is running', () => {
      renderWithTheme(<LinodeActionMenu {...props} />);
      userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByText('Reboot')).not.toHaveAttribute('aria-disabled');
    });

    it('should disable the reboot action if the Linode is not running', () => {
      // TODO: Should check for "read_only" permissions too
      renderWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />);
      userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByText('Reboot')?.closest('li')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
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
