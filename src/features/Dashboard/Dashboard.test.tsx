import { shallow } from 'enzyme';
import * as React from 'react';

import { linode1, linode2 } from 'src/__data__/linodes';

import { Dashboard } from './Dashboard';

const props = {
  actions: {
    getLinodesWithoutBackups: jest.fn(),
    openBackupDrawer: jest.fn(),
  },
  linodesWithoutBackups: [linode1, linode2],
  managed: false,
  backupError: undefined,
  classes: { root: ''}
}

const component = shallow(
  <Dashboard {...props} />
)

describe("Dashboard view", () => {
  describe("Backups CTA card", () => {
    it("should always display for non-managed users", () => {
      expect(component.find('WithStyles(withRouter(BackupsDashboardCard))')).toHaveLength(1);
    });
    it("should never display for managed users", () => {
      component.setProps({ managed: true });
      expect(component.find('WithStyles(withRouter(BackupsDashboardCard))')).toHaveLength(0);
    });
  });
});