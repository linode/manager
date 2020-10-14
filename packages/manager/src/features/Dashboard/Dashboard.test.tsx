import * as React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { withLinodesLoaded, withManaged } from 'src/utilities/testHelpersStore';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import Dashboard, { CombinedProps } from './Dashboard';

const props: CombinedProps = {
  accountBackups: false,
  notifications: [],
  userTimezone: 'GMT',
  userProfileLoading: false,
  actions: {
    openBackupDrawer: jest.fn()
  },
  backupError: undefined,
  managed: false,
  ...reactRouterProps
};

describe('Dashboard view', () => {
  describe('Backups CTA card', () => {
    it('display for non-managed users', async () => {
      renderWithTheme(<Dashboard {...props} />, {
        customStore: {
          ...withLinodesLoaded
        }
      });
      await screen.findByText('Linode Backup Auto-Enrollment');
    });
    it('should never display for managed users', () => {
      const _props = { ...props, managed: true };
      renderWithTheme(<Dashboard {..._props} />, {
        customStore: {
          ...withLinodesLoaded,
          ...withManaged
        }
      });
      expect(
        screen.queryByText('Linode Backup Auto-Enrollment')
      ).not.toBeInTheDocument();
    });
  });
});
