import { shallow } from 'enzyme';
import * as React from 'react';
import { activePromotions } from 'src/__data__/account';
import { light } from 'src/themes';
import { Dashboard } from './Dashboard';

const props = {
  accountBackups: false,
  activePromotions,
  userTimezone: 'GMT',
  userTimezoneLoading: false,
  someLinodesHaveScheduledMaintenance: true,
  actions: {
    openBackupDrawer: jest.fn(),
    openImportDrawer: jest.fn()
  },
  linodesWithoutBackups: [],
  managed: false,
  backupError: undefined,
  entitiesWithGroupsToImport: { linodes: [], domains: [] },
  classes: { root: '' },
  theme: light({ spacingOverride: 8 })
};

const component = shallow(<Dashboard {...props} />);

describe('Dashboard view', () => {
  describe('Backups CTA card', () => {
    it('display for non-managed users', () => {
      expect(
        component.find('WithStyles(withRouter(BackupsDashboardCard))')
      ).toHaveLength(1);
    });
    it('should never display for managed users', () => {
      component.setProps({ managed: true });
      expect(
        component.find('WithStyles(withRouter(BackupsDashboardCard))')
      ).toHaveLength(0);
    });
  });
});
