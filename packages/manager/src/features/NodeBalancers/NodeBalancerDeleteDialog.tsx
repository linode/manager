import {
  useNodebalancerDeleteMutation,
  useNodeBalancerQuery,
} from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

interface Props {
  id: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NodeBalancerDeleteDialog = (props: Props) => {
  const { id, onSuccess, onClose } = props;

  const {
    data: nodebalancer,
    error: entityError,
    isLoading,
  } = useNodeBalancerQuery(id);

  const { error, isPending, mutateAsync } = useNodebalancerDeleteMutation(id);

  const label = nodebalancer?.label;

  const onDelete = async () => {
    await mutateAsync();
    onSuccess?.();
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'NodeBalancer',
        error: entityError,
      }}
      errors={error}
      expand
      label={'NodeBalancer Label'}
      loading={isPending || isLoading}
      onClick={onDelete}
      onClose={onClose}
      open
      title={`Delete ${label ?? 'Unknown'}?`}
      typographyStyle={{ marginTop: '20px' }}
    >
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          Deleting this NodeBalancer is permanent and can’t be undone.
        </Typography>
      </Notice>
      <Typography variant="body1">
        Traffic will no longer be routed through this NodeBalancer. Please check
        your DNS settings and either provide the IP address of another active
        NodeBalancer, or route traffic directly to your Linode.
      </Typography>
    </TypeToConfirmDialog>
  );
};
