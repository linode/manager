import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Typography } from 'src/components/Typography';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Currency } from 'src/components/Currency';
import { useLinodeBackupsEnableMutation } from 'src/queries/linodes/backups';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { useSnackbar } from 'notistack';
import { useEventsInfiniteQuery } from 'src/queries/events';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  open: boolean;
}

export const EnableBackupsDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  const {
    mutateAsync: enableBackups,
    reset,
    isLoading,
    error,
  } = useLinodeBackupsEnableMutation(linodeId ?? -1);

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    open && linodeId !== undefined && linodeId > 0
  );

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const price = type?.addons?.backups?.price?.monthly ?? 0;

  const { resetEventsPolling } = useEventsInfiniteQuery({ enabled: false });

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
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel-cancel>
        Close
      </Button>
      <Button
        buttonType="primary"
        onClick={handleEnableBackups}
        loading={isLoading}
        data-qa-confirm-enable-backups
      >
        Enable Backups
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Enable backups?"
      actions={actions}
      open={open}
      onClose={onClose}
      error={error?.[0].reason}
    >
      <Typography>
        Are you sure you want to enable backups on this Linode?{` `}
        This will add <Currency quantity={price} />
        {` `}
        to your monthly bill.
      </Typography>
    </ConfirmationDialog>
  );
};
