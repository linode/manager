import { Divider } from '@linode/ui';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile/profile';

import AccessControls from '../AccessControls';
import DatabaseSettingsDeleteClusterDialog from './DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import DatabaseSettingsResetPasswordDialog from './DatabaseSettingsResetPasswordDialog';
import MaintenanceWindow from './MaintenanceWindow';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { database, disabled } = props;
  const { data: profile } = useProfile();

  const accessControlCopy = (
    <Typography>
      Add or remove IPv4 addresses or ranges that should be authorized to access
      your cluster.
    </Typography>
  );

  const isLegacy = database.platform === 'rdbms-legacy';

  const resetRootPasswordCopy = isLegacy
    ? 'Resetting your root password will automatically generate a new password. You can view the updated password on your database cluster summary page. '
    : 'Reset your root password if someone should no longer have access to the root user or if you believe your password may have been compromised. This will automatically generate a new password that you’ll be able to see on your database cluster summary page.';

  const deleteClusterCopy = isLegacy
    ? 'Deleting a database cluster is permanent and cannot be undone.'
    : 'Permanently remove an unused database cluster.';

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [
    isResetRootPasswordDialogOpen,
    setIsResetRootPasswordDialogOpen,
  ] = React.useState(false);

  const onResetRootPassword = () => {
    setIsResetRootPasswordDialogOpen(true);
  };

  const onDeleteCluster = () => {
    setIsDeleteDialogOpen(true);
  };

  const onDeleteClusterClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const onResetRootPasswordClose = () => {
    setIsResetRootPasswordDialogOpen(false);
  };

  return (
    <>
      <Paper>
        <AccessControls
          database={database}
          description={accessControlCopy}
          disabled={disabled}
        />
        <Divider spacingBottom={22} spacingTop={28} />
        <DatabaseSettingsMenuItem
          buttonText="Reset Root Password"
          descriptiveText={resetRootPasswordCopy}
          disabled={disabled}
          onClick={onResetRootPassword}
          sectionTitle="Reset the Root Password"
        />
        <Divider spacingBottom={22} spacingTop={28} />
        <DatabaseSettingsMenuItem
          buttonText="Delete Cluster"
          descriptiveText={deleteClusterCopy}
          disabled={Boolean(profile?.restricted)}
          onClick={onDeleteCluster}
          sectionTitle="Delete the Cluster"
        />
        <Divider spacingBottom={22} spacingTop={28} />
        <MaintenanceWindow
          database={database}
          disabled={disabled}
          timezone={profile?.timezone}
        />
      </Paper>
      <DatabaseSettingsDeleteClusterDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databaseLabel={database.label}
        onClose={onDeleteClusterClose}
        open={isDeleteDialogOpen}
      />
      <DatabaseSettingsResetPasswordDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        onClose={onResetRootPasswordClose}
        open={isResetRootPasswordDialogOpen}
      />
    </>
  );
};

export default DatabaseSettings;
