import { PriceObject } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Currency } from 'src/components/Currency';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useLinodeBackupsEnableMutation } from 'src/queries/linodes/backups';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  open: boolean;
}

export const EnableBackupsDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  const {
    error,
    isLoading,
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

  const backupsMonthlyPrice:
    | PriceObject['monthly']
    | undefined = getMonthlyBackupsPrice({
    region: linode?.region,
    type,
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleEnableBackups = async () => {
    await enableBackups();
    resetEventsPolling();
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
        disabled: !backupsMonthlyPrice,
        label: 'Enable Backups',
        loading: isLoading,
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
      {backupsMonthlyPrice ? (
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
