import { shallow } from 'enzyme';
import * as React from 'react';

import { Dashboard } from './Dashboard';

const props = {
  accountBackups: false,
  actions: {
    getLinodesWithoutBackups: jest.fn(),
    openBackupDrawer: jest.fn(),
  },
  linodesWithoutBackups: [],
  managed: false,
  backupError: undefined,
  classes: { root: ''},
  notifications: []
}

const component = shallow(
  <Dashboard {...props} />
)

describe("Dashboard view", () => {
  describe("Backups CTA card", () => {
    it("display for non-managed users", () => {
      expect(component.find('WithStyles(withRouter(BackupsDashboardCard))')).toHaveLength(1);
    });
    it("should never display for managed users", () => {
      component.setProps({ managed: true });
      expect(component.find('WithStyles(withRouter(BackupsDashboardCard))')).toHaveLength(0);
    });
  });
});