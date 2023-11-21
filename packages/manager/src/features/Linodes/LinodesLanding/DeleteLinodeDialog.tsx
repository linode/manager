import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import {
  useDeleteLinodeMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { subnetQueryKey, vpcQueryKey } from 'src/queries/vpcs';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

import { getVPCsFromLinodeConfigs } from './utils';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteLinodeDialog = (props: Props) => {
  const queryClient = useQueryClient();
  const flags = useFlags();
  const { data: account } = useAccount();

  const enableVPCActions = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const { linodeId, onClose, onSuccess, open } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: configs } = useAllLinodeConfigsQuery(
    linodeId ?? -1,
    linodeId !== undefined && open && enableVPCActions
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
    const vpcIds = enableVPCActions
      ? getVPCsFromLinodeConfigs(configs ?? [])
      : [];
    // @TODO VPC: potentially revisit using the linodeEventsHandler in linode/events.ts to invalidate queries rather than here
    // See PR #9814 for more details
    if (vpcIds.length > 0) {
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
