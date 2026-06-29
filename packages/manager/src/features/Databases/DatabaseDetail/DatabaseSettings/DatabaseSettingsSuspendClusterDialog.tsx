import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Checkbox,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useSuspendDatabaseMutation } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import type { Engine } from '@linode/api-v4/lib/databases';

export interface SuspendDialogProps {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsSuspendClusterDialog = (
  props: SuspendDialogProps
) => {
  const { databaseEngine, databaseId, databaseLabel, onClose, open } = props;

  const {
    error,
    isPending,
    mutateAsync: suspendDatabase,
    reset,
  } = useSuspendDatabaseMutation(databaseEngine, databaseId);

  const defaultError = 'There was an error suspending this Database Cluster.';
  const [hasConfirmed, setHasConfirmed] = React.useState(false);
  const navigate = useNavigate();

  const onSuspendCluster = async () => {
    try {
      await suspendDatabase();
      toast.open({
        text: 'Database Cluster suspended successfully.',
        type: 'success',
      });
      onClose();
      navigate({
        to: '/databases',
      });
    } catch (error) {
      toast.open({
        text: 'Failed to suspend Database Cluster. Please try again.',
        type: 'error',
      });
    } finally {
      setHasConfirmed(false);
    }
  };

  const onCancel = () => {
    onClose();
    reset();
    setHasConfirmed(false);
  };

  const SUSPENDED_CLUSTER_COPY =
    "A suspended cluster stops immediately and you won't be billed for it. You can resume the cluster within 180 days from its suspension. After that time, the cluster will be deleted permanently.";

  return (
    <Modal closeModal={onCancel} open={open} size="medium">
      <span slot="title">Suspend database cluster {databaseLabel}?</span>
      <div slot="body" style={{ overflowY: 'hidden' }}>
        {error ? (
          <NotificationBanner type="error">
            {error[0].reason || defaultError}
          </NotificationBanner>
        ) : undefined}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <p style={{ fontSize: '0.875rem' }}>
            <b>{SUSPENDED_CLUSTER_COPY}</b>
          </p>
        </NotificationBanner>
        <Checkbox
          checked={hasConfirmed}
          data-testid="database-suspend-confirmation-checkbox"
          onChange={(e) => {
            setHasConfirmed((e as CustomEvent<boolean>).detail);
          }}
        >
          I understand the effects of this action.
        </Checkbox>
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={onCancel} variant="link">
          Cancel
        </Button>
        <Button
          disabled={!hasConfirmed}
          onClick={onSuspendCluster}
          processing={isPending}
          variant="primary"
        >
          Suspend Cluster
        </Button>
      </div>
    </Modal>
  );
};
