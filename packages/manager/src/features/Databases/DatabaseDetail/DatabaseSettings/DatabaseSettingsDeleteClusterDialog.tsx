import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormField,
  Modal,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useDeleteDatabaseMutation, usePreferences } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import type { Engine } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsDeleteClusterDialog = (props: Props) => {
  const { databaseEngine, databaseID, databaseLabel, onClose, open } = props;

  const {
    mutateAsync: deleteDatabase,
    error,
    isPending,
    reset,
  } = useDeleteDatabaseMutation(databaseEngine, databaseID);
  const [clusterName, setClusterName] = React.useState('');
  const navigate = useNavigate();

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const isTypeToConfirmEnabled =
    typeToConfirmPreference === true || typeToConfirmPreference == null
      ? true
      : false;

  const _onClose = () => {
    onClose();
    reset();
    setClusterName('');
  };

  const onDeleteCluster = () => {
    deleteDatabase().then(() => {
      toast.open({
        text: 'Database Cluster deleted successfully.',
        type: 'success',
      });
      _onClose();
      reset();
      navigate({
        to: '/databases',
      });
    });
  };

  return (
    <Modal closeModal={_onClose} open={open} size="medium">
      <span slot="title">Delete database cluster {databaseLabel}?</span>
      <div slot="body">
        {error ? (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={
              getAPIErrorOrDefault(
                error,
                'There was an error deleting this Database Cluster.'
              )[0].reason
            }
            type="error"
          />
        ) : null}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <p style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting your entire database will delete
            any backups and nodes associated with database {databaseLabel},
            which may result in permanent data loss. This action cannot be
            undone.
          </p>
        </NotificationBanner>
        {isTypeToConfirmEnabled ? (
          <>
            <p>
              To confirm deletion, type the name of the Database Cluster{' '}
              <strong>({databaseLabel})</strong> in the field below:
            </p>
            <FormField>
              <label
                htmlFor="clusterName" // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
                style={{ fontWeight: 700, marginBottom: Spacing.S8 }}
              >
                Cluster Name
              </label>
              <TextField
                id="clusterName"
                onChange={(e) => setClusterName(e.detail as unknown as string)}
                placeholder=""
                value={clusterName}
              />
            </FormField>
            <p>
              To disable type-to-confirm, go to the Type-to-Confirm section of{' '}
              <a href="/profile/preferences">Preferences</a>.
            </p>
          </>
        ) : (
          <p>
            To enable type-to-confirm, go to the Type-to-Confirm section of{' '}
            <a href="/profile/preferences">Preferences</a>.
          </p>
        )}
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={_onClose} variant="link">
          Cancel
        </Button>
        <Button
          disabled={
            isTypeToConfirmEnabled ? clusterName !== databaseLabel : false
          }
          onClick={onDeleteCluster}
          processing={isPending}
          variant="danger"
        >
          Delete Cluster
        </Button>
      </div>
    </Modal>
  );
};
