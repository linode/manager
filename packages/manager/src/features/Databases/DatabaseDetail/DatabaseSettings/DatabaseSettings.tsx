import { Divider, Paper } from '@linode/ui';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { DatabaseSettingsReviewUpdatesDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsReviewUpdatesDialog';
import { DatabaseSettingsUpgradeVersionDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsUpgradeVersionDialog';
import {
  isDefaultDatabase,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';
import { useProfile } from 'src/queries/profile/profile';

import AccessControls from '../AccessControls';
import DatabaseSettingsDeleteClusterDialog from './DatabaseSettingsDeleteClusterDialog';
import { DatabaseSettingsMaintenance } from './DatabaseSettingsMaintenance';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import DatabaseSettingsResetPasswordDialog from './DatabaseSettingsResetPasswordDialog';
import { DatabaseSettingsSuspendClusterDialog } from './DatabaseSettingsSuspendClusterDialog';
import MaintenanceWindow from './MaintenanceWindow';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { database, disabled } = props;
  const { data: profile } = useProfile();
  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const isDefaultDB = isDefaultDatabase(database);

  const accessControlCopy = (
    <Typography>
      Add or remove IPv4 addresses or ranges that should be authorized to access
      your cluster.
    </Typography>
  );

  const suspendClusterCopy = `Suspend the cluster if you don't use it temporarily to prevent being billed for it.`;

  const resetRootPasswordCopy = !isDefaultDB
    ? 'Resetting your root password will automatically generate a new password. You can view the updated password on your database cluster summary page. '
    : 'Reset your root password if someone should no longer have access to the root user or if you believe your password may have been compromised. This will automatically generate a new password that you’ll be able to see on your database cluster summary page.';

  const deleteClusterCopy = !isDefaultDB
    ? 'Deleting a database cluster is permanent and cannot be undone.'
    : 'Permanently remove an unused database cluster.';

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [
    isResetRootPasswordDialogOpen,
    setIsResetRootPasswordDialogOpen,
  ] = React.useState(false);
  const [
    isSuspendClusterDialogOpen,
    setIsSuspendClusterDialogOpen,
  ] = React.useState(false);

  const [
    isUpgradeVersionDialogOpen,
    setIsUpgradeVersionDialogOpen,
  ] = React.useState(false);

  const [
    isReviewUpdatesDialogOpen,
    setIsReviewUpdatesDialogOpen,
  ] = React.useState(false);

  const onResetRootPassword = () => {
    setIsResetRootPasswordDialogOpen(true);
  };

  const onDeleteCluster = () => {
    setIsDeleteDialogOpen(true);
  };

  const onSuspendCluster = () => {
    setIsSuspendClusterDialogOpen(true);
  };

  const onDeleteClusterClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const onResetRootPasswordClose = () => {
    setIsResetRootPasswordDialogOpen(false);
  };

  const onSuspendDialogClose = () => {
    setIsSuspendClusterDialogOpen(false);
  };

  const onUpgradeVersion = () => {
    setIsUpgradeVersionDialogOpen(true);
  };

  const onUpgradeVersionClose = () => {
    setIsUpgradeVersionDialogOpen(false);
  };

  const onReviewUpdates = () => {
    setIsReviewUpdatesDialogOpen(true);
  };

  const onReviewUpdatesClose = () => {
    setIsReviewUpdatesDialogOpen(false);
  };

  return (
    <>
      <Paper>
        {isDatabasesV2GA && isDefaultDB && (
          <>
            <DatabaseSettingsMenuItem
              buttonText={'Suspend Cluster'}
              descriptiveText={suspendClusterCopy}
              disabled={disabled || database.status !== 'active'}
              onClick={onSuspendCluster}
              sectionTitle={'Suspend Cluster'}
            />
            <Divider spacingBottom={22} spacingTop={28} />
          </>
        )}
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
        {isDatabasesV2GA && isDefaultDB && (
          <>
            <Divider spacingBottom={22} spacingTop={28} />
            <DatabaseSettingsMaintenance
              databaseEngine={database.engine}
              databasePendingUpdates={database.updates.pending}
              databaseVersion={database.version}
              onReviewUpdates={onReviewUpdates}
              onUpgradeVersion={onUpgradeVersion}
            />
          </>
        )}
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
      <DatabaseSettingsSuspendClusterDialog
        databaseEngine={database.engine}
        databaseId={database.id}
        databaseLabel={database.label}
        onClose={onSuspendDialogClose}
        open={isSuspendClusterDialogOpen}
      />
      <DatabaseSettingsUpgradeVersionDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databaseLabel={database.label}
        databaseVersion={database.version}
        onClose={onUpgradeVersionClose}
        open={isUpgradeVersionDialogOpen}
      />
      <DatabaseSettingsReviewUpdatesDialog
        databaseEngine={database.engine}
        databaseID={database.id}
        databasePendingUpdates={database.updates.pending}
        onClose={onReviewUpdatesClose}
        open={isReviewUpdatesDialogOpen}
      />
    </>
  );
};

export default DatabaseSettings;
