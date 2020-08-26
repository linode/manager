import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';

import BackupsDashboardCard from './BackupsDashboardCard';

jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: () => ({ _loading: false })
}));

const props = {
  linodesWithoutBackups: 0,
  openBackupDrawer: jest.fn(),
  accountBackups: false,
  ...reactRouterProps
};

describe('Backups dashboard card', () => {
  it('should render a link to /account/settings', () => {
    const { getByTestId } = renderWithTheme(
      <BackupsDashboardCard {...props} />
    );
    getByTestId('account-link');
  });

  it('should not render Enable Backups for Existing Linodes if there are no Linodes w/out backups', () => {
    const { queryAllByText } = renderWithTheme(
      <BackupsDashboardCard {...props} />
    );
    expect(queryAllByText(/existing linodes/i)).toHaveLength(0);
  });

  it('should render the backup-existing section if there are Linodes to be backed up', () => {
    const { queryAllByText } = renderWithTheme(
      <BackupsDashboardCard {...props} linodesWithoutBackups={3} />
    );
    expect(queryAllByText(/existing linodes/i)).toHaveLength(1);
  });

  it('should open the backup drawer when backup-existing is clicked', async () => {
    const { getByTestId } = renderWithTheme(
      <BackupsDashboardCard {...props} linodesWithoutBackups={3} />
    );
    const button = getByTestId('back-up-existing-linodes');
    await waitFor(() => fireEvent.click(button));
    expect(props.openBackupDrawer).toHaveBeenCalledTimes(1);
  });

  it('should display the number of Linodes to be backed up', () => {
    const { getByText } = renderWithTheme(
      <BackupsDashboardCard {...props} linodesWithoutBackups={3} />
    );
    getByText(/3 linodes without backups/i);
  });

  it('should pluralize the displayed number of Linodes correctly', () => {
    const { getByText } = renderWithTheme(
      <BackupsDashboardCard {...props} linodesWithoutBackups={1} />
    );
    getByText(/1 linode without backups/i);
  });
});
