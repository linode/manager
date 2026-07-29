import { Spacing } from '@akamai/cds-tokens/themes/dark';
import { useProfile } from '@linode/queries';
import * as React from 'react';

import {
  DELETE_CLUSTER_TEXT,
  RESET_ROOT_PASSWORD_TEXT,
  SUSPEND_CLUSTER_TEXT,
} from 'src/features/Databases/constants';
import { DatabaseSettingsReviewUpdatesDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsReviewUpdatesDialog';
import { DatabaseSettingsUpgradeVersionDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsUpgradeVersionDialog';

import { Divider } from '../../shared/Divider/Divider';
import { Paper } from '../../shared/Paper/Paper';
import { Stack } from '../../shared/Stack/Stack';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseSettingsDeleteClusterDialog } from './DatabaseSettingsDeleteClusterDialog';
import { DatabaseSettingsMaintenance } from './DatabaseSettingsMaintenance';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import { DatabaseSettingsResetPasswordDialog } from './DatabaseSettingsResetPasswordDialog';
import { DatabaseSettingsSuspendClusterDialog } from './DatabaseSettingsSuspendClusterDialog';
import { MaintenanceWindow } from './MaintenanceWindow';

export const DatabaseSettings = () => {
  const { database, disabled } = useDatabaseDetailContext();
  const { data: profile } = useProfile();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isResetRootPasswordDialogOpen, setIsResetRootPasswordDialogOpen] =
    React.useState(false);
  const [isSuspendClusterDialogOpen, setIsSuspendClusterDialogOpen] =
    React.useState(false);

  const [isUpgradeVersionDialogOpen, setIsUpgradeVersionDialogOpen] =
    React.useState(false);

  const [isReviewUpdatesDialogOpen, setIsReviewUpdatesDialogOpen] =
    React.useState(false);

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
        <Stack
          divider={<Divider marginBottom={0} marginTop={0} />}
          spacing={Spacing.S24}
        >
          <DatabaseSettingsMenuItem
            buttonText={'Suspend Cluster'}
            descriptiveText={SUSPEND_CLUSTER_TEXT}
            disabled={disabled || database.status !== 'active'}
            onClick={onSuspendCluster}
            sectionTitle={'Suspend Cluster'}
          />
          <DatabaseSettingsMenuItem
            buttonText="Reset Root Password"
            descriptiveText={RESET_ROOT_PASSWORD_TEXT}
            disabled={disabled}
            onClick={onResetRootPassword}
            sectionTitle="Reset the Root Password"
          />
          <DatabaseSettingsMenuItem
            buttonText="Delete Cluster"
            descriptiveText={DELETE_CLUSTER_TEXT}
            disabled={disabled}
            onClick={onDeleteCluster}
            sectionTitle="Delete the Cluster"
          />
          <DatabaseSettingsMaintenance
            databaseEngine={database.engine}
            databasePendingUpdates={database.updates.pending}
            databaseVersion={database.version}
            onReviewUpdates={onReviewUpdates}
            onUpgradeVersion={onUpgradeVersion}
          />
          <MaintenanceWindow
            database={database}
            disabled={disabled}
            timezone={profile?.timezone}
          />
        </Stack>
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
