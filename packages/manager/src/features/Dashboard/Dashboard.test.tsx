import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { withLinodesLoaded, withManaged } from 'src/utilities/testHelpersStore';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import Dashboard, { CombinedProps } from './Dashboard';

afterEach(cleanup);

const props: CombinedProps = {
  accountBackups: false,
  notifications: [],
  userTimezone: 'GMT',
  userTimezoneLoading: false,
  someLinodesHaveScheduledMaintenance: true,
  actions: {
    openBackupDrawer: jest.fn()
  },
  linodesWithoutBackups: [],
  backupError: undefined,
  managed: false,
  ...reactRouterProps
};

describe('Dashboard view', () => {
  describe('Backups CTA card', () => {
    it('display for non-managed users', () => {
      const { getByText } = renderWithTheme(<Dashboard {...props} />, {
        customStore: {
          ...withLinodesLoaded
        }
      });
      getByText('Linode Backup Auto-Enrollment');
    });
    it('should never display for managed users', () => {
      const _props = { ...props, managed: true };
      const { queryByText } = renderWithTheme(<Dashboard {..._props} />, {
        customStore: {
          ...withLinodesLoaded,
          ...withManaged
        }
      });
      expect(
        queryByText('Linode Backup Auto-Enrollment')
      ).not.toBeInTheDocument();
    });
  });
});
