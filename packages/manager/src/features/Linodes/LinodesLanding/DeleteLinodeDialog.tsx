import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useDeleteLinodeMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteLinodeDialog = (props: Props) => {
  const { linodeId, onClose, onSuccess, open } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { error, isLoading, mutateAsync, reset } = useDeleteLinodeMutation(
    linodeId ?? -1
  );

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onDelete = async () => {
    await mutateAsync();
    onClose();
    resetEventsPolling();

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: linode?.label,
        primaryBtnText: 'Delete',
        type: 'Linode',
      }}
      errors={error}
      label={'Linode Label'}
      loading={isLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete ${linode?.label ?? ''}?`}
    >
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your Linode will result in
          permanent data loss.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};
