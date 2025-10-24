import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { ActionsPanel, LinkButton, Notice, Typography } from '@linode/ui';
import { useDialog } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import React from 'react';

import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { isPlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { ConfirmationDialog } from '../ConfirmationDialog/ConfirmationDialog';
import { DateTimeDisplay } from '../DateTimeDisplay';
import { Link } from '../Link';

interface Props {
  linodeId: number | undefined;
}

export const LinodeMaintenanceBanner = ({ linodeId }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: allMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER,
    linodeId !== undefined
  );

  const linodeMaintenance = allMaintenance?.find(
    (maintenance) =>
      maintenance.entity.type === 'linode' &&
      maintenance.entity.id === linodeId &&
      // Filter out platform maintenance, since that is handled separately
      !isPlatformMaintenance(maintenance)
  );

  const maintenanceTypeLabel = linodeMaintenance?.type.split('_').join(' ');
  const maintenanceStartTime =
    linodeMaintenance?.start_time || linodeMaintenance?.when;

  const { closeDialog, dialog, handleError, openDialog, submitDialog } =
    useDialog<number>((id: number) => scheduleOrQueueMigration(id));

  const isScheduled = Boolean(maintenanceStartTime);

  const actionLabel = isScheduled
    ? 'enter the migration queue'
    : 'schedule your migration';
  const showMigrateAction =
    linodeId !== undefined && linodeMaintenance?.type === 'power_off_on';

  const onSubmit = () => {
    if (!linodeId) {
      return;
    }
    submitDialog(linodeId)
      .then(() => {
        const successMessage = isScheduled
          ? 'Your Linode has been entered into the migration queue.'
          : 'Your migration has been scheduled.';
        enqueueSnackbar(successMessage, { variant: 'success' });
      })
      .catch(() => {
        const errorMessage = isScheduled
          ? 'An error occurred entering the migration queue.'
          : 'An error occurred scheduling your migration.';
        handleError(errorMessage);
      });
  };

  const actions = () => (
    <ActionsPanel
      primaryButtonProps={{
        label: actionLabel,
        loading: dialog.isLoading,
        onClick: onSubmit,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: closeDialog,
      }}
    />
  );

  if (!linodeMaintenance) return null;

  return (
    <>
      <Notice data-qa-maintenance-banner="true" variant="warning">
        <Typography>
          Linode {linodeMaintenance.entity.label}{' '}
          {linodeMaintenance.description} maintenance {maintenanceTypeLabel}{' '}
          will begin{' '}
          <strong>
            {maintenanceStartTime ? (
              <>
                <DateTimeDisplay
                  format="MM/dd/yyyy"
                  sx={(theme) => ({
                    font: theme.font.bold,
                  })}
                  value={maintenanceStartTime}
                />{' '}
                at{' '}
                <DateTimeDisplay
                  format="HH:mm"
                  sx={(theme) => ({
                    font: theme.font.bold,
                  })}
                  value={maintenanceStartTime}
                />
              </>
            ) : (
              'soon'
            )}
          </strong>
          . For more details, view{' '}
          <Link
            pendoId="linode-maintenance-banner-link"
            to="/account/maintenance"
          >
            Account Maintenance
          </Link>
          {showMigrateAction ? (
            <>
              {' or '}
              <LinkButton onClick={() => openDialog(linodeId)}>
                {actionLabel}
              </LinkButton>
              {' now.'}
            </>
          ) : (
            '.'
          )}
        </Typography>
      </Notice>
      <ConfirmationDialog
        actions={actions}
        error={dialog.error}
        onClose={() => closeDialog()}
        open={dialog.isOpen}
        title="Confirm Migration"
      >
        <Typography variant="subtitle1">
          Are you sure you want to{' '}
          {isScheduled
            ? 'enter the migration queue now'
            : 'schedule your migration now'}
          ?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
