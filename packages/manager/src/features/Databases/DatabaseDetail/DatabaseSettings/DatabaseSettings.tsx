import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Divider from 'src/components/core/Divider';
import { Database } from '@linode/api-v4/lib/databases/types';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';
import DatabaseSettingsDeleteClusterDialog from './DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsResetPasswordDialog from './DatabaseSettingsResetPasswordDialog';
import AccessControls from '../AccessControls';
import { useProfile } from 'src/queries/profile';

interface Props {
  database: Database;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { database } = props;
  const { data: profile } = useProfile();

  const resetRootPasswordCopy =
    'Resetting your root password will automatically generate a new password. You can view the updated password on your Database Cluster Summary page. ';

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
        <AccessControls database={database} />
        <Divider spacingTop={28} spacingBottom={22} />
        <DatabaseSettingsMenuItem
          buttonText="Reset Root Password"
          descriptiveText={resetRootPasswordCopy}
          onClick={onResetRootPassword}
          sectionTitle="Reset Root Password"
        />
        <Divider spacingTop={22} spacingBottom={22} />
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
