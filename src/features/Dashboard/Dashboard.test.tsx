import { shallow } from 'enzyme';
import * as React from 'react';
import { light } from 'src/themes';
import { Dashboard } from './Dashboard';

const props = {
  accountBackups: false,
  actions: {
    openBackupDrawer: jest.fn(),
    openImportDrawer: jest.fn()
  },
  linodesWithoutBackups: [],
  managed: false,
  backupError: undefined,
  entitiesWithGroupsToImport: { linodes: [], domains: [] },
  classes: { root: '' },
  theme: light()
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
