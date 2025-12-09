import {
  useLinodeBackupsEnableMutation,
  useLinodeQuery,
  useTypeQuery,
} from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Currency } from 'src/components/Currency';
import { DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY } from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { useEventsPollingActions } from 'src/queries/events/events';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import type { PriceObject } from '@linode/api-v4';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  open: boolean;
}

export const EnableBackupsDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  const {
    error,
    isPending,
    mutateAsync: enableBackups,
    reset,
  } = useLinodeBackupsEnableMutation(linodeId ?? -1);

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    open && linodeId !== undefined && linodeId > 0
  );

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const backupsMonthlyPrice: PriceObject['monthly'] | undefined =
    getMonthlyBackupsPrice({
      region: linode?.region,
      type,
    });

  const hasBackupsMonthlyPriceError =
    !backupsMonthlyPrice && backupsMonthlyPrice !== 0;

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const handleEnableBackups = async () => {
    await enableBackups();
    checkForNewEvents();
    enqueueSnackbar('Backups are being enabled for this Linode.', {
      variant: 'success',
    });
    onClose();
  };

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm-enable-backups',
        disabled: hasBackupsMonthlyPriceError,
        label: 'Enable Backups',
        loading: isPending,
        onClick: handleEnableBackups,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel-cance',
        label: 'Close',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title="Enable backups?"
    >
      {isDiskEncryptionFeatureEnabled && ( // @TODO LDE: once LDE is GA in all DCs, remove this condition
        <Notice
          spacingTop={8}
          text={DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY}
          variant="warning"
        />
      )}
      {!hasBackupsMonthlyPriceError ? (
        <Typography>
          Are you sure you want to enable backups on this Linode?{` `}
          This will add <Currency quantity={backupsMonthlyPrice} />
          {` `}
          to your monthly bill.
        </Typography>
      ) : (
        <Notice
          spacingBottom={16}
          spacingTop={8}
          text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
          variant="error"
        />
      )}
    </ConfirmationDialog>
  );
};
