import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Divider from 'src/components/core/Divider';
import { Engine } from '@linode/api-v4/lib/databases/types';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import DatabaseSettingsDeleteClusterDialog from './DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsResetPasswordDialog from './DatabaseSettingsResetPasswordDialog';
import AccessControls from '../DatabaseSummary/DatabaseSummaryAccessControls';
import { useProfile } from 'src/queries/profile';

interface Props {
  databaseID: number;
  databaseEngine: Engine;
  databaseLabel: string;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { databaseID, databaseEngine, databaseLabel } = props;
  const { data: profile } = useProfile();
  const accessControlsCopy =
    'Add the IP addresses or IP range(s) for other instances or users that should have the authorization to view this cluster’s database. By default, all public and private connections are denied. Learn more.';

  const resetRootPasswordCopy =
    'Resetting your root password will automatically generate a new password. You can view the updated password on your Database Cluster Summary page. ';

  const deleteClusterCopy =
    'Deleting a database cluster is permenant and cannot be undone';

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [
    isAddAccessControlDialogOpen,
    setIsAddAccessControlDialogOpen,
  ] = React.useState(false);
  const [
    isResetRootPasswordDialogOpen,
    setIsResetRootPasswordDialogOpen,
  ] = React.useState(false);

  const onAddAccessControl = () => {
    setIsAddAccessControlDialogOpen(true);
  };

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
        <DatabaseSettingsMenuItem
          buttonText="Add Access Controls"
          descriptiveText={accessControlsCopy}
          onClick={onAddAccessControl}
          sectionTitle="Access Controls"
        >
          <AccessControls />
        </DatabaseSettingsMenuItem>
        <Divider />
        <DatabaseSettingsMenuItem
          buttonText="Reset Root Password"
          descriptiveText={resetRootPasswordCopy}
          onClick={onResetRootPassword}
          sectionTitle="Root Password Reset"
        />
        <Divider />
        <DatabaseSettingsMenuItem
          sectionTitle="Delete Cluster"
          descriptiveText={deleteClusterCopy}
          buttonText="Delete Cluster"
          disabled={Boolean(profile?.restricted)}
          onClick={onDeleteCluster}
        />
      </Paper>
      <DatabaseSettingsDeleteClusterDialog
        open={isDeleteDialogOpen}
        onClose={onDeleteClusterClose}
        databaseID={databaseID}
        databaseEngine={databaseEngine}
        databaseLabel={databaseLabel}
      />
      <DatabaseSettingsResetPasswordDialog
        open={isResetRootPasswordDialogOpen}
        onClose={onResetRootPasswordClose}
        databaseID={databaseID}
        databaseEngine={databaseEngine}
      />
    </>
  );
};

export default DatabaseSettings;
