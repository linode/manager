import { Database } from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { useProfile } from 'src/queries/profile';
import AccessControls from '../AccessControls';
import DatabaseSettingsDeleteClusterDialog from './DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import DatabaseSettingsResetPasswordDialog from './DatabaseSettingsResetPasswordDialog';
import MaintenanceWindow from './MaintenanceWindow';

interface Props {
  database: Database;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { database } = props;
  const { data: profile } = useProfile();

  const accessControlCopy = (
    <Typography>
      Add or remove IPv4 addresses or ranges that should be authorized to access
      your cluster.
    </Typography>
  );

  const resetRootPasswordCopy =
    'Resetting your root password will automatically generate a new password. You can view the updated password on your database cluster summary page. ';

  const deleteClusterCopy =
    'Deleting a database cluster is permanent and cannot be undone.';

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
        <AccessControls database={database} description={accessControlCopy} />
        <Divider spacingTop={28} spacingBottom={22} />
        <DatabaseSettingsMenuItem
          buttonText="Reset Root Password"
          descriptiveText={resetRootPasswordCopy}
          onClick={onResetRootPassword}
          sectionTitle="Reset Root Password"
        />
        <Divider spacingTop={28} spacingBottom={22} />
        <DatabaseSettingsMenuItem
          sectionTitle="Delete Cluster"
          descriptiveText={deleteClusterCopy}
          buttonText="Delete Cluster"
          disabled={Boolean(profile?.restricted)}
          onClick={onDeleteCluster}
        />
        <Divider spacingTop={28} spacingBottom={22} />
        <MaintenanceWindow database={database} timezone={profile?.timezone} />
      </Paper>
      <DatabaseSettingsDeleteClusterDialog
        open={isDeleteDialogOpen}
        onClose={onDeleteClusterClose}
        databaseID={database.id}
        databaseEngine={database.engine}
        databaseLabel={database.label}
      />
      <DatabaseSettingsResetPasswordDialog
        open={isResetRootPasswordDialogOpen}
        onClose={onResetRootPasswordClose}
        databaseID={database.id}
        databaseEngine={database.engine}
      />
    </>
  );
};

export default DatabaseSettings;
