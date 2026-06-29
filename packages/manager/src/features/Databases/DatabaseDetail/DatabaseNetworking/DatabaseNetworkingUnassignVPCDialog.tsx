import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseMutation } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import type { Engine, UpdateDatabasePayload } from '@linode/api-v4';

interface Props {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseNetworkingUnassignVPCDialog = (props: Props) => {
  const { databaseEngine, databaseId, databaseLabel, onClose, open } = props;

  const navigate = useNavigate();

  const {
    error,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
    reset: resetMutation,
  } = useDatabaseMutation(databaseEngine, databaseId);

  const onUnassign = async () => {
    const payload: UpdateDatabasePayload = { private_network: null };

    updateDatabase(payload).then(() => {
      onClose();
      toast.open({
        text: 'Changes are being applied.',
        type: 'info',
      });

      navigate({
        to: '/databases/$engine/$databaseId',
        params: {
          engine: databaseEngine,
          databaseId,
        },
      });
    });
  };

  const handleOnClose = () => {
    onClose();
    resetMutation?.();
  };

  return (
    <Modal closeModal={handleOnClose} open={open} size="medium">
      <span slot="title">Unassign {databaseLabel} from VPC?</span>
      <div slot="body">
        {error && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={error[0].reason}
            type="error"
          />
        )}
        <p>
          The unassignment of the VPC will cause a temporary downtime during the
          transition and will make the cluster accessible only via its public
          IP.
        </p>

        <p style={{ marginBottom: Spacing.S20, marginTop: Spacing.S20 }}>
          Once unassigned, review the allowed IP list to help prevent
          unauthorized access and clear DNS caches to ensure that applications
          resolve the new IP addresses correctly.
        </p>

        <p>
          Note that if you want to change the VPC assigned to the cluster, you
          can do it without unassigning the current VPC first.
        </p>
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={handleOnClose} variant="link">
          Cancel
        </Button>
        <Button
          data-testid="unassign-button"
          onClick={onUnassign}
          processing={submitInProgress}
          variant="primary"
        >
          Unassign
        </Button>
      </div>
    </Modal>
  );
};
