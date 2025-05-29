import { useProfile } from '@linode/queries';
import { Divider, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import {
  ACCESS_CONTROLS_IN_SETTINGS_TEXT,
  ACCESS_CONTROLS_IN_SETTINGS_TEXT_LEGACY,
  DELETE_CLUSTER_TEXT,
  DELETE_CLUSTER_TEXT_LEGACY,
  RESET_ROOT_PASSWORD_TEXT,
  RESET_ROOT_PASSWORD_TEXT_LEGACY,
  SUSPEND_CLUSTER_TEXT,
} from 'src/features/Databases/constants';
import { DatabaseSettingsReviewUpdatesDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsReviewUpdatesDialog';
import { DatabaseSettingsUpgradeVersionDialog } from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsUpgradeVersionDialog';
import {
  isDefaultDatabase,
  isLegacyDatabase,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';
import { useFlags } from 'src/hooks/useFlags';

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
  const flags = useFlags();
  const isDefaultDB = isDefaultDatabase(database);
  const isVPCEnabled = flags.databaseVpc;

  const accessControlCopy = (
    <Typography>
      {!isDefaultDB
        ? ACCESS_CONTROLS_IN_SETTINGS_TEXT_LEGACY
        : ACCESS_CONTROLS_IN_SETTINGS_TEXT}
    </Typography>
  );

  const suspendClusterCopy = SUSPEND_CLUSTER_TEXT;

  const resetRootPasswordCopy = !isDefaultDB
    ? RESET_ROOT_PASSWORD_TEXT_LEGACY
    : RESET_ROOT_PASSWORD_TEXT;

  const deleteClusterCopy = !isDefaultDB
    ? DELETE_CLUSTER_TEXT_LEGACY
    : DELETE_CLUSTER_TEXT;

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
          divider={<Divider spacingBottom={0} spacingTop={0} />}
          spacing={3}
        >
          {isDatabasesV2GA && isDefaultDB && (
            <DatabaseSettingsMenuItem
              buttonText={'Suspend Cluster'}
              descriptiveText={suspendClusterCopy}
              disabled={disabled || database.status !== 'active'}
              onClick={onSuspendCluster}
              sectionTitle={'Suspend Cluster'}
            />
          )}
          {!isVPCEnabled || isLegacyDatabase(database) ? (
            <AccessControls
              database={database}
              description={accessControlCopy}
              disabled={disabled}
            />
          ) : null}
          <DatabaseSettingsMenuItem
            buttonText="Reset Root Password"
            descriptiveText={resetRootPasswordCopy}
            disabled={disabled}
            onClick={onResetRootPassword}
            sectionTitle="Reset the Root Password"
          />
          <DatabaseSettingsMenuItem
            buttonText="Delete Cluster"
            descriptiveText={deleteClusterCopy}
            disabled={disabled}
            onClick={onDeleteCluster}
            sectionTitle="Delete the Cluster"
          />
          {isDatabasesV2GA && isDefaultDB && (
            <DatabaseSettingsMaintenance
              databaseEngine={database.engine}
              databasePendingUpdates={database.updates.pending}
              databaseVersion={database.version}
              onReviewUpdates={onReviewUpdates}
              onUpgradeVersion={onUpgradeVersion}
            />
          )}
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
