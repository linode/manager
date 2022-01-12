import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Divider from 'src/components/core/Divider';
import { Engine } from '@linode/api-v4/lib/databases/types';
import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';

interface Props {
  databaseID: number;
  databaseEngine: Engine;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const { databaseID, databaseEngine } = props;
  const accessControlsCopy = "Add the IP addresses or IP range(s) for other instances or users that should have the authorization to view this cluster’s database. By default, all public and private connections are denied. Learn more.";

  const resetRootPasswordCopy = "Resetting your root password will automatically generate a new password. You can view the updated password on your Database Cluster Summary page. ";

  const deleteClusterCopy = "Deleting a database cluster is permenant and cannot be undone";

  const onAddAccessControl = () => {

  };

  const onResetRootPassword = () => {

  };

  const onDeleteCluster = () => {

  };

  return (
    <Paper>
      <DatabaseSettingsMenuItem
        buttonText="Add Access Controls"
        descriptiveText={accessControlsCopy}
        onClick={onAddAccessControl}
        sectionTitle="Access Controls">
        <
      </DatabaseSettingsMenuItem>
      <Divider />
        <DatabaseSettingsMenuItem
          buttonText="Reset Root Password"
          descriptiveText={resetRootPasswordCopy}
          onClick={onResetRootPassword}
          sectionTitle="Root Password Reset" />
        <Divider />
        <DatabaseSettingsMenuItem
          sectionTitle="Delete Cluster"
          descriptiveText={deleteClusterCopy}
          buttonText="Delete Cluster"
          onClick={onDeleteCluster} />
    </Paper>
  );
};

export default DatabaseSettings;
