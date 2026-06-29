import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useProfile, useRestoreFromBackupMutation } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { toDatabaseFork, toFormattedDate } from '../../utilities';

import type { DatabaseBackupsValues } from './DatabaseBackups';
import type { Database } from '@linode/api-v4/lib/databases';
import type { DialogProps } from '@linode/ui';

interface Props extends Omit<DialogProps, 'title'> {
  database: Database;
  onClose: () => void;
  open: boolean;
}

export const DatabaseBackupsDialog = (props: Props) => {
  const { database, onClose, open } = props;
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const { control } = useFormContext<DatabaseBackupsValues>();
  const [date, time, region, fork] = useWatch({
    control,
    name: ['date', 'time', 'region', 'fork'],
  });

  const formattedDate =
    database.engine === 'valkey' && fork.restore_time
      ? formatDate(fork.restore_time, {
          timezone: profile?.timezone,
        })
      : toFormattedDate(date, time);

  const {
    error,
    mutateAsync: restore,
    reset,
    isPending,
  } = useRestoreFromBackupMutation(database.engine, {
    fork:
      database.engine === 'valkey'
        ? fork
        : toDatabaseFork(database.id, date, time),
    region,
    // Assign same VPC when forking to the same region, otherwise set VPC to null
    private_network:
      database.region === region ? database.private_network : null,
  });

  const _onClose = () => {
    onClose();
    reset();
  };

  const handleRestoreDatabase = () => {
    restore().then((database: Database) => {
      navigate({
        to: `/databases/$engine/$databaseId`,
        params: {
          engine: database.engine,
          databaseId: database.id,
        },
      });
      toast.open({
        text: 'Your database is being restored.',
        type: 'success',
      });
      _onClose();
    });
  };

  const isClusterWithVPCAndForkingToDifferentRegion =
    database.private_network !== null && database.region !== region;

  return (
    <Modal closeModal={_onClose} open={open} size="medium">
      <span slot="title">{`Restore ${database.label}`}</span>

      <div slot="body">
        <p>{formattedDate && `From ${formattedDate} (UTC)`}</p>
        {error && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={
              getAPIErrorOrDefault(error, 'Unable to restore this backup.')[0]
                .reason
            }
            type="error"
          />
        )}
        {isClusterWithVPCAndForkingToDifferentRegion && ( // Show warning when forking a cluster with VPC to a different region
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            type="warning"
          >
            The database cluster is currently assigned to a VPC. When you
            restore the cluster into a different region, it will not be assigned
            to a VPC by default. If your workflow requires a VPC, go to the
            cluster’s Networking tab after the restore is complete and assign
            the cluster to a VPC.
          </NotificationBanner>
        )}
        <p style={{ marginBottom: Spacing.S32 }}>
          Restoring a backup creates a fork from this backup. If you proceed and
          the fork is created successfully, you should remove the original
          database cluster. Failing to do so will lead to additional billing
          caused by two running clusters instead of one.
        </p>
      </div>

      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button data-testid="cancel" onClick={_onClose} variant="link">
          Cancel
        </Button>
        <Button
          data-testid="submit"
          onClick={handleRestoreDatabase}
          processing={isPending}
          variant="primary"
        >
          Restore
        </Button>
      </div>
    </Modal>
  );
};
