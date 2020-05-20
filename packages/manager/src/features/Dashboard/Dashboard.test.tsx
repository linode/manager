import { shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { light } from 'src/themes';
import { Dashboard } from './Dashboard';

const props = {
  accountBackups: false,
  notifications: [],
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
  theme: light(8)
};

jest.mock('src/store');

const component = shallow(<Dashboard {...props} {...reactRouterProps} />);

describe('Dashboard view', () => {
  describe('Backups CTA card', () => {
    it('display for non-managed users', () => {
      expect(component.find('withRouter(BackupsDashboardCard)')).toHaveLength(
        1
      );
    });
    it('should never display for managed users', () => {
      component.setProps({ managed: true });
      expect(component.find('withRouter(BackupsDashboardCard)')).toHaveLength(
        0
      );
    });
  });
});
