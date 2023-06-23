import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useDeleteLinodeMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number | undefined;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
      title={`Delete ${linode?.label ?? ''}?`}
      entity={{ label: linode?.label, type: 'Linode' }}
      open={open}
      loading={isLoading}
      errors={error}
      onClose={onClose}
      onClick={onDelete}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your Linode will result in
          permanent data loss.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};
