import { Notice, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  useAllLinodeConfigsQuery,
  useDeleteLinodeMutation,
  vpcQueries,
} from '@linode/queries';

import { getVPCsFromLinodeConfigs } from './utils';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteLinodeDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, onSuccess, open } = props;
  const queryClient = useQueryClient();

  const { data: configs } = useAllLinodeConfigsQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { error, isPending, mutateAsync, reset } = useDeleteLinodeMutation(
    linodeId ?? -1
  );

  const { checkForNewEvents } = useEventsPollingActions();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onDelete = async () => {
    await mutateAsync();
    const vpcIds = getVPCsFromLinodeConfigs(configs ?? []);

    // @TODO VPC: potentially revisit using the linodeEventsHandler in linode/events.ts to invalidate queries rather than here
    // See PR #9814 for more details
    if (vpcIds.length > 0) {
      queryClient.invalidateQueries({
        queryKey: vpcQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: vpcQueries.paginated._def,
      });
      // invalidate data for specific vpcs this linode is assigned to
      for (const vpcId of vpcIds) {
        queryClient.invalidateQueries({
          queryKey: vpcQueries.vpc(vpcId).queryKey,
        });
      }
    }
    onClose();
    checkForNewEvents();

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: linodeLabel,
        primaryBtnText: 'Delete',
        type: 'Linode',
      }}
      errors={error}
      expand
      label="Linode Label"
      loading={isPending}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete ${linodeLabel ?? ''}?`}
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
