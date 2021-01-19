import * as React from 'react';
import { screen } from '@testing-library/react';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { regionFactory } from 'src/factories/regions';
import { linodeBackupsFactory } from 'src/factories/linodes';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import LinodeActionMenu, {
  buildQueryStringForLinodeClone,
  Props
} from './LinodeActionMenu';

const props: Props = {
  inTableContext: true,
  linodeId: 1,
  linodeRegion: 'us-east',
  linodeBackups: linodeBackupsFactory.build(),
  linodeLabel: 'test-linode',
  linodeStatus: 'running',
  linodeType: 'g6-standard-1',
  openDialog: jest.fn(),
  openPowerActionDialog: jest.fn()
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
            'Delete'
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
          linodeStatus="offline"
          inTableContext={false}
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

    it.skip('should disable the reboot action if the Linode is not running', () => {
      // @todo update ActionMenu mock to fix this test once CMR action menu is gone
      renderWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />);
      expect(screen.queryByText('Reboot')).toBeDisabled();
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
          'g5-standard-2',
          extendedTypes,
          []
        )
      ).toMatch('typeID=g5-standard-2'));
    expect(
      buildQueryStringForLinodeClone(1, '', 'invalid-type', extendedTypes, [])
    ).not.toMatch('typeID=');
  });
});
