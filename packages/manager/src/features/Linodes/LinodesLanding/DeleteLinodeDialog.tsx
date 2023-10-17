import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useDeleteLinodeMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { vpcQueryKey, subnetQueryKey } from 'src/queries/vpcs';

import { getVPCsFromLinodeConfigs } from './utils';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteLinodeDialog = (props: Props) => {
  const queryClient = useQueryClient();
  const { linodeId, onClose, onSuccess, open } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: configs } = useAllLinodeConfigsQuery(
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
    const vpcIds = getVPCsFromLinodeConfigs(configs ?? []);
    if (vpcIds) {
      queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
      // invalidate data for specific vpcs this linode is assigned to
      vpcIds.forEach((vpcId) => {
        queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcId]);
        queryClient.invalidateQueries([
          vpcQueryKey,
          'vpc',
          vpcId,
          subnetQueryKey,
        ]);
      });
    }
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
